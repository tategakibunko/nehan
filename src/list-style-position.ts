import {
  HtmlElement,
  CssCascade,
} from "./public-api";

export type ListStylePositionValue = "inside" | "outside"

export class ListStylePosition {
  public value: ListStylePositionValue;

  constructor(value: ListStylePositionValue) {
    this.value = value;
  }

  public isOutside(): boolean {
    return this.value === 'outside'
  }

  public isInside(): boolean {
    return this.value === 'inside';
  }

  static load(element: HtmlElement): ListStylePosition {
    let value = CssCascade.getValue(element, "list-style-position");
    return new ListStylePosition(value as ListStylePositionValue);
  }
}

