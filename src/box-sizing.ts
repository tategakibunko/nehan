import {
  HtmlElement,
  CssCascade,
} from './public-api'

type BoxSizingValue = "content-box" | "padding-box" | "border-box"

export class BoxSizing {
  constructor(private value: BoxSizingValue) {
  }

  static load(element: HtmlElement): BoxSizing {
    const value = CssCascade.getValue(element, "box-sizing");
    return new BoxSizing(value as BoxSizingValue);
  }

  isContentBox(): boolean {
    return this.value === "content-box";
  }

  isPaddingBox(): boolean {
    return this.value === "padding-box";
  }

  isBorderBox(): boolean {
    return this.value === "border-box";
  }
}