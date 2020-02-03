import {
  LogicalRect,
  LogicalSize,
  LogicalCursorPos
} from "./public-api";

export interface SpaceCursorPos {
  measure: number;
  cursor: LogicalCursorPos;
}

export class LegacyFloatRegion {
  public maxRegion: LogicalRect;
  public startRects: LogicalRect[];
  public endRects: LogicalRect[];
  public cursorBefore: number; // next float chain pos.
  private startLedgePositions: Set<number>;
  private endLedgePositions: Set<number>;

  constructor(max_size: LogicalSize, before: number) {
    this.maxRegion = new LogicalRect(new LogicalCursorPos({ start: 0, before: 0 }), max_size);
    this.cursorBefore = before;
    this.startRects = [];
    this.endRects = [];
    this.startLedgePositions = new Set<number>();
    this.endLedgePositions = new Set<number>();
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

  public reset() {
    this.clearBoth();
    this.cursorBefore = 0;
  }

  public clearBoth(): number {
    let cleared_extent = this.maxRegionExtent;
    this.startRects = [];
    this.endRects = [];
    this.startLedgePositions.clear();
    this.endLedgePositions.clear();
    this.cursorBefore = cleared_extent;
    return cleared_extent;
  }

  public clearStart(): number {
    let cleared_extent = this.maxStartRegionExtent;
    this.startRects = [];
    this.startLedgePositions.clear();
    this.cursorBefore = cleared_extent;
    return cleared_extent;
  }

  public clearEnd(): number {
    let cleared_extent = this.maxEndRegionExtent;
    this.endRects = [];
    this.endLedgePositions.clear();
    this.cursorBefore = cleared_extent;
    return cleared_extent;
  }

  public getSpaceStartAt(before: number): number {
    let rect = this.getStartSideRect(before);
    return rect ? rect.end : 0;
  }

  public getSpaceMeasureAt(before: number): number {
    return this.maxRegion.measure - this.getSideRectMeasureAt(before);
  }

  public getSideRectMeasureAt(before: number): number {
    return this.getStartSideRectMeasure(before)
      + this.getEndSideRectMeasure(before);
  }

  public findSpaceCursorForSize(before: number, wantedSize: LogicalSize): SpaceCursorPos | undefined {
    if (this.hasSpaceForSize(before, wantedSize)) {
      const start = this.getSpaceStartAt(before);
      const measure = this.getSpaceMeasureAt(before);
      return { cursor: new LogicalCursorPos({ before, start }), measure };
    }
    const foundBefore = this.ledgePositions
      .filter(pos => pos > before)
      .find(pos => this.hasSpaceForSize(pos, wantedSize));
    if (foundBefore === undefined) {
      return undefined;
    }
    const foundStart = this.getSpaceStartAt(foundBefore);
    const foundMeasure = this.getSpaceMeasureAt(foundBefore);
    const foundCursor = new LogicalCursorPos({ before: foundBefore, start: foundStart });
    return { cursor: foundCursor, measure: foundMeasure };
  }

  public hasSpaceForSize(before: number, wantedSize: LogicalSize): boolean {
    const spaceMeasure = this.getSpaceMeasureAt(before);
    if (spaceMeasure < wantedSize.measure) {
      return false;
    }
    const wantedCursor = new LogicalCursorPos({ start: this.getSpaceStartAt(before), before });
    const wantedSpace = new LogicalRect(wantedCursor, wantedSize);
    const floats = this.allRects.filter(rect => rect.after > before);
    const collideFloat = floats.find(rect => wantedSpace.collideWith(rect));
    return collideFloat === undefined;
  }

  public pushStart(before: number, size: LogicalSize): LogicalRect {
    if (this.maxRegion.canContain(size) === false) {
      throw new Error("FloatRegion:too large size");
    }
    this.cursorBefore = Math.max(this.cursorBefore, before);
    if (this.startRects.length === 0) {
      const pos = new LogicalCursorPos({ start: 0, before: this.cursorBefore });
      const rect = new LogicalRect(pos, size);
      return this.pushStartRect(rect);
    }
    let top = this.startRects[this.startRects.length - 1];
    let rest_measure = this.getSpaceMeasureAt(this.cursorBefore);
    // enough measure is ready at [this.cursorBefore].
    if (size.measure < rest_measure) {
      let rect = this.getStartSideRect(this.cursorBefore);
      let start = rect ? rect.end : 0;
      let before = this.cursorBefore;
      let pos = new LogicalCursorPos({ start: start, before: before });
      return this.pushStartRect(new LogicalRect(pos, size))
    }
    // enough measure is not ready, so skip top block.
    this.cursorBefore += top.extent;
    if (this.cursorBefore + size.extent >= this.maxRegion.extent) {
      throw new Error("FloatRegion:no more space left.");
    }
    // recusive try.
    return this.pushStart(this.cursorBefore, size);
  }

  public pushEnd(before: number, size: LogicalSize): LogicalRect {
    if (this.maxRegion.canContain(size) === false) {
      throw new Error("FloatRegion:too large size");
    }
    this.cursorBefore = Math.max(this.cursorBefore, before);
    if (this.endRects.length === 0) {
      let pos = new LogicalCursorPos({
        start: this.maxRegion.measure - size.measure,
        before: this.cursorBefore
      });
      return this.pushEndRect(new LogicalRect(pos, size));
    }
    let top = this.endRects[this.endRects.length - 1];
    let rest_measure = this.getSpaceMeasureAt(this.cursorBefore);
    if (size.measure < rest_measure) {
      let rect = this.getEndSideRect(this.cursorBefore);
      let start = rect ? rect.start - size.measure : this.maxRegion.measure - size.measure;
      let pos = new LogicalCursorPos({ start: start, before: this.cursorBefore });
      return this.pushEndRect(new LogicalRect(pos, size));
    }
    this.cursorBefore += top.extent;
    if (this.cursorBefore + size.extent >= this.maxRegion.extent) {
      throw new Error("FloatRegion:no more space left.");
    }
    return this.pushEnd(this.cursorBefore, size);
  }

  private get ledgePositions(): number[] {
    const tmp = new Set<number>();
    this.startLedgePositions.forEach(pos => tmp.add(pos));
    this.endLedgePositions.forEach(pos => tmp.add(pos));
    const positions: number[] = [];
    tmp.forEach(pos => positions.push(pos));
    // not allowed! option '---downlevelIteration' is required.
    // return [...tmpSet];
    return positions.sort();
  }

  private addLedgePos(ledgePos: Set<number>, lastRect: LogicalRect | undefined, newRect: LogicalRect) {
    if (!lastRect) {
      ledgePos.add(0);
      ledgePos.add(newRect.after);
    } else if (lastRect.before === newRect.before) {
      if (newRect.extent > lastRect.extent) {
        ledgePos.delete(lastRect.after);
      }
      ledgePos.add(newRect.after);
    } else {
      if (lastRect.measure === newRect.measure) {
        ledgePos.delete(lastRect.after);
      }
      ledgePos.add(newRect.after);
    }
  }

  private pushStartRect(rect: LogicalRect): LogicalRect {
    const lastRect = this.startRects[this.startRects.length - 1];
    this.addLedgePos(this.startLedgePositions, lastRect, rect);
    this.startRects.push(rect);
    return rect;
  }

  private pushEndRect(rect: LogicalRect): LogicalRect {
    const lastRect = this.endRects[this.endRects.length - 1];
    this.addLedgePos(this.endLedgePositions, lastRect, rect);
    this.endRects.push(rect);
    return rect;
  }

  private get allRects(): LogicalRect[] {
    return this.startRects.concat(this.endRects);
  }

  private get maxStartRegionExtent(): number {
    return this.getMaxSideCursorBeforeFrom(this.startRects);
  }

  private get maxEndRegionExtent(): number {
    return this.getMaxSideCursorBeforeFrom(this.endRects);
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
