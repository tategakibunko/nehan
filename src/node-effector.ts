import {
  Config,
  HtmlElement,
  SpaceChar,
  Display,
  CssLength,
  CssRule,
  CssCascade,
  CssParser,
  FlowContext,
  LogicalEdgeDirections,
  LogicalBorderRadius,
  PseudoElement,
  PseudoElementTagName,
  OptionalBoxLengthProps,
  AutableBoxLengthProps,
  ComputedRegion,
  UsedRegionResolver,
  LogicalBoxEdge,
  LogicalFloat,
  WhiteSpace,
  ListStyle,
} from './public-api'
import { BorderCollapse } from './border-collapse';

// side effect visitor
export interface NodeEffector {
  visit: (element: HtmlElement) => void;
}

export class ListItemInitializer implements NodeEffector {
  static instance = new ListItemInitializer();
  private constructor() { }

  visit(element: HtmlElement) {
    const display = Display.load(element);
    if (!display.isListItem() || display.isNone() || !element.parent) {
      return;
    }
    const listStyle = ListStyle.load(element);
    if (listStyle.isNone()) {
      return;
    }
    let markerText = listStyle.getMarkerText(element.indexOfType);
    // if nested list-item exists, outer marker-text is set to space.
    if (element.querySelector("li")) {
      markerText = SpaceChar.markerSpace;
    }
    const listTextNode = element.ownerDocument.createTextNode(markerText);
    const markerElement = element.ownerDocument.createElement(PseudoElementTagName.MARKER);
    if (listStyle.isTcyMarker()) {
      markerElement.classList.add('tcy');
    }
    markerElement.appendChild(listTextNode);
    element.insertBefore(markerElement, element.firstChild);
  }
}

export class TableCellInitializer implements NodeEffector {
  static instance = new TableCellInitializer();
  private constructor() { }

  getCollapsedInternalEdgeSize(cellEdges: LogicalBoxEdge[], parentEdge: LogicalBoxEdge): number {
    let internalEdgeSize = cellEdges.reduce((sum, cellEdge, index) => {
      sum += cellEdge.padding.measure;
      return (index < cellEdges.length - 1) ? sum + Math.max(cellEdge.border.width.end, cellEdges[index + 1].border.width.start) : sum;
    }, 0);
    // if first or last border of cell is larger than parent one, it reduces parent content measure.
    internalEdgeSize += Math.max(0, cellEdges[0].border.width.start - parentEdge.border.width.start);
    internalEdgeSize += Math.max(0, cellEdges[cellEdges.length - 1].border.width.end - parentEdge.border.width.end);
    return internalEdgeSize;
  }

  visit(element: HtmlElement) {
    if (!element.parent || element.computedStyle.getPropertyValue("display") !== "table-cell") {
      return;
    }
    const cells = element.parent.children.filter(child => {
      return child.computedStyle.getPropertyValue("display") === "table-cell";
    });
    if (cells.every(cell => cell.computedStyle.getPropertyValue("measure") !== "auto")) {
      return; // already calculated
    }
    // Force set margin of table-cell to zero
    cells.forEach(cell => {
      LogicalEdgeDirections.forEach(dir => {
        cell.computedStyle.setProperty(`margin-${dir}`, "0");
      })
    });
    const parentEdge = LogicalBoxEdge.load(element.parent);
    const cellEdges = cells.map(cell => LogicalBoxEdge.load(cell));
    const borderCollapse = BorderCollapse.load(element);
    const internalEdgeSize = borderCollapse.isCollapse() ?
      this.getCollapsedInternalEdgeSize(cellEdges, parentEdge) :
      cellEdges.reduce((sum, cellEdge) => sum + cellEdge.measure, 0);
    const parentMeasure = parseInt(element.parent.computedStyle.getPropertyValue("measure") || "0", 10);
    const cellMeasures = cells.map(cell => {
      const measure = cell.computedStyle.getPropertyValue("measure") || "0";
      return (measure === "auto") ? 0 : parseInt(measure, 10);
    });
    const autoCells = cells.filter(cell => cell.computedStyle.getPropertyValue("measure") === "auto");
    const fixedCount = cells.length - autoCells.length;
    const fixedSize = cellMeasures.reduce((sum, size) => sum + size, 0);
    const autoSize = Math.max(Math.floor((parentMeasure - fixedSize - internalEdgeSize) / (cells.length - fixedCount)), 0);
    console.log(
      "cell size:(parent:%d, fixedSize:%d, fixedCount:%d, iedge:%d, auto:%d)",
      parentMeasure, fixedSize, fixedCount, internalEdgeSize, autoSize
    );
    autoCells.forEach(cell => cell.computedStyle.setProperty("measure", autoSize + "px"));
  }
}

/*
  Insert <br> between text node and block level element.

  [example]

  this is some text
  <p>foo</p>

  =>

  this is some text<br>
  <p>foo</p>
*/
export class TextNodeNormalizer implements NodeEffector {
  static instance = new TextNodeNormalizer();
  private constructor() { }

  visit(element: HtmlElement) {
    if (element.isTextElement()) {
      return;
    }
    const display = Display.load(element);
    const float = LogicalFloat.load(element);
    if (display.isInlineLevel() && float.isNone()) {
      return;
    }
    const prev = element.previousSibling;
    if (!prev) {
      return;
    }
    if (element.parent && prev.isTextElement()) {
      if (WhiteSpace.isWhiteSpaceElement(prev)) {
        console.info("remove white space before block tag");
        element.parent.removeChild(prev);
      } else {
        console.info("insert <br> before %o", element);
        element.parent.insertBefore(element.ownerDocument.createElement("br"), element);
      }
    }
  }
}

/*
  1. Insert rb tag if not defined in ruby.
  2. Remove rp tag if it exists.

  [example]

  <ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>
  
  =>
  
  <ruby><rb>漢字</rb><rt>かんじ</rt></ruby>
*/
export class RubyNormalizer implements NodeEffector {
  static instance = new RubyNormalizer();
  private constructor() { }

  visit(element: HtmlElement) {
    if (element.tagName !== "ruby") {
      return;
    }
    const doc = element.root;
    element.childNodes = element.childNodes.filter(node => {
      if (node.tagName === "rp") {
        return false;
      }
      if (node.isTextElement() && node.textContent.trim() === "") {
        return false;
      }
      return true;
    });
    element.childNodes.filter(node => node.isTextElement()).forEach(textNode => {
      const rb = doc.createElement("rb");
      rb.parent = element;
      rb.appendChild(textNode);
      element.replaceChild(rb, textNode);
    });
    // console.log("normalized ruby:", element);
  }
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

// Load specified value
// (document.styleSheets, element) => CssStyleDeclaration
export class CssSpecifiedValueLoader implements NodeEffector {
  static instance = new CssSpecifiedValueLoader();
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

// Load dynamic (specified) value before layouting.
// (CssStyleDeclaration, element) => CssStyleDeclaration
export class CssSpecifiedDynamicValueLoader implements NodeEffector {
  constructor(private parentCxt?: FlowContext) { }

  visit(element: HtmlElement) {
    // get dynamic specified values from style-declaration (already matched and stored by CssSpecifiedValueLoader).
    const dynamicStyle = element.style.getDynamicStyle(element, this.parentCxt);
    element.style.mergeFrom(dynamicStyle);

    // remove old value from current 'computed' styles.
    dynamicStyle.forEach((key, value) => {
      element.computedStyle.removeProperty(key);
    });
  }
}

// Load inline (specified) value.
// element.getAttribute("style") => CssStyleDeclaration
export class CssSpecifiedInlineValueLoader implements NodeEffector {
  static instance = new CssSpecifiedInlineValueLoader();
  private constructor() { }

  visit(element: HtmlElement) {
    const inlineStyleSrc = element.getAttribute("style") || "";
    const inlineStyle = CssParser.parseInlineStyle(inlineStyleSrc);
    element.style.mergeFrom(inlineStyle);
  }
}

// Load computed value that can be calculated directly from specified value.
export class CssComputedValueLoader implements NodeEffector {
  static instance = new CssComputedValueLoader();

  /*
    Suppose that font-size is '10px'.
    
    If line-height is '2em', it's calculated to 20px, and children inherit line-height '20px'(as number)
    If line-height is '2.0', is's calculated to 20px, and children inherit line-height '2.0'(as string)

    So we have to keep 'line-height' string-typed.
  */
  private getLineHeightString(element: HtmlElement): string {
    return CssLength.computeLineHeight(element);
  }

  private setCascadedValue(element: HtmlElement, prop: string): string {
    const value = CssCascade.getValue(element, prop);
    element.computedStyle.setProperty(prop, value);
    return value;
  }

  private setFontSize(element: HtmlElement) {
    const fontSize = CssLength.computeFontSize(element);
    element.computedStyle.setProperty("font-size", fontSize + "px");
  }

  private setLineHeight(element: HtmlElement) {
    const lineHeightStr = this.getLineHeightString(element);
    element.computedStyle.setProperty("line-height", lineHeightStr);
  }

  private setBoxLength(element: HtmlElement, prop: string) {
    const size = CssLength.computeBoxLength(element, prop);
    element.computedStyle.setProperty(prop, size + "px");
  }

  private setAutableBoxLength(element: HtmlElement, prop: AutableBoxLengthProps) {
    const size = CssLength.computeAutableBoxLength(element, prop);
    const value = (size === "auto") ? size : size + "px";
    element.computedStyle.setProperty(prop, value);
  }

  private setOptionalBoxLength(element: HtmlElement, prop: OptionalBoxLengthProps) {
    const size = CssLength.computeOptionalBoxLength(element, prop);
    const value = (size === "none") ? size : size + "px";
    element.computedStyle.setProperty(prop, value);
  }

  private setMargin(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      this.setAutableBoxLength(element, `margin-${direction}` as AutableBoxLengthProps);
    });
  }

  private setPadding(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      this.setBoxLength(element, `padding-${direction}`);
    });
  }

  private setBorderWidth(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `border-${direction}-width`;
      const size = CssLength.computeBorderWidth(element, prop);
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
      // [TODO] CssLength.computeBorderRadiusLength(element, prop)
      const size = CssLength.computeBoxLength(element, prop);
      element.computedStyle.setProperty(prop, size + "px");
    });
  }

  private setPosition(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      this.setAutableBoxLength(element, direction);
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

    if (Config.nonLayoutTags.includes(element.tagName)) {
      return;
    }

    this.setCascadedValue(element, "writing-mode");
    this.setFontSize(element);
    this.setLineHeight(element);

    if (Config.fontSizeOnlyTags.includes(element.tagName)) {
      return;
    }

    if (!Config.edgeSkipTags.includes(element.tagName)) {
      this.setPadding(element);
      this.setBorderWidth(element);
      this.setBorderStyle(element);
      this.setBorderColor(element);
      this.setBorderRadius(element);
    }

    if (!Config.boxSizeSkipTags.includes(element.tagName)) {
      this.setMargin(element);
      this.setPosition(element);
      this.setAutableBoxLength(element, "measure");
      this.setAutableBoxLength(element, "extent");
      this.setAutableBoxLength(element, "width");
      this.setAutableBoxLength(element, "height");
      this.setOptionalBoxLength(element, "min-measure");
      this.setOptionalBoxLength(element, "max-measure");
      this.setOptionalBoxLength(element, "min-extent");
      this.setOptionalBoxLength(element, "max-extent");
    }

    this.setCascadedValue(element, "box-sizing");
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
    this.setCascadedValue(element, "border-collapse");

    // Use 'text-align:justify' instead.
    // this.setCascadedValue(element, "text-justify");
  }
}

// Resolve and load used values for some 'none' or 'auto' of computed values.
export class CssUsedRegionLoader implements NodeEffector {
  static instance = new CssUsedRegionLoader();
  private constructor() { }

  visit(element: HtmlElement) {
    const display = Display.load(element);
    if (display.isNone()) {
      return;
    }
    if (Config.boxSizeSkipTags.includes(element.tagName)) {
      return;
    }
    const computedRegion = ComputedRegion.load(element);
    if (!computedRegion) {
      // console.warn("containing meausre for %s is not resolved", element.tagName);
      return;
    }
    const resolver = UsedRegionResolver.select(element);
    // console.log("[%s] resolver:%o", element.tagName, resolver);
    resolver.resolve(element, computedRegion);
    // console.log("[%s] measure is resolved to %o", element.tagName, computedRegion.logicalSize.measure.length);
    computedRegion.save(element.computedStyle);
  }
}
