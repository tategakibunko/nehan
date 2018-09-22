import {
  SpaceChar,
  HtmlElement,
  Utils,
  CssCascade,
  DefaultCss,
} from "./public-api";

export enum ListStyleTypeValue {
  NONE = "none",
  DISC = "disc",
  CIRCLE = "circle",
  SQUARE = "square",
  DECIMAL = "decimal",
}

/*
interface ListMarkerInfo {
  name: string,
  isNumeric: boolean,
  isDecimal: boolean,
}
*/

let MarkerText: {[keyword: string]: string} = {
  "none":SpaceChar.markerSpace,
  "disc":"\u2022",   // BULLET(U+2022)
  "circle":"\u25E6", // WHITE BULLET(U+25E6)
  "square":"\u25AA", // BLACK SMALL SQUARE(U+25AA)
}

export class ListStyleType {
  public value: ListStyleTypeValue;
  static values: string [] = Utils.Enum.toValueArray(ListStyleTypeValue);

  static load(element: HtmlElement): ListStyleType {
    let value = CssCascade.getValue(element, "list-style-type");
    return new ListStyleType(value as ListStyleTypeValue);
  }

  constructor(value: ListStyleTypeValue){
    this.value = DefaultCss.selectOrDefault(
      "list-style-type", value, ListStyleType.values
    ) as ListStyleTypeValue;
  }

  public isTcyMarker(): boolean {
    return this.value === ListStyleTypeValue.DECIMAL;
  }

  public getMarkerText(index: number): string {
    switch(this.value){
    case ListStyleTypeValue.NONE:
    case ListStyleTypeValue.DISC:
    case ListStyleTypeValue.CIRCLE:
    case ListStyleTypeValue.SQUARE:
      return MarkerText[this.value];

    case ListStyleTypeValue.DECIMAL:
      return String(index + 1) + ".";
    default: // TODO
      return MarkerText[ListStyleTypeValue.DISC];
    }
  }
}
