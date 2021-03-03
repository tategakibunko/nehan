import {
  Utils,
  NehanElement,
  CssCascade,
  NativeStyleMap,
  ILogicalCssEvaluator,
} from "./public-api";

export interface LogicalPosValue {
  before?: number,
  end?: number,
  after?: number,
  start?: number
}

export class LogicalPos {
  public before?: number;
  public end?: number;
  public after?: number;
  public start?: number;

  constructor(value: LogicalPosValue) {
    this.before = value.before;
    this.end = value.end;
    this.after = value.after;
    this.start = value.start;
  }

  static load(element: NehanElement): LogicalPos {
    let value: LogicalPosValue = {};
    value.before = this.loadEach(element, "before");
    value.end = this.loadEach(element, "end");
    value.after = this.loadEach(element, "after");
    value.start = this.loadEach(element, "start");
    return new LogicalPos(value);
  }

  static loadEach(element: NehanElement, prop: string): number | undefined {
    let value = CssCascade.getValue(element, prop);
    return (value === "auto") ? undefined : Utils.atoi(value, 10);
  }

  public hasValue(): boolean {
    return (this.before !== undefined ||
      this.end !== undefined ||
      this.after !== undefined ||
      this.start !== undefined);
  }

  public acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    return visitor.visitLogicalPos(this);
  }
}
