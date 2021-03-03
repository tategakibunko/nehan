import {
  NehanElement,
  CssCascade,
} from "./public-api";

export type PositionValue = "static" | "relative" | "absolute" | "fixed" | "sticky"

export class Position {
  public value: PositionValue;

  constructor(value: PositionValue) {
    this.value = value;
  }

  static load(element: NehanElement): Position {
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

  public isFixed(): boolean {
    return this.value === "fixed";
  }

  public isSticky(): boolean {
    return this.value === "sticky";
  }
}
