import {
  Utils,
  BasicStyle,
  HtmlElement,
  CssCascade,
} from "./public-api";

export enum OverflowWrapValue {
  // if single word overflow line-max, just overflow,
  // otherwise start new line.
  // [this is]
  // [toolong]wooooooord <- overflow
  NORMAL = "normal",

  // if single word overflow line-max, breaks word.
  // [this is]
  // [toolong] <- break word
  // [woooooo] <- break word
  // [ord    ]
  BREAK_WORD = "break-word"
}

export class OverflowWrap {
  public value: string;
  static values: string[] = Utils.Enum.toValueArray(OverflowWrapValue);

  constructor(value: OverflowWrapValue) {
    this.value = BasicStyle.selectOrDefault(
      "overflow-wrap", value, OverflowWrap.values
    );
  }

  static load(element: HtmlElement): OverflowWrap {
    let value = CssCascade.getValue(element, "overflow-wrap");
    return new OverflowWrap(value as OverflowWrapValue);
  }

  public isNormal(): boolean {
    return this.value === OverflowWrapValue.NORMAL;
  }

  public isBreakWord(): boolean {
    return this.value === OverflowWrapValue.BREAK_WORD;
  }
}
