import {
  Utils,
  BasicStyle,
  HtmlElement,
  CssCascade,
} from "./public-api";

export enum TextJustifyValue {
  NONE = "none",
  AUTO = "auto",
  INTER_WORD = "inter-word", // English, Korean
  INTER_CHARACTER = "inter-character", // Japanese
}

export class TextJustify {
  public value: string;
  static values: string[] = Utils.Enum.toValueArray(TextJustifyValue);

  constructor(value: TextJustifyValue) {
    this.value = BasicStyle.selectOrDefault(
      "text-justify", value, TextJustify.values
    );
  }

  static load(element: HtmlElement): TextJustify {
    let value = CssCascade.getValue(element, "text-justify");
    return new TextJustify(value as TextJustifyValue);
  }

  public isNone(): boolean {
    return this.value === TextJustifyValue.NONE;
  }

  public isAuto(): boolean {
    return this.value === TextJustifyValue.AUTO;
  }

  public isJustifyWord(): boolean {
    return this.value === TextJustifyValue.INTER_WORD;
  }

  public isJustifyCharacter(): boolean {
    return this.value === TextJustifyValue.INTER_CHARACTER;
  }

  public isJustifySpacing(): boolean {
    return this.isJustifyWord() || this.isJustifyCharacter();
  }
}
