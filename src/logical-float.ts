import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
  LayoutParent,
  LogicalBox,
  NativeStyleMap,
} from "./public-api";

export enum LogicalFloatValue {
  START = "start",
  END = "end",
  NONE = "none"
}

export class LogicalFloat {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(LogicalFloatValue);

  constructor(value: string){
    this.value = DefaultCss.selectOrDefault("float", value, LogicalFloat.values);
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
    return new LogicalFloat(value);
  }

  public getCss(parent: LayoutParent, box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    if(this.isNone()){
      return css;
    }
    if(!box.isTextVertical()){
      css.set("float", this.isStart()? "left" : "right");
    }
    return css;
  }
}
