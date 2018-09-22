import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
  LogicalBox,
  NativeStyleMap,
} from "./public-api";

export enum LogicalVerticalAlignValue {
  BASELINE = "baseline",
  SUB = "sub",
  SUPER = "super",
  TEXT_TOP = "text-top",
  TEXT_BOTTOM = "text-bottom",
  MIDDLE = "middle",
  TOP = "top",
  BOTTOM = "bottom",
}

export class LogicalVerticalAlign {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(LogicalVerticalAlignValue);

  constructor(value: LogicalVerticalAlignValue){
    this.value = DefaultCss.selectOrDefault(
      "vertical-align", value, LogicalVerticalAlign.values
    );
  }

  static load(element: HtmlElement): LogicalVerticalAlign {
    let value = CssCascade.getValue(element, "vertical-align");
    return new LogicalVerticalAlign(value as LogicalVerticalAlignValue);
  }

  public getCss(box: LogicalBox): NativeStyleMap {
    if(box.isTextVertical()){
      return this.getCssVert(box);
    }
    return this.getCssHori(box);
  }

  public getCssVert(box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    switch(this.value){
    case LogicalVerticalAlignValue.BASELINE:
      css.set("margin-left", "auto");
      css.set("margin-right", "auto");
      break;
    default:
      console.warn("vertical-align(%s) is not supported yet.", this.value);
    }
    return css;
  }

  public getCssHori(box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    switch(this.value){
    case LogicalVerticalAlignValue.BASELINE:
      css.set("margin-top", "auto");
      css.set("margin-bottom", "auto");
      break;
    default:
      console.warn("vertical-align(%s) is not supported yet.", this.value);
    }
    return css;
  }
}
