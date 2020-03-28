import {
  HtmlElement,
  CssCascade,
} from "./public-api";

export type LogicalTextAlignValue = "start" | "end" | "center" | "justify";

export class LogicalTextAlign {
  public value: LogicalTextAlignValue;

  constructor(value: LogicalTextAlignValue) {
    this.value = value;
  }

  static load(element: HtmlElement): LogicalTextAlign {
    let value = CssCascade.getValue(element, "text-align");
    return new LogicalTextAlign(value as LogicalTextAlignValue);
  }

  public isStart(): boolean {
    return this.value === "start";
  }

  public isEnd(): boolean {
    return this.value === "end";
  }

  public isCenter(): boolean {
    return this.value === "center";
  }

  public isJustify(): boolean {
    return this.value === "justify";
  }
}
