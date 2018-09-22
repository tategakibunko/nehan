import {
  HtmlElement,
  NativeCssValue,
  NativeStyleMap,
  LogicalBox,
  LogicalEdgeMap,
  CssCascade,
} from "./public-api";

// background-position is not layouting target of nehan.
// we just use this class to change logical position to phyisical ones.
// so value of this class is just a string(NativeCssValue).
export class LogicalBackgroundPos {
  public value: NativeCssValue;

  constructor(value: NativeCssValue){
    this.value = value;
  }

  static load(element: HtmlElement): LogicalBackgroundPos {
    let value = CssCascade.getValue(element, "background-position") as NativeCssValue;
    return new LogicalBackgroundPos(value);
  }

  public getCss(box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    let value = this.value;
    LogicalEdgeMap.forEach(box.writingMode, (logical, physical) => {
      value = value.replace(logical, physical);
    });
    css.set("background-position", value);
    return css;
  }
}

