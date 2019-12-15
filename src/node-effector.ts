import {
  Config,
  Utils,
  HtmlElement,
  Display,
  CssCascade,
  CssParser,
  CssFontSize,
  CssEdgeSize,
  CssBorderWidth,
  CssLineHeight,
  CssBoxMeasure,
  CssBoxExtent,
  CssInlinePosition,
  CssBlockPosition,
  LogicalEdge,
  LogicalEdgeDirection,
  LogicalEdgeDirections,
  LogicalBorderRadius,
  PseudoElement,
  DefaultStyle,
} from './public-api'

// treat side-effect
export interface NodeEffector {
  visit: (element: HtmlElement) => void;
}

/*
  # sweep out block from inline

  <div>
    <span>
      text1
      <p>foo</p>
      text2
      <p>bar</p>
      text3
    </span>
  </div>

  =>

  <div>
    <span>text1</span>
    <p>foo</p>
    <span>text2</span>
    <p>bar</p>
    <span>text3</span>
  </div>
*/
export class InvalidBlockSweeper implements NodeEffector {
  visit(inlineElement: HtmlElement) {
    const nodes = inlineElement.childNodes;
    const nextNode = inlineElement.nextSibling;
    for (let i = 0; i < nodes.length; i++) {
      const child = nodes[i];
      if (Display.load(child).isBlockLevel() && inlineElement.parent) {
        const headNodes = nodes.slice(0, i);
        const tailNodes = nodes.slice(i + 1);
        inlineElement.childNodes = headNodes;
        inlineElement.parent.insertBefore(child, nextNode);
        const inlineElement2 = inlineElement.clone();
        inlineElement2.parent = inlineElement.parent;
        tailNodes.forEach(child => inlineElement2.appendChild(child));
        this.visit(inlineElement2);
        inlineElement.parent.insertBefore(inlineElement2, nextNode);
        break;
      }
    }
  }
}

/*
  element
    .acceptNodeEffector(cssSpecifiedValueSetter)
    .acceptNodeEffector(cssDynamicValueSetter)
    .acceptNodeEffector(cssInlineValueSetter)
    .acceptNodeEffector(cssComputedValueSetter)
    .acceptNodeEffector(cssUsedValueSetter)
*/

export class SpecifiedValueSetter implements NodeEffector {
  visit(element: HtmlElement) {
    // pseudo element already get it's own styles while css matching.
    // See CssStyleSheet::getRulesOfElement in 'css-stylesheet.ts'
    if (element.isTextElement() || PseudoElement.isPseudoElement(element)) {
      return;
    }
    const specStyle = element.ownerDocument.specStyleSheet.getStyleOfElement(element);
    element.style = specStyle;
  }
}

export class SpecifiedDynamicValueSetter implements NodeEffector {
  visit(element: HtmlElement) {
    const dynamicStyle = element.style.getDynamicStyle(element);
    element.style.mergeFrom(dynamicStyle);
  }
}

export class SpecifiedInlineValueSetter implements NodeEffector {
  visit(element: HtmlElement) {
    const inlineStyleSrc = element.getAttribute("style") || "";
    const inlineStyle = CssParser.parseInlineStyle(inlineStyleSrc);
    element.style.mergeFrom(inlineStyle);
  }
}

export class CssComputedValueSetter implements NodeEffector {
  private getFontSize(element: HtmlElement): number {
    let value = CssCascade.getValue(element, "font-size");
    let size = new CssFontSize(value).computeSize(element);
    return size;
  }

  // todo: (margin: auto, measure: auto)
  private getMeasure(element: HtmlElement): "auto" | number {
    const specValue = this.setCascadedValue(element, "measure");
    if (element.tagName === "body" && specValue === "auto") {
      return parseInt(DefaultStyle.get("body", "measure"), 10);
    }
    return specValue === "auto" ? specValue : new CssBoxMeasure(specValue).computeSize(element);
  }

  private getExtent(element: HtmlElement): "auto" | number {
    const specValue = this.setCascadedValue(element, "extent");
    if (element.tagName === "body" && specValue === "auto") {
      return parseInt(DefaultStyle.get("body", "measure"), 10);
    }
    return specValue === "auto" ? specValue : new CssBoxExtent(specValue).computeSize(element);
  }

  private getLineHeightString(element: HtmlElement): string {
    const value = CssCascade.getValue(element, "line-height");
    const css_line_height = new CssLineHeight(value);
    const size = css_line_height.computeSize(element);
    if (css_line_height.hasUnit()) { // has unit, so px value is already confirmed.
      return size + "px";
    }
    return String(size); // remain float value
  }

  private getLineHeightPx(element: HtmlElement, em_size: number): number {
    const value = this.getLineHeightString(element);
    if (value.indexOf("px") < 0) {
      return Math.floor(em_size * parseFloat(value));
    }
    return Utils.atoi(value, 10);
  }

  private getMarginSize(element: HtmlElement, prop: string): number | string {
    const value = CssCascade.getValue(element, prop);
    return value === "auto" ? value : new CssEdgeSize(value, prop).computeSize(element);
  }

  private getEdgeSize(element: HtmlElement, prop: string): number {
    const value = CssCascade.getValue(element, prop);
    return new CssEdgeSize(value, prop).computeSize(element);
  }

  private getBorderWidth(element: HtmlElement, prop: string): number {
    const value = CssCascade.getValue(element, prop);
    return new CssBorderWidth(value, prop).computeSize(element);
  }

  private setCascadedValue(element: HtmlElement, prop: string): string {
    let value = CssCascade.getValue(element, prop);
    element.computedStyle.setProperty(prop, value);
    return value;
  }

  private setFontSize(element: HtmlElement) {
    const fontSize = this.getFontSize(element);
    element.computedStyle.setProperty("font-size", fontSize + "px");
  }

  private setMeasure(element: HtmlElement): "auto" | number {
    const value1 = this.getMeasure(element);
    const value2 = value1 === "auto" ? value1 : value1 + "px";
    element.computedStyle.setProperty("measure", value2);
    return value1;
  }

  private setExtent(element: HtmlElement): "auto" | number {
    const value1 = this.getExtent(element);
    const value2 = value1 === "auto" ? value1 : value1 + "px";
    element.computedStyle.setProperty("extent", value2);
    return value1;
  }

  private setPadding(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `padding-${direction}`;
      const size = this.getEdgeSize(element, prop);
      element.computedStyle.setProperty(prop, size + "px");
    });
  }

  private setBorderWidth(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `border-${direction}-width`;
      const size = this.getBorderWidth(element, prop);
      element.computedStyle.setProperty(prop, size + "px");
    });
  }

  private setBorderStyle(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `border-${direction}-style`;
      const value = CssCascade.getValue(element, prop);
      element.computedStyle.setProperty(prop, value);
    });
  }

  private setBorderColor(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `border-${direction}-color`;
      const value = CssCascade.getValue(element, prop);
      element.computedStyle.setProperty(prop, value);
    });
  }

  private setBorderRadius(element: HtmlElement) {
    LogicalBorderRadius.corners.forEach((corner: string) => {
      const prop = `border-${corner}-radius`;
      const size = this.getEdgeSize(element, prop);
      element.computedStyle.setProperty(prop, size + "px");
    });
  }

  private setMargin(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `margin-${direction}`;
      const size = this.getMarginSize(element, prop);
      element.computedStyle.setProperty(prop, size + "px");
    });
  }

  private setPosition(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const value = CssCascade.getValue(element, direction);
      if (value !== "auto") {
        const length = LogicalEdge.isInlineEdge(direction as LogicalEdgeDirection) ?
          new CssInlinePosition(value) : new CssBlockPosition(value);
        const size = length.computeSize(element);
        element.computedStyle.setProperty(direction, size + "px");
      }
    });
  }

  visit(element: HtmlElement) {
    if (element.isTextElement()) {
      return;
    }
    if (this.setCascadedValue(element, "display") === "none") {
      return;
    }
    this.setFontSize(element);

    if (Config.edgeSkipTags.indexOf(element.tagName) < 0) {
      this.setPadding(element);
      this.setBorderWidth(element);
      this.setBorderStyle(element);
      this.setBorderColor(element);
      this.setBorderRadius(element);
    }

    if (Config.boxSizeSkipTags.indexOf(element.tagName) < 0) {
      this.setMargin(element);
      this.setMeasure(element);
      this.setExtent(element);
      this.setPosition(element);
    }

    this.setCascadedValue(element, "float");
    this.setCascadedValue(element, "font-family");
    this.setCascadedValue(element, "font-style");
    this.setCascadedValue(element, "font-weight");
    this.setCascadedValue(element, "font-variant");
    this.setCascadedValue(element, "font-stretch");
    this.setCascadedValue(element, "writing-mode");
    this.setCascadedValue(element, "text-orientation");
    this.setCascadedValue(element, "text-combine-upright");
    this.setCascadedValue(element, "text-emphasis-style");
    this.setCascadedValue(element, "text-emphasis-color");
    this.setCascadedValue(element, "text-align");
    this.setCascadedValue(element, "vertical-align");
    this.setCascadedValue(element, "list-style-type");
    this.setCascadedValue(element, "list-style-position");
    this.setCascadedValue(element, "list-style-image");
    this.setCascadedValue(element, "content");
    this.setCascadedValue(element, "word-break");
    this.setCascadedValue(element, "overflow-wrap");
    this.setCascadedValue(element, "white-space");
    this.setCascadedValue(element, "page-break-before");
    this.setCascadedValue(element, "background-position");

    // Use 'text-align:justify' instead.
    // this.setCascadedValue(element, "text-justify");
  }
}

// prop: measure, extent, margin
// auto -> px
export class CssUsedValueSetter implements NodeEffector {
  visit(element: HtmlElement) {
  }
}

// TODO
// optimize element order of float element.
// (inline+ float) -> (float inline+)
export class FloatOptimizer implements NodeEffector {
  visit(element: HtmlElement) {
  }
}
