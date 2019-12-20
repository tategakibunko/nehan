import {
  Config,
  HtmlElement,
  Display,
  CssCascade,
  CssParser,
  CssFontSize,
  CssEdgeSize,
  CssBoxSize,
  CssBorderWidth,
  CssLineHeight,
  CssInlinePosition,
  CssBlockPosition,
  LogicalSize,
  LogicalEdge,
  LogicalEdgeDirection,
  LogicalEdgeDirections,
  LogicalBorderRadius,
  PseudoElement,
  ReplacedElement,
  PhysicalSize,
  WritingMode,
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

  private setPadding(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      let prop = `padding-${direction}`;
      let size = this.getEdgeSize(element, prop);
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
      this.setPadding(element);
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
    this.setCascadedValue(element, "position"); // static, relative, absolute

    // Use 'text-align:justify' instead.
    // this.setCascadedValue(element, "text-justify");
  }
}

/*
  Compute used-value(auto, inherit, percent) for 'measure', 'extent', 'margin' etc.
  These props have it's constraints, and thus, decided by other extra rule or property.

  [warning]

  There are some properties that inherit percent value by inherit.

  quote from [https://www.w3.org/TR/CSS2/changes.html#q21.36]
  > Since computed value of a property can now also be a percentage.
  > In particular, the following properties now inherit the percentage if the specified value is a percentage.
  > Note that only 'text-indent' inherits by default, the others only inherit if the 'inherit' keyword is specified.

  > background-position
  > before, end, after, start
  > extent, measure,
  > margin-***,
  > min-extent, min-measure
  > padding-***,
  > text-indent

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

  private getMinMeasure(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "min-measure");
    return value === "none" ? value : new CssBoxSize(value, "measure").computeSize(element);
  }

  private getMaxMeasure(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "max-measure");
    return value === "none" ? value : new CssBoxSize(value, "measure").computeSize(element);
  }

  private getMinExtent(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "min-extent");
    return value === "none" ? value : new CssBoxSize(value, "extent").computeSize(element);
  }

  private getMaxExtent(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "max-extent");
    return value === "none" ? value : new CssBoxSize(value, "extent").computeSize(element);
  }

  private getMargin(element: HtmlElement, direction: LogicalEdgeDirection): "auto" | number {
    const value = CssCascade.getValue(element, `margin-${direction}`);
    return value === "auto" ? value : new CssEdgeSize(value, direction).computeSize(element);
  }

  private getPadding(element: HtmlElement, direction: LogicalEdgeDirection): number {
    return parseInt(CssCascade.getValue(element, `padding-${direction}`), 10);
  }

  private getBorderWidth(element: HtmlElement, direction: LogicalEdgeDirection): number {
    const value = CssCascade.getValue(element, `border-${direction}-width`);
    return new CssEdgeSize(value, direction).computeSize(element);
  }

  private getMeasure(element: HtmlElement): "auto" | number {
    const value = CssCascade.getValue(element, "measure");
    return value === "auto" ? value : new CssBoxSize(value, "measure").computeSize(element);
  }

  private getExtent(element: HtmlElement): "auto" | number {
    const value = CssCascade.getValue(element, "extent");
    return value === "auto" ? value : new CssBoxSize(value, "extent").computeSize(element);
  }

  private getPosition(element: HtmlElement, direction: LogicalEdgeDirection): "auto" | number {
    const value = CssCascade.getValue(element, direction);
    return value === "auto" ? value : LogicalEdge.isInlineEdge(direction) ?
      new CssInlinePosition(value).computeSize(element) :
      new CssBlockPosition(value).computeSize(element);
  }

  private getParentMeasure(element: HtmlElement): number {
    if (!element.parent) {
      return parseInt(CssCascade.getSpecValue(element, "measure"), 10);
    }
    return parseInt(CssCascade.getValue(element.parent, "measure"), 10);
  }

  private getParentExtent(element: HtmlElement): number {
    if (!element.parent) {
      return parseInt(CssCascade.getSpecValue(element, "extent"), 10);
    }
    return parseInt(CssCascade.getValue(element.parent, "extent"), 10);
  }

  private getParentLogicalSize(element: HtmlElement): LogicalSize {
    return new LogicalSize({
      measure: this.getParentMeasure(element),
      extent: this.getParentExtent(element)
    });
  }

  /*
  private getAttrPhysicalSize(element: HtmlElement, writingMode: WritingMode): PhyiscalSize {
    const attrWidth = element.getAttribute("width");
    const attrHeight = element.getAttribute("height");
  }
  */

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
    const isRe = ReplacedElement.isReplacedElement(element);
    const isBlockLevel = display.isBlockLevel();
    const isInlineLevel = display.isInlineLevel();
    const isInlineBlock = display.isInlineBlockFlow();
    const float = element.computedStyle.getPropertyValue("float");
    const writingMode = WritingMode.load(element);
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
    const borderStartWidth = this.getBorderWidth(element, "start");
    const borderEndWidth = this.getBorderWidth(element, "end");
    const borderBeforeWidth = this.getBorderWidth(element, "before");
    const borderAfterWidth = this.getBorderWidth(element, "after");
    const paddingBefore = this.getPadding(element, "before");
    const paddingAfter = this.getPadding(element, "after");
    const start = this.getPosition(element, "start");
    const end = this.getPosition(element, "end");
    const before = this.getPosition(element, "before");
    const after = this.getPosition(element, "after");
    const position = CssCascade.getValue(element, "position");
    const parentMeasure = this.getParentMeasure(element);
    const parentExtent = this.getParentExtent(element);
    let finalMeasure = measure === "auto" ? 0 : measure;
    let finalExtent = extent === "auto" ? 0 : extent;
    let finalMarginStart = 0, finalMarginEnd = 0;
    let finalMarginBefore = 0, finalMarginAfter = 0;

    // TODO
    // const width = new CssBoxWidth(value).computeSize(element)
    // const height = new CssBoxHeight(value).computeSize(element)

    const getBorderBoxEdgeMeasure = (): number => {
      return borderStartWidth + paddingStart + paddingEnd + borderEndWidth;
    };

    const getMarginBoxEdgeMeasure = (): number => {
      return finalMarginStart + borderStartWidth + paddingStart + paddingEnd + borderEndWidth + finalMarginEnd;
    };

    const applyMinMaxMeasure = () => {
      // constraint [finalMeasure < maxMeasure]
      if (maxMeasure !== "none") {
        finalMeasure = Math.min(finalMeasure, maxMeasure);
      }
      // constraint [finalMeasure > minMeasure]
      if (minMeasure !== "none") {
        finalMeasure = Math.max(finalMeasure, minMeasure);
      }
    }

    const applyMinMaxExtent = () => {
      // constraint [finalExtent < maxExtent]
      if (maxExtent !== "none") {
        finalExtent = Math.min(finalExtent, maxExtent);
      }
      // constraint [finalExtent > minExtent]
      if (minExtent !== "none") {
        finalExtent = Math.max(finalExtent, minExtent);
      }
    }

    // [compute measure]
    // url: https://www.w3.org/TR/CSS22/visudet.html#Computing_widths_and_margins

    // 1. inline && non-replaced elements
    if (isInlineLevel && !isRe) {
      // for inline element, width(measure), margin-* is not enable.
      finalMarginStart = finalMarginEnd = finalMarginBefore = finalMarginAfter = 0;
      element.computedStyle.setProperty("margin-start", "0");
      element.computedStyle.setProperty("margin-end", "0");
      element.computedStyle.setProperty("margin-before", "0");
      element.computedStyle.setProperty("margin-after", "0");
    }
    // 2. inline && replaced elements
    else if (isInlineLevel && isRe) {
      finalMarginStart = (marginStart === "auto") ? 0 : marginStart;
      finalMarginEnd = (marginEnd === "auto") ? 0 : marginEnd;
      const physicalSize = PhysicalSize.load(element);
      const logicalSize = physicalSize.getLogicalSize(writingMode);
      finalMeasure = logicalSize.measure;
      finalExtent = logicalSize.extent;
      applyMinMaxMeasure();
      applyMinMaxExtent();
      element.computedStyle.setProperty("measure", logicalSize.measure + "px");
      element.computedStyle.setProperty("extent", logicalSize.extent + "px");
    }
    // 3. block & non-replaced elements
    else if (isBlockLevel && !isRe) {
      if (measure === "auto") {
        finalMarginStart = marginStart === "auto" ? 0 : marginStart;
        finalMarginEnd = marginEnd === "auto" ? 0 : marginEnd;
        finalMeasure = parentMeasure - getMarginBoxEdgeMeasure();
      } else {
        finalMeasure = measure;
        if (marginStart === "auto" || marginEnd === "auto") {
          const restSpaceSize = parentMeasure - finalMeasure - getBorderBoxEdgeMeasure();
          const autoMarginSize = Math.floor(Math.max(0, restSpaceSize) / 2);
          finalMarginStart = finalMarginEnd = autoMarginSize;
        }
      }
      if (finalMeasure + getMarginBoxEdgeMeasure() > parentMeasure) {
        finalMarginEnd = 0; // if horizontal-lr, vertical-rl(rtl for horizontal is not supported yet)
        if (finalMeasure + getMarginBoxEdgeMeasure() > parentMeasure) {
          finalMarginStart = parentMeasure - getBorderBoxEdgeMeasure();
        }
      }
      if (measure === "auto" && element.parent) {
        finalMeasure = parentMeasure - getMarginBoxEdgeMeasure();
      }
      applyMinMaxMeasure();
      element.computedStyle.setProperty("measure", finalMeasure + "px");
      element.computedStyle.setProperty("margin-start", finalMarginStart + "px");
      element.computedStyle.setProperty("margin-end", finalMarginEnd + "px");

      finalMarginBefore = (marginBefore === "auto") ? 0 : marginBefore;
      finalMarginAfter = (marginAfter === "auto") ? 0 : marginAfter;
      element.computedStyle.setProperty("margin-before", finalMarginBefore + "px");
      element.computedStyle.setProperty("margin-after", finalMarginAfter + "px");

      if (extent !== "auto") {
        finalExtent = extent;
        applyMinMaxExtent();
        element.computedStyle.setProperty("extent", finalExtent + "px");
      }
    }
    // 4. block replaced element
    else if (isBlockLevel && isRe) {
      /* 
      The used value of 'width' is determined as for inline replaced elements. 
      Then the rules for non-replaced block-level elements are applied to determine the margins.
      */
    }
    // 5. floating, non-replaced elements
    else if (float !== "none" && !isRe) {
      finalMarginStart = (marginStart === "auto") ? 0 : marginStart;
      finalMarginEnd = (marginEnd === "auto") ? 0 : marginEnd;
      if (measure === "auto") {
        console.error("Float measure is not defined, shrink to fit width is not supported yet.")
      } else {
        finalMeasure = parentMeasure - getMarginBoxEdgeMeasure();
        element.computedStyle.setProperty("measure", finalMeasure + "px");
        element.computedStyle.setProperty("margin-start", finalMarginStart + "px");
        element.computedStyle.setProperty("margin-end", finalMarginEnd + "px");
      }
    }
    // 6. floating, replaced elements
    else if (float !== "none" && isRe) {
      finalMarginStart = (marginStart === "auto") ? 0 : marginStart;
      finalMarginEnd = (marginEnd === "auto") ? 0 : marginEnd;
      const physicalSize = PhysicalSize.load(element);
      const logicalSize = physicalSize.getLogicalSize(writingMode);
      finalMeasure = logicalSize.measure;
      finalExtent = logicalSize.extent;
      applyMinMaxMeasure();
      applyMinMaxExtent();
      element.computedStyle.setProperty("measure", finalMeasure + "px");
      element.computedStyle.setProperty("extent", finalExtent + "px");
    }
    // 7. abs positioned, non-replaced elements
    else if (position === "absolute" && !isRe) {
    }
    // 8. abs positioned, replaced elements
    else if (position === "absolute" && isRe) {
    }
    // 9. inline-block, non-replaced elements
    else if (isInlineBlock && !isRe) {
    }
    // 10. inline-block, replaced elements
    else if (isInlineBlock && isRe) {
    }
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
