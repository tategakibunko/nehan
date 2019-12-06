import {
  HtmlElement,
  CssCascade,
} from "./public-api";

export type LogicalClearValue = "none" | "start" | "end" | "both"

export class LogicalClear {
  public value: LogicalClearValue;

  constructor(value: LogicalClearValue) {
    this.value = value;
  }

  static load(element: HtmlElement): LogicalClear {
    let value = CssCascade.getValue(element, "clear");
    return new LogicalClear(value as LogicalClearValue);
  }

  public isNone(): boolean {
    return this.value === 'none';
  }

  public isStart(): boolean {
    return this.value === 'start';
  }

  public isEnd(): boolean {
    return this.value === 'end';
  }

  public isBoth(): boolean {
    return this.value === 'both';
  }
}
