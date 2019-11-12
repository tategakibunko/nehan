import {
  TextEmphasisStyle,
  PropValue,
  CssText,
  CssCascade,
  HtmlElement,
} from "./public-api";

export class TextEmphasis {
  public style!: TextEmphasisStyle;
  public color!: string;

  static parseShorthand(css_text: CssText): PropValue<string, string>[] {
    let vals = css_text.split();
    let declr: PropValue<string, string>[] = [];
    if (css_text.value === "none" || vals.length === 0) {
      return declr;
    }
    let stroke = "", mark = "", color = "";
    vals.forEach(value => {
      if (TextEmphasisStyle.isStrokeValue(value)) {
        stroke = value;
      } else if (TextEmphasisStyle.isMarkValue(value)) {
        mark = value;
      } else {
        color = value;
      }
    });
    let style = [stroke, mark].join(" ").trim();
    if (style !== "") {
      declr.push({ prop: "text-emphasis-style", value: style });
    }
    if (color !== "") {
      declr.push({ prop: "text-emphasis-color", value: color });
    }
    return declr;
  }

  static load(element: HtmlElement): TextEmphasis {
    let text_empha = new TextEmphasis();
    text_empha.style = TextEmphasisStyle.load(element);
    text_empha.color = TextEmphasis.loadColor(element);
    return text_empha;
  }

  static loadColor(element: HtmlElement): string {
    return CssCascade.getValue(element, "text-emphasis-color");
  }

  // can't create directly.
  protected constructor() {
  }

  public get text(): string {
    return this.style.text;
  }

  public isNone(): boolean {
    return this.style.isNone();
  }
}
