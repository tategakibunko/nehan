import {
  Config,
  Utils,
  HtmlElement,
  CssUnitType,
  CssUnitTypeName
} from "./public-api";

export class CssLength {
  public cssText: string;
  public unitTypeName: CssUnitTypeName;

  constructor(css_text: string) {
    this.cssText = this.normalize(css_text);
    this.unitTypeName = CssUnitType.inferName(this.cssText);
  }

  private normalize(css_text: string): string {
    return css_text.toLowerCase().trim();
  }

  public hasUnit(): boolean {
    return this.unitTypeName !== "none";
  }

  public get floatValue(): number {
    return parseFloat(this.cssText);
  }

  static getRemBasePx(element: HtmlElement): number {
    let doc = element.ownerDocument;
    let font_size = doc.body.computedStyle.getPropertyValue("font-size");
    if (!font_size) {
      return Config.defaultFontSize;
    }
    let rem_size = Utils.atoi(font_size, 10);
    return rem_size;
  }

  // except 'font-size' value, base size is compute by font-size of 'current' box.
  // note that 'font-size' must be calculated by 'parent' font-size.
  // (see CssFontSize::computeEmBasePx)
  public computeEmBasePx(element: HtmlElement): number {
    let parent = element.parent;
    if (!parent) {
      return CssLength.getRemBasePx(element.ownerDocument.body);
    }
    let font_size = element.computedStyle.getPropertyValue("font-size");
    if (font_size) {
      return Utils.atoi(font_size, 10);
    }
    return Config.defaultFontSize;
  }

  public computeSize(element: HtmlElement): number {
    let baseSize;
    switch (this.unitTypeName) {
      case "percent":
        return this.computePercentSize(element);
      case "px":
        return Math.floor(this.floatValue);
      case "pt":
        return Math.floor(this.floatValue * 4 / 3);
      case "em":
        baseSize = this.computeEmBasePx(element);
        return Math.floor(this.floatValue * baseSize);
      case "rem":
        baseSize = CssLength.getRemBasePx(element);
        return Math.floor(this.floatValue * baseSize);
      case "vw":
        baseSize = window.innerWidth;
        return Math.floor(baseSize * (this.floatValue / 100));
      case "vh":
        baseSize = window.innerHeight;
        return Math.floor(baseSize * (this.floatValue / 100));
    }
    if (Utils.isNumber(this.cssText)) {
      return this.floatValue;
    }
    let size = this.computeKeywordSize(element);
    if (size !== null) {
      return size;
    }
    console.warn(`CssLength: initial size is used for (${this.cssText})!`);
    return this.computeInitialSize(element);
  }

  public computeKeywordSize(element: HtmlElement): number | null {
    return null;
  }

  public computeParentSize(element: HtmlElement): number {
    throw new Error("CssLength::computeParentSize must be overrided.");
  }

  public computeInitialSize(element: HtmlElement): number {
    throw new Error("CssLength::getInitialSize must be overrided");
  }

  public computePercentSize(element: HtmlElement): number {
    throw new Error("CssLength::getPercentSize must be overrided");
  }
}

