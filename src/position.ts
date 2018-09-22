import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
} from "./public-api";

export enum PositionValue {
  STATIC = "static",
  RELATIVE = "relative",
  ABSOLUTE = "absolute"
}

export class Position {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(PositionValue);

  constructor(value: PositionValue){
    this.value = DefaultCss.selectOrDefault("position", value, Position.values);
  }

  static load(element: HtmlElement): Position {
    let value = CssCascade.getValue(element, "position");
    return new Position(value as PositionValue);
  }

  public isAbsolute(): boolean {
    return this.value === PositionValue.ABSOLUTE;
  }

  public isRelative(): boolean {
    return this.value === PositionValue.RELATIVE;
  }

  public isStatic(): boolean {
    return this.value === PositionValue.STATIC;
  }
}
