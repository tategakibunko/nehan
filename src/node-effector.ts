import {
  Config,
  HtmlElement,
  Display,
  CssCascade,
  CssParser,
  CssFontSize,
  CssEdgeSize,
  CssBoxSize,
  CssPhysicalBoxSize,
  CssBorderWidth,
  CssLineHeight,
  CssPosition,
  LogicalSize,
  LogicalEdge,
  LogicalEdgeDirection,
  LogicalEdgeDirections,
  LogicalBorderRadius,
  BoxDimension,
  PseudoElement,
  ReplacedElement,
  PhysicalSize,
  WritingMode,
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

  // If value is 'auto', leave it as is.
  // If value is not 'auto', use it as 'computed value',
  // In layouting phase, the value may be different depending on the box constraints(called 'used value').
  private setMargin(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `margin-${direction}`;
      const value = CssCascade.getValue(element, `margin-${direction}`);
      const computedValue = value === "auto" ? value : new CssEdgeSize(value, direction).computeSize(element) + "px";
      element.computedStyle.setProperty(prop, computedValue);
    });
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

  private setMeasure(element: HtmlElement) {
    const value = CssCascade.getValue(element, "measure");
    const computedValue = (value === "auto") ? value : new CssBoxSize(value, "measure").computeSize(element) + "px";
    element.computedStyle.setProperty("measure", computedValue);
  }

  private setExtent(element: HtmlElement) {
    const value = CssCascade.getValue(element, "measure");
    const computedValue = (value === "auto") ? value : new CssBoxSize(value, "extent").computeSize(element) + "px";
    element.computedStyle.setProperty("extent", computedValue);
  }

  private setMinMeasure(element: HtmlElement) {
    const value = CssCascade.getValue(element, "min-measure");
    const computedValue = (value === "none") ? value : new CssBoxSize(value, "measure").computeSize(element) + "px";
    element.computedStyle.setProperty("min-measure", computedValue);
  }

  private setMaxMeasure(element: HtmlElement) {
    const value = CssCascade.getValue(element, "max-measure");
    const computedValue = (value === "none") ? value : new CssBoxSize(value, "measure").computeSize(element) + "px";
    element.computedStyle.setProperty("max-measure", computedValue);
  }

  private setMinExtent(element: HtmlElement) {
    const value = CssCascade.getValue(element, "min-extent");
    const computedValue = (value === "none") ? value : new CssBoxSize(value, "extent").computeSize(element) + "px";
    element.computedStyle.setProperty("min-extent", computedValue);
  }

  private setMaxExtent(element: HtmlElement) {
    const value = CssCascade.getValue(element, "max-extent");
    const computedValue = (value === "none") ? value : new CssBoxSize(value, "extent").computeSize(element) + "px";
    element.computedStyle.setProperty("max-extent", computedValue);
  }

  private setWidth(element: HtmlElement, writingMode: WritingMode) {
    const value = CssCascade.getValue(element, "width");
    const computedValue = (value === "auto") ? value : new CssPhysicalBoxSize(value, "width", writingMode).computeSize(element) + "px";
    element.computedStyle.setProperty("width", computedValue);
  }

  private setHeight(element: HtmlElement, writingMode: WritingMode) {
    const value = CssCascade.getValue(element, "height");
    const computedValue = (value === "auto") ? value : new CssPhysicalBoxSize(value, "height", writingMode).computeSize(element) + "px";
    element.computedStyle.setProperty("height", computedValue);
  }

  private setPosition(element: HtmlElement, direction: LogicalEdgeDirection) {
    const value = CssCascade.getValue(element, direction);
    const computedValue = (value === "auto") ? value : new CssPosition(value, direction).computeSize(element) + "px";
    element.computedStyle.setProperty(direction, computedValue);
  }

  visit(element: HtmlElement) {
    if (element.isTextElement()) {
      return;
    }
    this.setCascadedValue(element, "display");
    const display = Display.load(element);
    if (display.isNone()) {
      return;
    }
    this.setCascadedValue(element, "writing-mode");
    const writingMode = WritingMode.load(element);

    this.setFontSize(element);
    this.setLineHeight(element);

    this.setPadding(element);
    this.setBorderWidth(element);
    this.setBorderStyle(element);
    this.setBorderColor(element);
    this.setBorderRadius(element);
    this.setMargin(element);
    this.setMeasure(element);
    this.setExtent(element);
    this.setMinMeasure(element);
    this.setMaxMeasure(element);
    this.setMinExtent(element);
    this.setMaxExtent(element);
    this.setWidth(element, writingMode);
    this.setHeight(element, writingMode);
    this.setPosition(element, "before");
    this.setPosition(element, "end");
    this.setPosition(element, "after");
    this.setPosition(element, "start");

    this.setCascadedValue(element, "float");
    this.setCascadedValue(element, "font-family");
    this.setCascadedValue(element, "font-style");
    this.setCascadedValue(element, "font-weight");
    this.setCascadedValue(element, "font-variant");
    this.setCascadedValue(element, "font-stretch");
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

  There are some properties that inherit percentage value by inherit.

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

  [todo]

  If element is absolutely posisioned,
  percentage size is caluclated with respect to size of 'padding-box'.
*/
export class CssUsedValueLoader implements NodeEffector {
  private getMinMeasure(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "min-measure");
    // if not none, it's already calculated as computed value.
    return value === "none" ? value : parseInt(value, 10);
  }

  private getMaxMeasure(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "max-measure");
    // if not none, it's already calculated as computed value.
    return value === "none" ? value : parseInt(value, 10);
  }

  private getMinExtent(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "min-extent");
    // if not none, it's already calculated as computed value.
    return value === "none" ? value : parseInt(value, 10);
  }

  private getMaxExtent(element: HtmlElement): "none" | number {
    const value = CssCascade.getValue(element, "max-extent");
    // if not none, it's already calculated as computed value.
    return value === "none" ? value : parseInt(value, 10);
  }

  private getMargin(element: HtmlElement, direction: LogicalEdgeDirection): "auto" | number {
    const value = CssCascade.getValue(element, `margin-${direction}`);
    // if not auto, it's already calculated as computed value.
    return value === "auto" ? value : parseInt(value, 10);
  }

  private getPadding(element: HtmlElement, direction: LogicalEdgeDirection): number {
    // already calculated as computed value.
    return parseInt(CssCascade.getValue(element, `padding-${direction}`), 10);
  }

  private getBorderWidth(element: HtmlElement, direction: LogicalEdgeDirection): number {
    // already calculated as computed value.
    return parseInt(CssCascade.getValue(element, `border-${direction}-width`), 10);
  }

  private getMeasure(element: HtmlElement): "auto" | number {
    const value = CssCascade.getValue(element, "measure");
    // if not auto, it's already calculated as computed value.
    return value === "auto" ? value : parseInt(value, 10);
  }

  private getExtent(element: HtmlElement): "auto" | number {
    const value = CssCascade.getValue(element, "extent");
    // if not auto, it's already calculated as computed value.
    return value === "auto" ? value : parseInt(value, 10);
  }

  private getRootMeasure(element: HtmlElement): number {
    const value = CssCascade.getValue(element, "measure");
    return value === "auto" ? Config.defaultBodyMeasure : new CssBoxSize(value, "measure").computeSize(element);
  }

  private getRootExtent(element: HtmlElement): number {
    const value = CssCascade.getValue(element, "extent");
    return value === "auto" ? Config.defaultBodyExtent : new CssBoxSize(value, "extent").computeSize(element);
  }

  private getParentMeasure(parentElement: HtmlElement): number {
    return parseInt(CssCascade.getValue(parentElement, "measure"), 10);
  }

  private getParentExtent(parentElement: HtmlElement): number {
    return parseInt(CssCascade.getValue(parentElement, "extent"), 10);
  }

  private getAttrSize(element: HtmlElement, dim: BoxDimension, writingMode: WritingMode): number {
    const value = element.getAttribute(dim) || "0";
    return new CssPhysicalBoxSize(value, dim, writingMode).computeSize(element);
  }

  private getWidth(element: HtmlElement, writingMode: WritingMode): "auto" | number {
    const attrSize = this.getAttrSize(element, "width", writingMode);
    if (attrSize > 0) {
      return attrSize;
    }
    const value = CssCascade.getValue(element, "width");
    // if it's not auto, already calculated as comupted value.
    return value === "auto" ? value : parseInt(value, 10);
  }

  private getHeight(element: HtmlElement, writingMode: WritingMode): "auto" | number {
    const attrSize = this.getAttrSize(element, "height", writingMode);
    if (attrSize > 0) {
      return attrSize;
    }
    const value = CssCascade.getValue(element, "height");
    // if it's not auto, already calculated as comupted value.
    return value === "auto" ? value : parseInt(value, 10);
  }

  private getPosition(element: HtmlElement, direction: LogicalEdgeDirection): "auto" | number {
    const value = CssCascade.getValue(element, direction);
    // if it's not auto, already calculated as comupted value.
    return value === "auto" ? value : parseInt(value, 10);
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
    const width = this.getWidth(element, writingMode); // required by replaced-element only
    const height = this.getHeight(element, writingMode); // required by replaced-element only
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
    const parentMeasure = element.parent ? this.getParentMeasure(element.parent) : this.getRootMeasure(element);
    const parentExtent = element.parent ? this.getParentExtent(element.parent) : this.getRootExtent(element);
    let usedMeasure = measure === "auto" ? 0 : measure;
    let usedExtent = extent === "auto" ? 0 : extent;
    let usedMarginStart = 0, usedMarginEnd = 0;
    let usedMarginBefore = 0, usedMarginAfter = 0;

    const getBorderBoxEdgeMeasure = (): number => {
      return borderStartWidth + paddingStart + paddingEnd + borderEndWidth;
    };

    const getMarginBoxEdgeMeasure = (): number => {
      return usedMarginStart + borderStartWidth + paddingStart + paddingEnd + borderEndWidth + usedMarginEnd;
    };

    const applyMinMaxMeasure = () => {
      // constraint [usedMeasure < maxMeasure]
      if (maxMeasure !== "none") {
        usedMeasure = Math.min(usedMeasure, maxMeasure);
      }
      // constraint [usedMeasure > minMeasure]
      if (minMeasure !== "none") {
        usedMeasure = Math.max(usedMeasure, minMeasure);
      }
    }

    const applyMinMaxExtent = () => {
      // constraint [usedExtent < maxExtent]
      if (maxExtent !== "none") {
        usedExtent = Math.min(usedExtent, maxExtent);
      }
      // constraint [usedExtent > minExtent]
      if (minExtent !== "none") {
        usedExtent = Math.max(usedExtent, minExtent);
      }
    }

    // [compute measure]
    // url: https://www.w3.org/TR/CSS22/visudet.html#Computing_widths_and_margins

    // 1. inline && non-replaced elements
    if (isInlineLevel && !isRe) {
      // for inline element, width(measure), margin-* is not enable.
      usedMarginStart = usedMarginEnd = usedMarginBefore = usedMarginAfter = 0;
      element.computedStyle.setProperty("margin-start", "0");
      element.computedStyle.setProperty("margin-end", "0");
      element.computedStyle.setProperty("margin-before", "0");
      element.computedStyle.setProperty("margin-after", "0");
    }
    // 2. inline && replaced elements
    else if (isInlineLevel && isRe) {
      usedMarginStart = (marginStart === "auto") ? 0 : marginStart;
      usedMarginEnd = (marginEnd === "auto") ? 0 : marginEnd;
      usedMarginBefore = (marginBefore === "auto") ? 0 : marginBefore;
      usedMarginAfter = (marginAfter === "auto") ? 0 : marginAfter;
      if (measure === "auto" || width === "auto" || height === "auto") {
        throw new Error("auto size for replaced element is not supported yet!");
      }
      const logicalSize = new PhysicalSize({ width, height }).getLogicalSize(writingMode);
      usedMeasure = logicalSize.measure;
      usedExtent = logicalSize.extent;
      applyMinMaxMeasure();
      applyMinMaxExtent();
      const usedPhysicalSize = new LogicalSize({ measure: usedMeasure, extent: usedExtent }).getPhysicalSize(writingMode);
      element.computedStyle.setProperty("measure", usedMeasure + "px");
      element.computedStyle.setProperty("extent", usedExtent + "px");
      element.computedStyle.setProperty("width", usedPhysicalSize.width + "px");
      element.computedStyle.setProperty("height", usedPhysicalSize.height + "px");
      element.computedStyle.setProperty("margin-start", usedMarginStart + "px");
      element.computedStyle.setProperty("margin-end", usedMarginEnd + "px");
      element.computedStyle.setProperty("margin-before", usedMarginBefore + "px");
      element.computedStyle.setProperty("margin-after", usedMarginAfter + "px");
    }
    // 3. block & non-replaced elements
    else if (isBlockLevel && !isRe) {
      usedMarginBefore = (marginBefore === "auto") ? 0 : marginBefore;
      usedMarginAfter = (marginAfter === "auto") ? 0 : marginAfter;
      if (measure === "auto") {
        usedMarginStart = (marginStart === "auto") ? 0 : marginStart;
        usedMarginEnd = (marginEnd === "auto") ? 0 : marginEnd;
        usedMeasure = parentMeasure - getMarginBoxEdgeMeasure();
      } else {
        usedMeasure = measure;
        if (marginStart === "auto" || marginEnd === "auto") {
          const restSpaceSize = parentMeasure - usedMeasure - getBorderBoxEdgeMeasure();
          const autoMarginSize = Math.floor(Math.max(0, restSpaceSize) / 2);
          usedMarginStart = usedMarginEnd = autoMarginSize;
        }
      }
      if (extent !== "auto") {
        usedExtent = Math.min(extent, parentExtent);
      }
      if (usedMeasure + getMarginBoxEdgeMeasure() > parentMeasure) {
        usedMarginEnd = 0; // if horizontal-lr, vertical-rl(rtl for horizontal is not supported yet)
        if (usedMeasure + getMarginBoxEdgeMeasure() > parentMeasure) {
          usedMarginStart = parentMeasure - getBorderBoxEdgeMeasure();
        }
      }
      if (measure === "auto" && element.parent) {
        usedMeasure = parentMeasure - getMarginBoxEdgeMeasure();
      }
      applyMinMaxMeasure();
      applyMinMaxExtent();
      element.computedStyle.setProperty("measure", usedMeasure + "px");
      element.computedStyle.setProperty("extent", usedExtent + "px");
      element.computedStyle.setProperty("margin-start", usedMarginStart + "px");
      element.computedStyle.setProperty("margin-end", usedMarginEnd + "px");

      usedMarginBefore = (marginBefore === "auto") ? 0 : marginBefore;
      usedMarginAfter = (marginAfter === "auto") ? 0 : marginAfter;
      element.computedStyle.setProperty("margin-before", usedMarginBefore + "px");
      element.computedStyle.setProperty("margin-after", usedMarginAfter + "px");
    }
    // 4. block replaced element
    else if (isBlockLevel && isRe) {
      /*
      The used value of 'width' is determined as for inline replaced elements.
      Then the rules for non-replaced block-level elements are applied to determine the margins.
      */
      usedMarginBefore = (marginBefore === "auto") ? 0 : marginBefore;
      usedMarginAfter = (marginAfter === "auto") ? 0 : marginAfter;
      if (measure === "auto" || width === "auto" || height === "auto") {
        throw new Error("auto size for replaced element is not supported yet!");
      }
      const logicalSize = new PhysicalSize({ width, height }).getLogicalSize(writingMode);
      usedMeasure = logicalSize.measure;
      usedExtent = logicalSize.extent;
      applyMinMaxMeasure();
      applyMinMaxExtent();
      const usedPhysicalSize = new LogicalSize({ measure: usedMeasure, extent: usedExtent }).getPhysicalSize(writingMode);
      if (marginStart === "auto" || marginEnd === "auto") {
        const restSpaceSize = parentMeasure - usedMeasure - getBorderBoxEdgeMeasure();
        const autoMarginSize = Math.floor(Math.max(0, restSpaceSize) / 2);
        usedMarginStart = usedMarginEnd = autoMarginSize;
      }
      element.computedStyle.setProperty("measure", usedMeasure + "px");
      element.computedStyle.setProperty("extent", usedExtent + "px");
      element.computedStyle.setProperty("width", usedPhysicalSize.width + "px");
      element.computedStyle.setProperty("height", usedPhysicalSize.height + "px");
      element.computedStyle.setProperty("margin-start", usedMarginStart + "px");
      element.computedStyle.setProperty("margin-end", usedMarginEnd + "px");
      element.computedStyle.setProperty("margin-before", usedMarginBefore + "px");
      element.computedStyle.setProperty("margin-after", usedMarginAfter + "px");
    }
    // 5. floating, non-replaced elements
    else if (float !== "none" && !isRe) {
      usedMarginStart = (marginStart === "auto") ? 0 : marginStart;
      usedMarginEnd = (marginEnd === "auto") ? 0 : marginEnd;
      if (measure === "auto") {
        console.error("Float measure is not defined, shrink to fit width is not supported yet.")
      } else {
        usedMeasure = parentMeasure - getMarginBoxEdgeMeasure();
        element.computedStyle.setProperty("measure", usedMeasure + "px");
        element.computedStyle.setProperty("margin-start", usedMarginStart + "px");
        element.computedStyle.setProperty("margin-end", usedMarginEnd + "px");
      }
    }
    // 6. floating, replaced elements
    else if (float !== "none" && isRe) {
      usedMarginStart = (marginStart === "auto") ? 0 : marginStart;
      usedMarginEnd = (marginEnd === "auto") ? 0 : marginEnd;
      const physicalSize = PhysicalSize.load(element);
      const logicalSize = physicalSize.getLogicalSize(writingMode);
      usedMeasure = logicalSize.measure;
      usedExtent = logicalSize.extent;
      applyMinMaxMeasure();
      applyMinMaxExtent();
      element.computedStyle.setProperty("measure", usedMeasure + "px");
      element.computedStyle.setProperty("extent", usedExtent + "px");
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
