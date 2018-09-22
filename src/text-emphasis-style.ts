import {
  Utils,
  CssText,
  HtmlElement,
  CssCascade,
  DefaultCss,
} from "./public-api";

export enum TextEmphasisStroke {
  FILLED = "filled",
  OPEN = "open",
  NONE = "none"
}

export enum TextEmphasisMark {
  DOT = "dot",
  CIRCLE = "circle",
  DOUBLE_CIRCLE = "double-circle",
  TRIANGLE = "triangle",
  SESAME = "sesame"
}

export interface TextEmphasisStyleValue {
  stroke: TextEmphasisStroke,
  mark: TextEmphasisMark
}

let empha_marks: {[keyword: string]: string} = {
  "filled dot":"\u2022",
  "open dot":"\u25E6",
  "filled circle":"\u25CF",
  "open circle":"\u25CB",
  "filled double-circle":"\u25C9",
  "open double-circle":"\u25CE",
  "filled triangle":"\u25B2",
  "open triangle":"\u25B3",
  "filled sesame":"\uFE45",
  "open sesame":"\uFE46"
}

export class TextEmphasisStyle {
  public stroke: TextEmphasisStroke;
  public mark: TextEmphasisMark;

  static property: string = "text-emphasis-style";
  static strokes: string [] = Utils.Enum.toValueArray(TextEmphasisStroke);
  static marks: string [] = Utils.Enum.toValueArray(TextEmphasisMark);

  static isStrokeValue(value: string): boolean {
    return TextEmphasisStyle.strokes.indexOf(value) >= 0;
  }

  static isMarkValue(value: string): boolean {
    return TextEmphasisStyle.marks.indexOf(value) >= 0;
  }

  static parse(css_text: CssText): TextEmphasisStyleValue {
    let stroke = "", mark = "";
    css_text.split().forEach(value => {
      if(TextEmphasisStyle.isStrokeValue(value)){
	stroke = value;
      } else if(TextEmphasisStyle.isMarkValue(value)){
	mark = value;
      }
    });
    return {
      stroke:stroke as TextEmphasisStroke,
      mark:mark as TextEmphasisMark
    };
  }

  static load(element: HtmlElement): TextEmphasisStyle {
    let prop = "text-emphasis-style";
    let value = CssCascade.getValue(element, prop);
    let css_text = new CssText({prop:prop, value:value});
    let es_value = TextEmphasisStyle.parse(css_text);
    return new TextEmphasisStyle(es_value);
  }

  constructor(value: TextEmphasisStyleValue){
    this.stroke = DefaultCss.selectOrDefault(
      "text-emphasis-style-stroke", value.stroke, TextEmphasisStyle.strokes
    ) as TextEmphasisStroke;

    this.mark = (this.stroke === "none")? TextEmphasisMark.DOT : DefaultCss.selectOrDefault(
      "text-emphasis-style-mark", value.mark, TextEmphasisStyle.marks
    ) as TextEmphasisMark;
  }

  public get values(): string [] {
    return [this.stroke, this.mark];
  }

  public get value(): string {
    return this.values.join(" ");
  }

  public get text(): string {
    return empha_marks[this.value] || "\u2022";
  }

  public isNone(): boolean {
    return this.stroke === TextEmphasisStroke.NONE;
  }
}
