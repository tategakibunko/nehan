import {
  NehanElement,
  CssCascade,
} from "./public-api";

export type TextOrientationValue = "mixed" | "upright" | "sideways"

export class TextOrientation {
  public value: TextOrientationValue;

  static load(element: NehanElement): TextOrientation {
    let value = CssCascade.getValue(element, "text-orientation");
    return new TextOrientation(value as TextOrientationValue);
  }

  constructor(value: TextOrientationValue) {
    this.value = value;
  }

  public isSideways(): boolean {
    return this.value === "sideways";
  }

  public isUpright(): boolean {
    return this.value === "upright";
  }

  public isMixed(): boolean {
    return this.value === "mixed";
  }
}
