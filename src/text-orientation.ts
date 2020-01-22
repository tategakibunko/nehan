import {
  Utils,
  HtmlElement,
  CssCascade,
  BasicStyle,
} from "./public-api";

export enum TextOrientationValue {
  MIXED = "mixed",
  UPRIGHT = "upright",
  SIDEWAYS = "sideways",
}

export class TextOrientation {
  public value: string;
  static values: string[] = Utils.Enum.toValueArray(TextOrientationValue);

  static load(element: HtmlElement): TextOrientation {
    let value = CssCascade.getValue(element, "text-orientation");
    return new TextOrientation(value);
  }

  constructor(value: string) {
    this.value = BasicStyle.selectOrDefault(
      "text-orientation", value, TextOrientation.values
    );
  }

  public isSideways(): boolean {
    return this.value === TextOrientationValue.SIDEWAYS;
  }

  public isUpright(): boolean {
    return this.value === TextOrientationValue.UPRIGHT;
  }

  public isMixed(): boolean {
    return this.value === TextOrientationValue.MIXED;
  }
}
