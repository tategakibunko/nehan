import {
  SpaceChar,
  HtmlElement,
  Utils,
  CssCascade,
} from "./public-api";

const TypeValues = ["none", "disc", "circle", "square", "decimal"];
const Types = Utils.Enum.fromArray(TypeValues);
export type ListStyleTypeValue = keyof typeof Types;

let MarkerText: { [keyword: string]: string } = {
  "none": SpaceChar.markerSpace,
  "disc": "\u2022",   // BULLET(U+2022)
  "circle": "\u25E6", // WHITE BULLET(U+25E6)
  "square": "\u25AA", // BLACK SMALL SQUARE(U+25AA)
}

export class ListStyleType {
  public value: ListStyleTypeValue;
  static values: string[] = TypeValues;
  static property: string = "list-style-type";

  static load(element: HtmlElement): ListStyleType {
    let value = CssCascade.getValue(element, this.property);
    return new ListStyleType(value as ListStyleTypeValue);
  }

  constructor(value: ListStyleTypeValue) {
    this.value = value;
  }

  public isTcyMarker(): boolean {
    return this.value === "decimal";
  }

  public getMarkerText(index: number): string {
    switch (this.value) {
      case "none":
      case "circle":
      case "disc":
      case "square":
        return MarkerText[this.value];
      case "decimal":
        return String(index + 1) + ".";
      default: // TODO
        return MarkerText["disc"];
    }
  }
}
