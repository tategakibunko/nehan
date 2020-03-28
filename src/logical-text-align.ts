import {
  Utils,
  BasicStyle,
  HtmlElement,
  CssCascade,
  NativeStyleMap,
} from "./public-api";

export enum LogicalTextAlignValue {
  START = "start",
  END = "end",
  CENTER = "center",
  JUSTIFY = "justify"
}

export class LogicalTextAlign {
  public value: string;
  static values: string[] = Utils.Enum.toValueArray(LogicalTextAlignValue);

  constructor(value: LogicalTextAlignValue) {
    this.value = BasicStyle.selectOrDefault(
      "text-align", value, LogicalTextAlign.values
    );
  }

  static load(element: HtmlElement): LogicalTextAlign {
    let value = CssCascade.getValue(element, "text-align");
    return new LogicalTextAlign(value as LogicalTextAlignValue);
  }

  public isStart(): boolean {
    return this.value === LogicalTextAlignValue.START;
  }

  public isEnd(): boolean {
    return this.value === LogicalTextAlignValue.END;
  }

  public isCenter(): boolean {
    return this.value === LogicalTextAlignValue.CENTER;
  }

  public isJustify(): boolean {
    return this.value === LogicalTextAlignValue.JUSTIFY;
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
    let gap = box.size.measure - box.autoSize.measure;
    if (this.isEnd()) {
      css.set("margin-top", gap + "px");
    } else if (this.isCenter()) {
      css.set("margin-top", Math.floor(gap / 2) + "px");
    }
    return css;
  }

  public getCssHori(box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    let gap = box.size.measure - box.autoSize.measure;
    if (this.isEnd()) {
      css.set("margin-left", gap + "px");
    } else if (this.isCenter()) {
      css.set("margin-left", Math.floor(gap / 2) + "px");
    }
    return css;
  }
  */
}
