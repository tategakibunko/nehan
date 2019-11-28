import {
  LogicalRect,
  LogicalSize,
  LogicalCursorPos
} from "./public-api";

export class FloatRegion {
  public maxRegion: LogicalRect;
  public startRects: LogicalRect[];
  public endRects: LogicalRect[];
  public cursorBefore: number; // next float chain pos.

  constructor(max_size: LogicalSize, block_pos: number) {
    this.maxRegion = new LogicalRect(new LogicalCursorPos({ start: 0, before: 0 }), max_size);
    this.cursorBefore = block_pos;
    this.startRects = [];
    this.endRects = [];
  }

  public toString(): string {
    return `FloatRegion(${this.maxRegion.toString()})`;
  }

  public isEmpty(): boolean {
    return this.startRects.length === 0 && this.endRects.length === 0;
  }

  public get maxRegionExtent(): number {
    return Math.max(this.maxStartRegionExtent, this.maxEndRegionExtent);
  }

  public clear() {
    this.clearBoth();
    this.cursorBefore = 0;
  }

  public clearBoth(): number {
    let cleared_extent = this.maxRegionExtent;
    this.startRects = [];
    this.endRects = [];
    this.cursorBefore = cleared_extent;
    return cleared_extent;
  }

  public clearStart(): number {
    let cleared_extent = this.maxStartRegionExtent;
    this.startRects = [];
    this.cursorBefore = cleared_extent;
    return cleared_extent;
  }

  public clearEnd(): number {
    let cleared_extent = this.maxEndRegionExtent;
    this.endRects = [];
    this.cursorBefore = cleared_extent;
    return cleared_extent;
  }

  private getSpaceMeasureAt(before_pos: number): number {
    return this.maxRegion.measure - this.getSideRectMeasureAt(before_pos);
  }

  public getSpacePos(before_pos: number): LogicalCursorPos {
    let rect = this.getStartSideRect(before_pos);
    let start = rect ? rect.end : 0;
    return new LogicalCursorPos({ start: start, before: before_pos });
  }

  public pushStart(before: number, size: LogicalSize): LogicalCursorPos {
    if (this.maxRegion.includeSize(size) === false) {
      throw new Error("FloatRegion:too large size");
    }
    this.cursorBefore = Math.max(this.cursorBefore, before);
    if (this.startRects.length === 0) {
      let pos = new LogicalCursorPos({ start: 0, before: this.cursorBefore });
      this.startRects.push(new LogicalRect(pos, size));
      return pos;
    }
    let top = this.startRects[this.startRects.length - 1];
    let rest_measure = this.getSpaceMeasureAt(this.cursorBefore);
    // enough measure is ready at [this.cursorBefore].
    if (size.measure < rest_measure) {
      let rect = this.getStartSideRect(this.cursorBefore);
      let start = rect ? rect.end : 0;
      let before = this.cursorBefore;
      let pos = new LogicalCursorPos({ start: start, before: before });
      this.startRects.push(new LogicalRect(pos, size));
      return pos;
    }
    // enough measure is not ready, so skip top block.
    this.cursorBefore += top.extent;
    if (this.cursorBefore + size.extent >= this.maxRegion.extent) {
      throw new Error("FloatRegion:no more space left.");
    }
    // recusive try.
    return this.pushStart(this.cursorBefore, size);
  }

  public pushEnd(before: number, size: LogicalSize): LogicalCursorPos {
    if (this.maxRegion.includeSize(size) === false) {
      throw new Error("FloatRegion:too large size");
    }
    this.cursorBefore = Math.max(this.cursorBefore, before);
    if (this.endRects.length === 0) {
      let pos = new LogicalCursorPos({
        start: this.maxRegion.measure - size.measure,
        before: this.cursorBefore
      });
      this.endRects.push(new LogicalRect(pos, size));
      return pos;
    }
    let top = this.endRects[this.endRects.length - 1];
    let rest_measure = this.getSpaceMeasureAt(this.cursorBefore);
    if (size.measure < rest_measure) {
      let rect = this.getEndSideRect(this.cursorBefore);
      let start = rect ? rect.start - size.measure : this.maxRegion.measure - size.measure;
      let pos = new LogicalCursorPos({ start: start, before: this.cursorBefore });
      this.endRects.push(new LogicalRect(pos, size));
      return pos;
    }
    this.cursorBefore += top.extent;
    if (this.cursorBefore + size.extent >= this.maxRegion.extent) {
      throw new Error("FloatRegion:no more space left.");
    }
    return this.pushEnd(this.cursorBefore, size);
  }

  private get maxStartRegionExtent(): number {
    return this.getMaxSideCursorBeforeFrom(this.startRects);
  }

  private get maxEndRegionExtent(): number {
    return this.getMaxSideCursorBeforeFrom(this.endRects);
  }

  public getSideRectMeasureAt(before_pos: number): number {
    return this.getStartSideRectMeasure(before_pos)
      + this.getEndSideRectMeasure(before_pos);
  }

  private getStartSideRect(before_pos: number): LogicalRect | null {
    return this.getSideRect(this.startRects, before_pos);
  }

  private getEndSideRect(before_pos: number): LogicalRect | null {
    return this.getSideRect(this.endRects, before_pos);
  }

  private getStartSideRectMeasure(before_pos: number): number {
    let rect = this.getStartSideRect(before_pos);
    if (!rect) {
      return 0;
    }
    return rect.end;
  }

  private getEndSideRectMeasure(before_pos: number): number {
    let rect = this.getEndSideRect(before_pos);
    if (!rect) {
      return 0;
    }
    return this.maxRegion.measure - rect.start;
  }

  private getMaxSideCursorBeforeFrom(rects: LogicalRect[]): number {
    return rects.reduce((max, rect) => Math.max(max, rect.after), this.cursorBefore);
  }

  /*
  private getRectsAfter(rects: LogicalRect [], before_pos: number): LogicalRect [] {
    return rects.filter(rect => rect.before >= before_pos);
  }
  */

  private getSideRect(floats: LogicalRect[], before_pos: number): LogicalRect | null {
    for (let i = floats.length - 1; i >= 0; i--) {
      let rect = floats[i];
      if (rect.before <= before_pos && before_pos < rect.after) {
        return rect;
      }
    }
    return null;
  }
}
