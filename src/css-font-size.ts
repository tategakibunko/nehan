import {
  Utils,
  Config,
  CssLength,
  HtmlElement,
  FlowContext,
  FontSizeKeywords,
  FontSizeKeywordSize,
  FontSizeKeywordsRelative,
  FontSizeKeywordRelativeSize
} from "./public-api";

export class CssFontSize extends CssLength {
  constructor(css_text: string) {
    super(css_text);
  }

  public computeKeywordSize(element: HtmlElement): number | null {
    // xx-small, x-small, small, medium, large, x-large, xx-large
    if (FontSizeKeywords.indexOf(this.cssText) >= 0) {
      return FontSizeKeywordSize[this.cssText];
    }
    // smaller, larger
    if (FontSizeKeywordsRelative.indexOf(this.cssText) >= 0) {
      let rel_value = FontSizeKeywordRelativeSize[this.cssText];
      return new CssFontSize(rel_value).computeSize(element);
    }
    return null;
  }

  public computeInitialSize(element: HtmlElement): number {
    return Config.defaultFontSize;
  }

  // compute from 'parent' font-size.
  public computeEmBasePx(element: HtmlElement): number {
    let parent = element.parent;
    if (!parent) {
      return CssLength.getRemBasePx(element.ownerDocument.body);
    }
    let font_size = parent.computedStyle.getPropertyValue("font-size");
    if (font_size) {
      return Utils.atoi(font_size, 10);
    }
    return Config.defaultFontSize;
  }

  public computePercentSize(element: HtmlElement, parent_ctx?: FlowContext): number {
    let percent = this.floatValue;
    let base_size = this.computeEmBasePx(element);
    return base_size * percent / 100;
  }
}
