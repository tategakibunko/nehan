import {
  HtmlElement,
  CssCascade,
} from "./public-api";

export type PageBreakValue = "auto" | "always" | "left" | "right" | "avoid"

export class PageBreakAfter {
  public value: PageBreakValue;

  constructor(value: PageBreakValue) {
    this.value = value;
  }

  public isAlways(): boolean {
    return this.value === "always";
  }

  static load(element: HtmlElement): PageBreakAfter {
    let value = CssCascade.getValue(element, "page-break-after");
    return new PageBreakAfter(value as PageBreakValue);
  }
}

export class PageBreakBefore {
  public value: PageBreakValue;

  constructor(value: PageBreakValue) {
    this.value = value;
  }

  public isAlways(): boolean {
    return this.value === "always";
  }

  static load(element: HtmlElement): PageBreakBefore {
    let value = CssCascade.getValue(element, "page-break-before");
    return new PageBreakBefore(value as PageBreakValue);
  }
}
