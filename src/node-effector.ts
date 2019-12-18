import {
  Config,
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
  ReplacedElement,
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

  private getFontSize(element: HtmlElement): number {
    let value = CssCascade.getValue(element, "font-size");
    let size = new CssFontSize(value).computeSize(element);
    return size;
  }

  /*
    Suppose that font-size is '10px'.
    
    If line-height is '2em', it's calculated to 20px, and children inherit line-height '20px'(as number)
    If line-height is '2.0', is's calculated to 20px, and children inherit line-height '2.0'(as string)

    So we have to keep 'line-height' string-typed.
  */
  private getLineHeightString(element: HtmlElement): string {
    const specValue = CssCascade.getValue(element, "line-height");
    const cssLineHeight = new CssLineHeight(specValue);
    const size = cssLineHeight.computeSize(element);
    if (cssLineHeight.hasUnit()) { // if there is some unit included, px value is already confirmed.
      return size + "px";
    }
    return String(size); // remain float value
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

  private setLineHeight(element: HtmlElement) {
    const lineHeightStr = this.getLineHeightString(element);
    element.computedStyle.setProperty("line-height", lineHeightStr);
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

  visit(element: HtmlElement) {
    if (element.isTextElement()) {
      return;
    }
    const display = this.setCascadedValue(element, "display");
    if (display === "none") {
      return;
    }
    this.setFontSize(element);
    this.setLineHeight(element);

    if (!Config.edgeSkipTags.includes(element.tagName)) {
      this.setBorderWidth(element);
      this.setBorderStyle(element);
      this.setBorderColor(element);
      this.setBorderRadius(element);
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
    this.setCascadedValue(element, "position");

    // Use 'text-align:justify' instead.
    // this.setCascadedValue(element, "text-justify");
  }
}

/*
  Compute used-value(auto, inherit, percent) for 'measure', 'extent', 'margin' etc.
  These props have it's constraints, and thus, decided by other extra rule or property.

  [target prop]

  background-position
  before, end, after, start
  extent, measure,
  margin-***,
  min-extent, min-measure
  padding-***,
  text-indent

  [warning]

  In these props(measure, extent, margin etc), percent value is kept percent value by 'inherit'.

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

  private getMinMeasure(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "min-measure");
    return value === "none" ? value : new CssBoxMeasure(value).computeSize(element);
  }

  private getMaxMeasure(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "max-measure");
    return value === "none" ? value : new CssBoxMeasure(value).computeSize(element);
  }

  private getMinExtent(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "min-extent");
    return value === "none" ? value : new CssBoxExtent(value).computeSize(element);
  }

  private getMaxExtent(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "max-extent");
    return value === "none" ? value : new CssBoxExtent(value).computeSize(element);
  }

  private getMargin(element: HtmlElement, direction: LogicalEdgeDirection): "auto" | number {
    const value = CssCascade.getValue(element, `margin-${direction}`);
    return value === "auto" ? value : new CssEdgeSize(value, direction).computeSize(element);
  }

  private getPadding(element: HtmlElement, direction: LogicalEdgeDirection): number {
    const value = CssCascade.getValue(element, `padding-${direction}`);
    return new CssEdgeSize(value, direction).computeSize(element);
  }

  private getMeasure(element: HtmlElement): "auto" | number {
    const value = CssCascade.getValue(element, "measure");
    return value === "auto" ? value : new CssBoxMeasure(value).computeSize(element);
  }

  private getExtent(element: HtmlElement): "auto" | number {
    const value = CssCascade.getValue(element, "extent");
    return value === "auto" ? value : new CssBoxExtent(value).computeSize(element);
  }

  private getPosition(element: HtmlElement, direction: LogicalEdgeDirection): "auto" | number {
    const value = CssCascade.getValue(element, direction);
    return value === "auto" ? value : LogicalEdge.isInlineEdge(direction) ?
      new CssInlinePosition(value).computeSize(element) :
      new CssBlockPosition(value).computeSize(element);
  }

  visit(element: HtmlElement) {
    if (element.isTextElement()) {
      return;
    }
    if (Config.boxSizeSkipTags.indexOf(element.tagName) >= 0) {
      return;
    }
    const display = Display.load(element);
    if (display.isNone()) {
      return;
    }
    const float = element.computedStyle.getPropertyValue("float");
    const minMeasure = this.getMinMeasure(element);
    const maxMeasure = this.getMaxMeasure(element);
    const minExtent = this.getMinExtent(element);
    const maxExtent = this.getMaxExtent(element);
    const measure = this.getMeasure(element);
    const extent = this.getExtent(element);
    const marginStart = this.getMargin(element, "start");
    const marginEnd = this.getMargin(element, "end");
    const marginBefore = this.getMargin(element, "before");
    const marginAfter = this.getMargin(element, "after");
    const paddingStart = this.getPadding(element, "start");
    const paddingEnd = this.getPadding(element, "end");
    const paddingBefore = this.getPadding(element, "before");
    const paddingAfter = this.getPadding(element, "after");
    const isRe = ReplacedElement.isReplacedElement(element);
    const position = CssCascade.getValue(element, "position");

    let finalMeasure = measure === "auto" ? 0 : measure;
    let finalMarginStart = 0, finalMarginEnd = 0;

    // https://www.w3.org/TR/CSS22/visudet.html#Computing_widths_and_margins

    // 1. inline && non-replaced elements
    if (display.isInlineLevel() && !isRe) {
    }
    // 2. inline && replaced elements
    else if (display.isInlineLevel() && isRe) {
    }
    // 3. block & non-replaced elements
    else if (display.isBlockLevel() && !isRe) {
    }
    // 4. block replaced element
    else if (display.isBlockLevel() && isRe) {
    }
    // 5. floating, non-replaced elements
    else if (float !== "none" && !isRe) {
    }
    // 6. floating, replaced elements
    else if (float !== "none" && isRe) {
    }
    // 7. abs positioned, non-replaced elements
    else if (display.isInlineBlockFlow() && !isRe) {
    }
    // 8. abs positioned, replaced elements
    else if (display.isInlineBlockFlow() && isRe) {
    }
    // 9. inline-block, non-replaced elements
    else if (display.isInlineBlockFlow() && !isRe) {
    }
    // 10. inline-block, replaced elements
    else if (display.isInlineBlockFlow() && isRe) {
    }
    // constraint [finalMeasure < maxMeasure]
    if (maxMeasure !== "none") {
      finalMeasure = Math.min(finalMeasure, maxMeasure);
    }
    // constraint [finalMeasure > minMeasure]
    if (minMeasure !== "none") {
      finalMeasure = Math.max(finalMeasure, minMeasure);
    }
    if (measure === "auto") {
      if (marginStart === "auto") {
        finalMarginStart = 0;
      }
      if (marginEnd === "auto") {
        finalMarginEnd = 0;
      }
    }
    const inlineEdgeSize = finalMarginStart + paddingStart + paddingEnd + finalMarginEnd;
    if (measure === "auto" && element.parent) {
      const parentMeasure = parseInt(element.parent.computedStyle.getPropertyValue("measure") || "0");
      finalMeasure = parentMeasure - inlineEdgeSize;
    }
    element.computedStyle.setProperty("measure", finalMeasure + "px");
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
