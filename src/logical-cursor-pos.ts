import {
  LogicalPos,
  NativeStyleMap,
  ILogicalCssEvaluator,
} from "./public-api";

export interface LogicalCursorPosValue {
  before: number,
  start: number,
}

export class LogicalCursorPos implements LogicalCursorPosValue {
  public before: number;
  public start: number;

  constructor(value: LogicalCursorPosValue) {
    this.start = value.start;
    this.before = value.before;
  }

  static get zero(): LogicalCursorPos {
    return new LogicalCursorPos(this.zeroValue);
  }

  static get zeroValue(): LogicalCursorPosValue {
    return { start: 0, before: 0 };
  }

  public zero() {
    this.start = 0;
    this.before = 0;
  }

  public clone(): LogicalCursorPos {
    return new LogicalCursorPos({ start: this.start, before: this.before });
  }

  public get logicalPos(): LogicalPos {
    return new LogicalPos({ before: this.before, start: this.start });
  }

  public toString(): string {
    return `(${this.start}, ${this.before})`;
  }

  public translate(offset: LogicalCursorPosValue): LogicalCursorPos {
    return new LogicalCursorPos({
      before: this.before + offset.before,
      start: this.start + offset.start
    });
  }

  public acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    return visitor.visitPos(this);
  }
}
