import {
  HtmlElement,
  CssCascade,
} from "./public-api";

// original css value
// export type LogicalVerticalAlignValue = "baseline" | "sub" | "super" | "text-top" | "text-bottom" | "middle" | "top" | "bottom"

// our logical css value
export type LogicalVerticalAlignValue = "baseline" | "sub" | "super" | "text-before" | "text-after" | "middle" | "before" | "after"

export class LogicalVerticalAlign {
  public value: LogicalVerticalAlignValue;
  constructor(value: LogicalVerticalAlignValue) {
    this.value = value;
  }

  static load(element: HtmlElement): LogicalVerticalAlign {
    let value = CssCascade.getValue(element, "vertical-align");
    return new LogicalVerticalAlign(value as LogicalVerticalAlignValue);
  }
}
