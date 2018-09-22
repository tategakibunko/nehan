import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
} from "./public-api";

export enum ListStylePositionValue {
  INSIDE = "inside",
  OUTSIDE = "outside"
}

export class ListStylePosition {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(ListStylePositionValue);

  constructor(value: ListStylePositionValue){
    this.value = DefaultCss.selectOrDefault(
      "list-style-position", value, ListStylePosition.values
    );
  }

  public isOutside(): boolean {
    return this.value === ListStylePositionValue.OUTSIDE;
  }

  public isInside(): boolean {
    return this.value === ListStylePositionValue.INSIDE;
  }

  static load(element: HtmlElement): ListStylePosition {
    let value = CssCascade.getValue(element, "list-style-position");
    return new ListStylePosition(value as ListStylePositionValue);
  }
}

