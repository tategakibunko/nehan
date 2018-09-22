import {
  HtmlElement,
  DomTokenList,
  LogicalBox,
  LogicalSize,
  NativeStyleMap,
} from "./public-api";

export interface RubyValue {
  element: HtmlElement,
  rb: LogicalBox,
  rt: LogicalBox
}

export class Ruby {
  public element: HtmlElement;
  public rb: LogicalBox;
  public rt: LogicalBox;

  constructor(value: RubyValue){
    this.element = value.element;
    this.rb = value.rb;
    this.rt = value.rt;
  }

  public get pureTagName(): string {
    return "ruby";
  }

  public get id(): string {
    return this.element.id;
  }

  public get classList(): DomTokenList {
    return this.element.classList;
  }

  public get fontSize(): number {
    return this.rb.fontSize;
  }

  public get totalSize(): LogicalSize {
    return new LogicalSize({measure:this.totalMeasure, extent:this.totalExtent});
  }

  public get totalMeasure(): number {
    return Math.max(this.rb.totalMeasure, this.rt.totalMeasure);
  }

  public get totalExtent(): number {
    return this.rb.totalExtent + this.rt.totalExtent;
  }

  public get text(): string {
    return this.rb.text + "(" + this.rt.text + ")";
  }

  public get charCount(): number {
    return this.rb.getChildren().length;
  }

  public toString(): string {
    return `<ruby>(${this.totalMeasure}x${this.totalExtent}):${this.text}`;
  }

  public getCssRubyVert(): NativeStyleMap {
    return this.totalSize.getCssVert();
  }

  public getCssRbVert(): NativeStyleMap {
    let css = new NativeStyleMap();
    let rb_rt_gap = this.rt.totalMeasure - this.rb.totalMeasure;
    if(rb_rt_gap > 0){
      css.set("margin-top", Math.floor(rb_rt_gap / 2) + "px");
    }
    return css;
  }

  public getCssRbHori(): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("width", "auto");
    return css;
  }
}
