import {
  Config,
  NehanElement,
  CssCascade,
  PositionValue,
  LogicalPadding,
  LogicalBorderWidth,
  LogicalBorderWidthKeywordSize,
  WritingMode,
  FontSizeKeywords,
  FontSizeKeywordsRelative,
  FontSizeKeywordSize,
  FontSizeKeywordRelativeSize,
} from "./public-api";

export const CssLengthUnits = ["%", "em", "rem", "px", "pt", "vw", "vh"];

export type OptionalBoxLengthProps =
  "min-measure" |
  "max-measure" |
  "min-extent" |
  "max-extent"

export type AutableBoxLengthProps =
  "measure" |
  "extent" |
  "width" |
  "height" |
  "start" |
  "end" |
  "before" |
  "after" |
  "margin-start" |
  "margin-end" |
  "margin-before" |
  "margin-after"

function getContainingBlock(element: NehanElement): NehanElement {
  const position = CssCascade.getValue(element, "position") as PositionValue;
  if (position === "static") {
    return element.parent || element.ownerDocument.body;
  }
  let parent = element.parent;
  while (parent) {
    const parentPos = CssCascade.getValue(parent, "position") as PositionValue;
    if (parentPos === "absolute" || parentPos === "relative") {
      break;
    }
    parent = parent.parent;
  }
  return parent || element.ownerDocument.body;
}

export class CssLength {
  static hasUnit(value: string): boolean {
    return CssLengthUnits.find(unit => value.endsWith(unit)) !== undefined;
  }

  static computeRootFontSize(element: NehanElement): number {
    const value = CssCascade.getValue(element.ownerDocument.body, "font-size");
    return this.computeFontSize(element.ownerDocument.body, value);
  }

  static computeContainingMeasure(contElement: NehanElement): number {
    const contentMeasure = parseInt(CssCascade.getValue(contElement, "measure"));
    const position = CssCascade.getValue(contElement, "position") as PositionValue;
    if (position === "static") {
      return contentMeasure;
    }
    const padding = LogicalPadding.load(contElement);
    return contentMeasure + padding.measure;
  }

  static computeContainingExtent(contElement: NehanElement): number {
    const contentExtent = parseInt(CssCascade.getValue(contElement, "extent"));
    const position = CssCascade.getValue(contElement, "position") as PositionValue;
    if (position === "static") {
      return contentExtent;
    }
    const padding = LogicalPadding.load(contElement);
    return contentExtent + padding.extent;
  }

  static computeParentFontSize(element: NehanElement): number {
    if (!element.parent) {
      return Config.defaultFontSize;
    }
    return parseInt(CssCascade.getValue(element.parent, "font-size"));
  }

  static computeFontSize(element: NehanElement, directValue?: string): number {
    const value = directValue || CssCascade.getValue(element, "font-size");
    if (value.endsWith("em")) {
      const ratio = parseFloat(value);
      const baseSize = this.computeParentFontSize(element);
      return Math.floor(ratio * baseSize);
    }
    if (value.endsWith("rem")) {
      const ratio = parseFloat(value);
      const baseSize = this.computeRootFontSize(element);
      return Math.floor(ratio * baseSize);
    }
    if (value.endsWith("px")) {
      return parseInt(value);
    }
    if (value.endsWith("pt")) {
      return Math.floor(parseInt(value) * 4 / 3);
    }
    if (value.endsWith("%")) {
      const baseSize = this.computeParentFontSize(element);
      return Math.floor(baseSize * parseFloat(value) / 100);
    }
    if (FontSizeKeywordsRelative.includes(value)) {
      return this.computeFontSize(element, FontSizeKeywordRelativeSize[value] || "1.0em");
    }
    if (FontSizeKeywords.includes(value)) {
      return FontSizeKeywordSize[value];
    }
    return Config.defaultFontSize;
  }

  /*
    [Notice]
    Note that computed value of 'line-height' is '${number}px' | '${float}'.

    Suppose that font-size is '10px'.

    If line-height is '2em', it's calculated to 20px, and children inherit line-height '20px'(as number)
    If line-height is '2.0', is's calculated to 20px, and children inherit line-height '2.0'(as string)

    So we have to keep 'line-height' string-typed.

    [Example]
    element1.computedValue.getProperty("line-height") => '2.0'
    element2.computedValue.getProperty("line-height") => '16px'
  */
  static computeLineHeight(element: NehanElement, directValue?: string): string {
    const value = directValue || CssCascade.getValue(element, "line-height");
    if (value === "normal") {
      return String(Config.defaultLineHeight);
    }
    if (value.endsWith("em")) {
      const ratio = parseFloat(value);
      const fontSizeValue = CssCascade.getValue(element, "font-size");
      const baseSize = this.computeFontSize(element, fontSizeValue);
      return Math.floor(ratio * baseSize) + "px";
    }
    if (value.endsWith("rem") || value.endsWith("px") || value.endsWith("pt")) {
      return this.computeFontSize(element, value) + "px"
    }
    if (value.endsWith("vw") || value.endsWith("vh")) {
      return this.computeBoxLength(element, "line-height", value) + "px";
    }
    if (value.endsWith("%")) {
      const ratio = parseFloat(value);
      const fontSizeValue = CssCascade.getValue(element, "font-size");
      const baseSize = this.computeFontSize(element, fontSizeValue);
      return Math.floor(ratio * baseSize / 100) + "px";
    }
    // if float value without unit, keep it as float value.
    return String(parseFloat(value));
  }

  static computeBaseBoxLength(element: NehanElement, prop: string): number {
    const contElement = getContainingBlock(element);
    const isVert = WritingMode.load(element).isTextVertical();
    switch (prop) {
      case "width":
        return isVert ? this.computeContainingExtent(contElement) : this.computeContainingMeasure(contElement);
      case "height":
        return isVert ? this.computeContainingMeasure(contElement) : this.computeContainingExtent(contElement);
      case "measure":
      case "min-measure":
      case "max-measure":
      case "start":
      case "end":
      case "padding-start":
      case "padding-end":
      case "margin-start":
      case "margin-end":
      case "border-start-width":
      case "border-end-width":
        return this.computeContainingMeasure(contElement);
      case "extent":
      case "min-extent":
      case "max-extent":
      case "before":
      case "after":
      case "padding-before":
      case "padding-after":
      case "margin-after":
      case "margin-before":
      case "border-before-width":
      case "border-after-width":
        return this.computeContainingExtent(contElement);
    }
    return 0;
  }

  // (min|max)-(measure|extent)
  static computeOptionalBoxLength(element: NehanElement, prop: OptionalBoxLengthProps, directValue?: string): number | "none" {
    const value = directValue || CssCascade.getValue(element, prop);
    if (value === "none") {
      return "none";
    }
    return this.computeBoxLength(element, prop, value);
  }

  // margin-xxx, measure, extent, width, height, start, end, before, after
  static computeAutableBoxLength(element: NehanElement, prop: AutableBoxLengthProps, directValue?: string): number | "auto" {
    const value = directValue || CssCascade.getValue(element, prop);
    if (value === "auto") {
      return value;
    }
    return this.computeBoxLength(element, prop, value);
  }

  // padding, border-width, border-radius
  static computeBoxLength(element: NehanElement, prop: string, directValue?: string): number {
    const value = directValue || CssCascade.getValue(element, prop);
    if (value.endsWith("em")) {
      const ratio = parseFloat(value);
      const baseSize = this.computeFontSize(element); // compute with respect to 'current' font-size(not parent font-size).
      return Math.floor(ratio * baseSize);
    }
    if (value.endsWith("rem") || value.endsWith("px") || value.endsWith("pt")) {
      return this.computeFontSize(element, value);
    }
    if (value.endsWith("vw")) {
      const ratio = parseFloat(value);
      const baseSize = window.innerWidth;
      return Math.floor(ratio * baseSize);
    }
    if (value.endsWith("vh")) {
      const ratio = parseFloat(value);
      const baseSize = window.innerHeight;
      return Math.floor(ratio * baseSize);
    }
    if (value.endsWith("%")) {
      const ratio = parseFloat(value);
      const baseSize = this.computeBaseBoxLength(element, prop);
      return Math.floor(ratio * baseSize / 100);
    }
    return parseFloat(value);
  }

  static computeBorderWidth(element: NehanElement, prop: string, directValue?: string): number {
    const value = directValue || CssCascade.getValue(element, prop);
    if (LogicalBorderWidth.keywords.includes(value)) {
      return LogicalBorderWidthKeywordSize[value];
    }
    return this.computeBoxLength(element, prop, value);
  }

  static computeBorderRadius(element: NehanElement, prop: string, directValue?: string): number {
    throw new Error("todo(compute border radius)");
  }
}
