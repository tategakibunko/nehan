import {
  HtmlElement,
  CssCascade,
  NativeStyleMap,
} from "./public-api";

export type LogicalFloatValue = "start" | "end" | "none"

export class LogicalFloat {
  public value: LogicalFloatValue;

  constructor(value: LogicalFloatValue) {
    this.value = (value !== "start" && value !== "end" && value !== "none") ? "none" : value;
  }

  public isFloat(): boolean {
    return this.isNone() === false;
  }

  public isStart(): boolean {
    return this.value === "start";
  }

  public isEnd(): boolean {
    return this.value === "end";
  }

  public isNone(): boolean {
    return this.value === "none";
  }

  static load(element: HtmlElement): LogicalFloat {
    let value = CssCascade.getValue(element, "float");
    return new LogicalFloat(value as LogicalFloatValue);
  }
}
