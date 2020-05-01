import {
  CssText,
  CssCascade,
  HtmlElement,
} from "./public-api";

export type TextEmphasisStroke = "filled" | "open" | "none"
const DefaultStroke: TextEmphasisStroke = "none"

export type TextEmphasisMark = "dot" | "circle" | "double-circle" | "triangle" | "sesame"
const DefaultMark: TextEmphasisMark = "dot"

const EmphaEncodeMaps: { [value: string]: string } = {
  "filled dot": "\u2022",
  "open dot": "\u25E6",
  "filled circle": "\u25CF",
  "open circle": "\u25CB",
  "filled double-circle": "\u25C9",
  "open double-circle": "\u25CE",
  "filled triangle": "\u25B2",
  "open triangle": "\u25B3",
  "filled sesame": "\uFE45",
  "open sesame": "\uFE46"
}

export class TextEmphasisStyle {
  public stroke: TextEmphasisStroke;
  public mark: TextEmphasisMark;
  static property: string = "text-emphasis-style";

  static isStrokeValue(value: string): value is TextEmphasisStroke {
    return value === "filled" || value === "open";
  }

  static isMarkValue(value: string): value is TextEmphasisMark {
    return value === "dot" || value === "circle" || value === "double-circle" || value === "triangle" || value === "sesame";
  }

  static load(element: HtmlElement): TextEmphasisStyle {
    const value = CssCascade.getValue(element, this.property);
    const cssText = new CssText({ prop: this.property, value: value });
    let stroke = DefaultStroke;
    let mark = DefaultMark;
    cssText.split().forEach(value => {
      if (this.isStrokeValue(value)) {
        stroke = value;
      } else if (this.isMarkValue(value)) {
        mark = value;
      }
    })
    return new TextEmphasisStyle(stroke, mark);
  }

  constructor(stroke: TextEmphasisStroke, mark: TextEmphasisMark) {
    this.stroke = stroke;
    this.mark = mark;
  }

  public get values(): string[] {
    return [this.stroke, this.mark];
  }

  public get scale(): number {
    switch (this.mark) {
      case "circle":
      case "double-circle":
      case "triangle":
      case "sesame":
        return 0.5;
    }
    return 1.0;
  }

  public get text(): string {
    const key = this.values.join(" ");
    return EmphaEncodeMaps[key] || "\u2022";
  }

  public isNone(): boolean {
    return this.stroke === 'none';
  }
}
