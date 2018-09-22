import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
} from "./public-api";

export enum WritingModeValue {
  HORIZONTAL_TB = "horizontal-tb",
  VERTICAL_RL = "vertical-rl",
  VERTICAL_LR = "vertical-lr"
}

export class WritingMode {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(WritingModeValue);

  constructor(value: WritingModeValue){
    this.value = DefaultCss.selectOrDefault(
      "writing-mode", value, WritingMode.values
    );
  }

  static load(element: HtmlElement): WritingMode {
    let value = CssCascade.getValue(element, "writing-mode");
    return new WritingMode(value as WritingModeValue);
  }

  public isVerticalRl(): boolean {
    return this.value === WritingModeValue.VERTICAL_RL;
  }

  public isTextVertical(): boolean {
    return this.value.indexOf("vertical") === 0;
  }

  public isTextHorizontal(): boolean {
    return this.value.indexOf("horizontal") === 0;
  }
}
