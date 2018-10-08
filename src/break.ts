import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
} from "./public-api";

export enum BreakValue {
  AUTO = "auto",
  AVOID = "avoid",
  AVOID_PAGE = "avoid-page",
  PAGE = "page",
  ALWAYS = "always", // same as 'page'
  LEFT = "left",
  RIGHT = "right",
  RECTO = "recto",
  VERSO = "verso",
  AVOID_COLUMN = "avoid-column",
  COLUMN = "column",
  AVOID_REGION = "avoid-region",
  REGION = "region",
}

export class BreakBefore {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(BreakValue);

  constructor(value: BreakValue){
    this.value = DefaultCss.selectOrDefault("break-before", value, BreakBefore.values);
  }

  public isPageBreak(): boolean {
    switch(this.value){
    case BreakValue.ALWAYS:
    case BreakValue.PAGE:
      return true;
    }
    return false;
  }

  static load(element: HtmlElement): BreakBefore {
    let value = CssCascade.getValue(element, "break-before");
    return new BreakBefore(value as BreakValue);
  }
}

export class BreakAfter {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(BreakValue);

  constructor(value: BreakValue){
    this.value = DefaultCss.selectOrDefault("break-after", value, BreakAfter.values);
  }

  public isPageBreak(): boolean {
    switch(this.value){
    case BreakValue.ALWAYS:
    case BreakValue.PAGE:
      return true;
    }
    return false;
  }

  static load(element: HtmlElement): BreakAfter {
    let value = CssCascade.getValue(element, "break-before");
    return new BreakBefore(value as BreakValue);
  }
}
