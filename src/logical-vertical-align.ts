import {
  HtmlElement,
  CssCascade,
  NativeStyleMap,
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

  /*
  public getCss(box: LogicalBox): NativeStyleMap {
    if (box.isTextVertical()) {
      return this.getCssVert(box);
    }
    return this.getCssHori(box);
  }

  public getCssVert(box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    switch (this.value) {
      case 'baseline':
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
    switch (this.value) {
      case 'baseline':
        css.set("margin-top", "auto");
        css.set("margin-bottom", "auto");
        break;
      default:
        console.warn("vertical-align(%s) is not supported yet.", this.value);
    }
    return css;
  }
  */
}
