import {
  Config,
  HtmlElement,
  Display,
  CssRule,
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
  LogicalEdgeDirection,
  LogicalEdgeDirections,
  LogicalBorderRadius,
  BoxDimension,
  PseudoElement,
  PseudoElementTagName,
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

// Before css loading, create pseudo-elements defined in css,
// and initialize spec-styles for them.
export class PseudoElementInitializer implements NodeEffector {
  private pseudoRules: CssRule[];

  constructor(pseudoRules: CssRule[]) {
    this.pseudoRules = pseudoRules;
  }

  private findMarkerParent(element: HtmlElement): HtmlElement {
    let first_child = element.firstChild;
    if (!first_child || first_child.isTextElement()) {
      return element;
    }
    if (first_child.tagName === "img") {
      return element;
    }
    return this.findMarkerParent(first_child);
  }

  private addMarker(element: HtmlElement): HtmlElement {
    const markerParent = this.findMarkerParent(element);
    if (markerParent.tagName === "::marker") {
      return markerParent; // already created!
    }
    const markerElement = element.root.createElement("::marker");
    markerElement.parent = markerParent;
    markerParent.insertBefore(markerElement, markerParent.firstChild);
    return markerElement;
  }

  private addBefore(element: HtmlElement): HtmlElement {
    const before = element.root.createElement(PseudoElementTagName.BEFORE);
    element.insertBefore(before, element.firstChild);
    return before;
  }

  private addAfter(element: HtmlElement): HtmlElement {
    const after = element.root.createElement(PseudoElementTagName.AFTER);
    element.appendChild(after);
    return after;
  }

  private addFirstLine(element: HtmlElement): HtmlElement | null {
    const firstLine = element.root.createElement(PseudoElementTagName.FIRST_LINE);
    const firstTextNode = element.firstTextElement;
    if (!firstTextNode) {
      return null;
    }
    const targetParent = firstTextNode.parent;
    if (!targetParent) {
      return null;
    }
    firstLine.appendChild(firstTextNode);
    targetParent.replaceChild(firstLine, firstTextNode);
    return firstLine;
  }

  private addFirstLetter(element: HtmlElement): HtmlElement | null {
    const firstTextNode = element.firstTextElement;
    if (!firstTextNode) {
      return null;
    }
    const targetParent = firstTextNode.parent;
    if (!targetParent) {
      return null;
    }
    const text = firstTextNode.textContent;
    const trimText = text.trim();
    const target_text = (trimText.length > 1) ? trimText : text;
    const firstText = target_text.substring(0, 1);
    const nextText = text.substring(1);
    const firstLetter = element.root.createElement(PseudoElementTagName.FIRST_LETTER);
    firstLetter.appendChild(element.root.createTextNode(firstText));
    const nextNode = element.root.createTextNode(nextText);
    nextNode.appendChild(element.root.createTextNode(nextText));
    const baseNode = firstTextNode.nextSibling;
    targetParent.removeChild(firstTextNode);
    targetParent.insertBefore(nextNode, baseNode);
    targetParent.insertBefore(firstLetter, nextNode);
    return firstLetter;
  }

  private addPseudoElement(element: HtmlElement, peTagName: string): HtmlElement | null {
    switch (peTagName) {
      case PseudoElementTagName.MARKER:
        return this.addMarker(element);
      case PseudoElementTagName.BEFORE:
        return this.addBefore(element);
      case PseudoElementTagName.AFTER:
        return this.addAfter(element);
      case PseudoElementTagName.FIRST_LETTER:
        return this.addFirstLetter(element);
      case PseudoElementTagName.FIRST_LINE:
        return this.addFirstLine(element);
    }
    throw new Error("undefined pseudo element:" + peTagName);
  }

  visit(element: HtmlElement) {
    this.pseudoRules.forEach(rule => {
      // assert(rule.peSelector !== null)
      if (rule.test(element, true) && rule.peSelector) {
        const peName = rule.peSelector.tagName;
        const pe = element.querySelector(peName) || this.addPseudoElement(element, peName);
        if (pe) {
          pe.style.mergeFrom(rule.style);
        }
      }
    })
  }
}

/*
  CssLoader

  element
    .acceptNodeEffector(SpecifiedValueLoader.instance)
    .acceptNodeEffector(ComputedValueLoader.instance)
    .acceptNodeEffector(UsedValueLoader.instance)
*/

/*
  Load cascading specified value.
*/
export class SpecifiedValueLoader implements NodeEffector {
  static instance = new SpecifiedValueLoader();
  private constructor() { }

  visit(element: HtmlElement) {
    // spec-style of pseudo element is already initialized by PseudoElementInitializer.
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

// TODO
// optimize element order of float element.
// (inline+ float) -> (float inline+)
export class FloatOptimizer implements NodeEffector {
  static instance = new FloatOptimizer();
  private constructor() { }

  visit(element: HtmlElement) {
  }
}
