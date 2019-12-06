import {
  HtmlElement,
  CssCascade,
  LayoutParent,
  LogicalBox,
  NativeStyleMap,
} from "./public-api";

export type LogicalFloatValue = "start" | "end" | "none"

export class LogicalFloat {
  public value: LogicalFloatValue;

  constructor(value: LogicalFloatValue) {
    this.value = value;
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

  public getCss(parent: LayoutParent, box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    if (this.isNone()) {
      return css;
    }
    if (!box.isTextVertical()) {
      css.set("float", this.isStart() ? "left" : "right");
    }
    return css;
  }
}
