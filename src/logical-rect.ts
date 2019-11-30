import {
  LogicalCursorPos,
  LogicalSize,
} from "./public-api";

export class LogicalRect {
  public pos: LogicalCursorPos;
  public size: LogicalSize;

  constructor(pos: LogicalCursorPos, size: LogicalSize) {
    this.pos = pos;
    this.size = size;
  }

  public toString(): string {
    let str = JSON.stringify({ pos: this.pos, size: this.size });
    return `rect(${str})`;
  }

  public includeSize(size: LogicalSize): boolean {
    return (this.measure >= size.measure && this.extent >= size.extent);
  }

  public collideWith(rect: LogicalRect): boolean {
    const dx = Math.abs(this.start - rect.start);
    const sx = (this.measure + rect.measure) / 2;
    const dy = Math.abs(this.before - rect.before);
    const sy = (this.extent + rect.extent) / 2;
    return dx < sx && dy < sy;
  }

  public get extent(): number {
    return this.size.extent;
  }

  public set extent(size: number) {
    this.size.extent = size;
  }

  public get measure(): number {
    return this.size.measure;
  }

  public set measure(size: number) {
    this.size.measure = size;
  }

  public get start(): number {
    return this.pos.start;
  }

  public set start(size: number) {
    this.pos.start = size;
  }

  public get before(): number {
    return this.pos.before;
  }

  public set before(size: number) {
    this.pos.before = size;
  }

  public get end(): number {
    return this.pos.start + this.size.measure;
  }

  public get after(): number {
    return this.pos.before + this.size.extent;
  }

}

