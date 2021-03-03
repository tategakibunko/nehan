import {
  TextEmphasisStyle,
  PropValue,
  CssText,
  CssCascade,
  NehanElement,
} from "./public-api";

export interface TextEmphaData {
  text: string;
  styles: string[];
  scale: number;
}

export class TextEmphasis {
  public style!: TextEmphasisStyle;
  public color!: string;

  static parseShorthand(cssText: CssText): PropValue<string, string>[] {
    let vals = cssText.split();
    let declr: PropValue<string, string>[] = [];
    if (cssText.value === "none" || vals.length === 0) {
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

  static load(element: NehanElement): TextEmphasis {
    let textEmpha = new TextEmphasis();
    textEmpha.style = TextEmphasisStyle.load(element);
    textEmpha.color = TextEmphasis.loadColor(element);
    return textEmpha;
  }

  static loadColor(element: NehanElement): string {
    return CssCascade.getValue(element, "text-emphasis-color");
  }

  // can't create directly.
  protected constructor() { }

  public get textEmphaData(): TextEmphaData {
    return {
      text: this.text,
      styles: this.style.values,
      scale: this.style.scale,
    };
  }

  public get text(): string {
    return this.style.text;
  }

  public isNone(): boolean {
    return this.style.isNone();
  }
}
