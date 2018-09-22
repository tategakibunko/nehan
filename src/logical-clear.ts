import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
} from "./public-api";

export enum LogicalClearValue {
  NONE = "none",
  START = "start",
  END = "end",
  BOTH = "both"
}

export class LogicalClear {
  static values: LogicalClearValue [] = Utils.Enum.toValueArray(LogicalClearValue)
  public value: LogicalClearValue;

  constructor(value: LogicalClearValue){
    this.value = DefaultCss.selectOrDefault(
      "clear", value, LogicalClear.values
    ) as LogicalClearValue;
  }

  static load(element: HtmlElement): LogicalClear {
    let value = CssCascade.getValue(element, "clear");
    return new LogicalClear(value as LogicalClearValue);
  }

  public isNone(): boolean {
    return this.value === LogicalClearValue.NONE;
  }

  public isStart(): boolean {
    return this.value === LogicalClearValue.START;
  }

  public isEnd(): boolean {
    return this.value === LogicalClearValue.END;
  }

  public isBoth(): boolean {
    return this.value === LogicalClearValue.BOTH;
  }
}
