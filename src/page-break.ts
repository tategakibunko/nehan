import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
} from "./public-api";

export enum PageBreakValue {
  AUTO = "auto",
  ALWAYS = "always",
  LEFT = "left",
  RIGHT = "right",
  AVOID = "avoid"
}
export class PageBreakBefore {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(PageBreakValue);

  constructor(value: PageBreakValue){
    this.value = DefaultCss.selectOrDefault("page-break-before", value, PageBreakBefore.values);
  }

  public isAlways(): boolean {
    return this.value === PageBreakValue.ALWAYS;
  }

  static load(element: HtmlElement): PageBreakBefore {
    let value = CssCascade.getValue(element, "page-break-before");
    return new PageBreakBefore(value as PageBreakValue);
  }
}
