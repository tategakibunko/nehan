import {
  LogicalBox,
  NativeStyleMap
} from "./public-api";

export interface LogicalCursorPosValue {
  before: number,
  start: number,
}

export class LogicalCursorPos {
  public before: number;
  public start: number;

  constructor(value: LogicalCursorPosValue){
    this.start = value.start;
    this.before = value.before;
  }

  static get zero(): LogicalCursorPos {
    return new LogicalCursorPos(this.zeroValue);
  }

  static get zeroValue(): LogicalCursorPosValue {
    return {start:0, before:0};
  }

  public zero(){
    this.start = 0;
    this.before = 0;
  }

  public clone(): LogicalCursorPos {
    return new LogicalCursorPos({start:this.start, before:this.before});
  }

  public toString(): string {
    return `(start=${this.start}, before=${this.before})`;
  }

  public translate(offset: LogicalCursorPosValue): LogicalCursorPos {
    return new LogicalCursorPos({
      before: this.before + offset.before,
      start: this.start + offset.start
    });
  }

  public getCss(box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    if(box.isTextVertical()){
      css.set("top", this.start + "px");
      css.set(box.isVerticalRl()? "right": "left", this.before + "px");
    } else {
      css.set("top", this.before + "px");
      css.set("left", this.start + "px");
    }
    return css;
  }
}
