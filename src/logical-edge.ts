import {
  Utils,
  PropValue,
  WritingMode,
  LogicalEdgeMap,
  NehanElement,
  CssCascade,
} from "./public-api";

export type LogicalEdgeDirection = "before" | "end" | "after" | "start"
export const LogicalEdgeDirections: LogicalEdgeDirection[] = ["before", "end", "after", "start"]

export type PhysicalEdgeDirection = "top" | "right" | "bottom" | "left"
export const PhysicalEdgeDirections: PhysicalEdgeDirection[] = ["top", "right", "bottom", "left"]

export interface LogicalEdgeValue<T> {
  before: T;
  end: T;
  after: T;
  start: T;
}

export interface PhysicalEdgeValue<T> {
  top: T;
  right: T;
  bottom: T;
  left: T;
}

export class PhysicalEdge<T> implements PhysicalEdgeValue<T> {
  public top: T;
  public right: T;
  public bottom: T;
  public left: T;

  constructor(values: PhysicalEdgeValue<T>) {
    this.top = values.top;
    this.right = values.right;
    this.bottom = values.bottom;
    this.left = values.left;
  }

  public get items(): PropValue<PhysicalEdgeDirection, T>[] {
    return [
      { prop: "top", value: this.top },
      { prop: "right", value: this.right },
      { prop: "bottom", value: this.bottom },
      { prop: "left", value: this.left }
    ];
  }
}

export class LogicalEdge<T> implements LogicalEdgeValue<T> {
  public before: T;
  public end: T;
  public after: T;
  public start: T;

  constructor(values: LogicalEdgeValue<T>) {
    this.before = values.before;
    this.end = values.end;
    this.after = values.after;
    this.start = values.start;
  }

  static isBlockEdge(direction: LogicalEdgeDirection): boolean {
    return (direction === "before" || direction === "after");
  }

  static isInlineEdge(direction: LogicalEdgeDirection): boolean {
    return (direction === "start" || direction === "end");
  }

  public getPhysicalEdgeValue(writingMode: WritingMode): PhysicalEdgeValue<T> {
    return this.items.reduce((value, item) => {
      const physicalProp = LogicalEdgeMap.select(writingMode).get(item.prop);
      value[physicalProp] = item.value;
      return value;
    }, {} as any) as PhysicalEdgeValue<T>;
  }

  public getPhysicalEdge(writing_mode: WritingMode): PhysicalEdge<T> {
    return new PhysicalEdge<T>(this.getPhysicalEdgeValue(writing_mode));
  }

  public getPropByLogicalDirection(direction: string): string {
    throw new Error("LogicalEdge<T>::getPropByLogicalDirection must be overrided.");
  }

  public get values(): LogicalEdgeValue<T> {
    return { before: this.before, end: this.end, after: this.after, start: this.start };
  }

  public get items(): PropValue<LogicalEdgeDirection, T>[] {
    return [
      { prop: "before", value: this.before },
      { prop: "end", value: this.end },
      { prop: "after", value: this.after },
      { prop: "start", value: this.start }
    ];
  }
}

export class LogicalEdgeSize extends LogicalEdge<number> {
  static loadDirection(element: NehanElement, prop: string): number {
    return Utils.atoi(CssCascade.getValue(element, prop));
  }

  static get zeroValue(): LogicalEdgeValue<number> {
    return {
      before: 0,
      end: 0,
      after: 0,
      start: 0
    };
  }

  public isZero(): boolean {
    return this.before === 0 && this.end === 0 && this.after === 0 && this.start === 0;
  }

  public clone(): LogicalEdgeSize {
    return new LogicalEdgeSize({
      before: this.before,
      end: this.end,
      after: this.after,
      start: this.start
    });
  }

  public get extent(): number {
    return this.before + this.after;
  }

  public get measure(): number {
    return this.start + this.end;
  }
}
