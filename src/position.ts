import {
  HtmlElement,
  CssCascade,
} from "./public-api";

export type PositionValue = "static" | "relative" | "absolute"

export class Position {
  public value: PositionValue;

  constructor(value: PositionValue) {
    this.value = value;
  }

  static load(element: HtmlElement): Position {
    let value = CssCascade.getValue(element, "position");
    return new Position(value as PositionValue);
  }

  public isAbsolute(): boolean {
    return this.value === "absolute";
  }

  public isRelative(): boolean {
    return this.value === "relative";
  }

  public isStatic(): boolean {
    return this.value === "static";
  }
}
