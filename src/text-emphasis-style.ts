import {
  Utils,
  CssText,
  HtmlElement,
  CssCascade,
} from "./public-api";

const StrokeValues = ["filled", "open", "none"]
const Strokes = Utils.Enum.fromArray(StrokeValues)
export type TextEmphasisStroke = keyof typeof Strokes
const DefaultStroke: TextEmphasisStroke = "none"

const MarkValues = ["dot", "circle", "double-circle", "triangle", "sesame"]
const Marks = Utils.Enum.fromArray(MarkValues)
export type TextEmphasisMark = keyof typeof Marks
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
    return StrokeValues.includes(value);
  }

  static isMarkValue(value: string): value is TextEmphasisMark {
    return MarkValues.includes(value);
  }

  static load(element: HtmlElement): TextEmphasisStyle {
    const value = CssCascade.getValue(element, this.property);
    const cssText = new CssText({ prop: this.property, value: value });
    const cssValues = cssText.split();
    const stroke: TextEmphasisStroke = cssValues.find(val => this.isStrokeValue(val)) || DefaultStroke;
    const mark: TextEmphasisMark | undefined = cssValues.find(val => this.isMarkValue(val)) || DefaultMark;
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
