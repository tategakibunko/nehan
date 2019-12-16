import {
  Config,
  HtmlElement,
  Display,
  DefaultCss,
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
  Sweep out invalid block from inline children.

  [example]

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
  static instance = new InvalidBlockSweeper();
  private constructor() { }

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
  Load cascading specified value.
*/
export class SpecifiedValueLoader implements NodeEffector {
  static instance = new SpecifiedValueLoader();
  private constructor() { }

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

/*
  Load dynamic value after normal specified value loaded.
*/
export class SpecifiedDynamicValueLoader implements NodeEffector {
  static instance = new SpecifiedDynamicValueLoader();
  private constructor() { }

  visit(element: HtmlElement) {
    const dynamicStyle = element.style.getDynamicStyle(element);
    element.style.mergeFrom(dynamicStyle);
  }
}

/*
  Load inline style value after normal/dynamic value loaded.
*/
export class SpecifiedInlineValueLoader implements NodeEffector {
  static instance = new SpecifiedInlineValueLoader();
  private constructor() { }

  visit(element: HtmlElement) {
    const inlineStyleSrc = element.getAttribute("style") || "";
    const inlineStyle = CssParser.parseInlineStyle(inlineStyleSrc);
    element.style.mergeFrom(inlineStyle);
  }
}

/*
  Load computed value that can be calculated directly from specified value.
*/
export class CssComputedValueLoader implements NodeEffector {
  static instance = new CssComputedValueLoader();
  private constructor() { }

  private getCascadedValue(element: HtmlElement, prop: string): string {
    const computedValue = element.computedStyle.getPropertyValue(prop);
    if (computedValue) {
      return computedValue;
    }
    const specValue = element.style.getPropertyValue(prop);
    if (specValue && specValue !== "inherit") {
      return specValue;
    }
    const defaultCss = DefaultCss.get(prop);
    if (defaultCss.inherit && element.parent && (!specValue || specValue === "inherit")) {
      return this.getCascadedValue(element.parent, prop);
    }
    return defaultCss.initial;
  }

  private getFontSize(element: HtmlElement): number {
    let value = this.getCascadedValue(element, "font-size");
    let size = new CssFontSize(value).computeSize(element);
    return size;
  }

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
      return parseInt(DefaultStyle.get("body", "extent"), 10);
    }
    return specValue === "auto" ? specValue : new CssBoxExtent(specValue).computeSize(element);
  }

  /*
    Suppose that font-size is '10px'.
    
    If line-height is '2em', it's calculated to 20px, and children inherit line-height '20px'(as number)
    If line-height is '2.0', is's calculated to 20px, and children inherit line-height '2.0'(as string)

    So we have to keep 'line-height' string-typed.
  */
  private getLineHeightString(element: HtmlElement): string {
    const specValue = this.getCascadedValue(element, "line-height");
    const cssLineHeight = new CssLineHeight(specValue);
    const size = cssLineHeight.computeSize(element);
    if (cssLineHeight.hasUnit()) { // if there is some unit included, px value is already confirmed.
      return size + "px";
    }
    return String(size); // remain float value
  }

  private getMarginSize(element: HtmlElement, prop: string): number | string {
    const value = this.getCascadedValue(element, prop);
    return value === "auto" ? value : new CssEdgeSize(value, prop).computeSize(element);
  }

  private getEdgeSize(element: HtmlElement, prop: string): number {
    const value = this.getCascadedValue(element, prop);
    return new CssEdgeSize(value, prop).computeSize(element);
  }

  private getBorderWidth(element: HtmlElement, prop: string): number {
    const value = this.getCascadedValue(element, prop);
    return new CssBorderWidth(value, prop).computeSize(element);
  }

  private setCascadedValue(element: HtmlElement, prop: string): string {
    let value = this.getCascadedValue(element, prop);
    element.computedStyle.setProperty(prop, value);
    return value;
  }

  private setFontSize(element: HtmlElement) {
    const fontSize = this.getFontSize(element);
    element.computedStyle.setProperty("font-size", fontSize + "px");
  }

  private setLineHeight(element: HtmlElement) {
    const lineHeightStr = this.getLineHeightString(element);
    element.computedStyle.setProperty("line-height", lineHeightStr);
  }

  private setMeasure(element: HtmlElement) {
    const cascadedValue = this.getMeasure(element);
    const computedValue = cascadedValue === "auto" ? cascadedValue : cascadedValue + "px";
    element.computedStyle.setProperty("measure", computedValue);
  }

  private setExtent(element: HtmlElement) {
    const cascadedValue = this.getExtent(element);
    const computedValue = cascadedValue === "auto" ? cascadedValue : cascadedValue + "px";
    element.computedStyle.setProperty("extent", computedValue);
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
      const value = this.getCascadedValue(element, prop);
      element.computedStyle.setProperty(prop, value);
    });
  }

  private setBorderColor(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `border-${direction}-color`;
      const value = this.getCascadedValue(element, prop);
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
      const value = this.getCascadedValue(element, direction);
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
    this.setLineHeight(element);

    // if defined as font size only, skip other css value.
    if (Config.fontSizeOnlyTags.indexOf(element.tagName) >= 0) {
      return;
    }

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

/*
  Compute used-value(auto, inherit, percent) for 'measure', 'extent', 'margin' etc.

  [example]

  <body style="measure:100px">
    <div style="measure:auto">
      100px
      <div style="measure:50%">
        50px(50% of parent=100px)
        <div style="measure:inherit">
          25px(inherit=50% of parent=50px)
          Note that inherited value of 'inherit' is specified value(50%), not computed value(50px).
        </div>
      </div>
    </div>
  </body>
*/
export class CssUsedValueLoader implements NodeEffector {
  static instance = new CssUsedValueLoader();
  private constructor() { }

  private setAutoValue(element: HtmlElement) { }

  visit(element: HtmlElement) {
    this.setAutoValue(element);
  }
}

// TODO
// optimize element order of float element.
// (inline+ float) -> (float inline+)
export class FloatOptimizer implements NodeEffector {
  static instance = new FloatOptimizer();
  private constructor() { }

  visit(element: HtmlElement) {
  }
}
