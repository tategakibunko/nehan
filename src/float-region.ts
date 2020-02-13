import {
  LogicalRect,
  LogicalSize,
  LogicalCursorPos
} from "./public-api";

export class FloatRegion {
  public flowRootRegion: LogicalRect;
  public startRects: LogicalRect[];
  public endRects: LogicalRect[];
  public cursorBefore: number; // next float chain pos.
  private startLedgePositions: Set<number>;
  private endLedgePositions: Set<number>;

  constructor(flowRootSize: LogicalSize, before: number) {
    this.flowRootRegion = new LogicalRect(LogicalCursorPos.zero, flowRootSize);
    this.cursorBefore = before;
    this.startRects = [];
    this.endRects = [];
    this.startLedgePositions = new Set<number>();
    this.endLedgePositions = new Set<number>();
  }

  public toString(): string {
    return `FloatRegion(${this.flowRootRegion.toString()})`;
  }

  public isEmpty(): boolean {
    return this.startRects.length === 0 && this.endRects.length === 0;
  }

  public get maxRegionExtent(): number {
    return Math.max(this.maxStartRegionExtent, this.maxEndRegionExtent);
  }

  public pushStart(before: number, size: LogicalSize, contextMeasure?: number): LogicalRect {
    if (this.flowRootRegion.canContain(size) === false) {
      throw new Error("FloatRegion:too large size");
    }
    this.cursorBefore = Math.max(this.cursorBefore, before);
    const restMeasure = this.getSpaceMeasureAt(this.cursorBefore, contextMeasure);
    if (this.startRects.length === 0 && this.endRects.length === 0 && size.measure > restMeasure) {
      throw new Error("FloatRegion:too large size");
    }
    // enough measure is ready at [this.cursorBefore].
    if (size.measure < restMeasure) {
      const rect = this.getStartSideRect(this.cursorBefore);
      const start = rect ? rect.end : 0;
      const before = this.cursorBefore;
      const pos = new LogicalCursorPos({ start, before });
      return this.pushStartRect(new LogicalRect(pos, size))
    }
    // enough measure is not ready, so skip top block.
    const skipExtent = this.getSkipExtentAt(this.cursorBefore);
    this.cursorBefore += skipExtent;
    if (this.cursorBefore + size.extent >= this.flowRootRegion.extent) {
      throw new Error("FloatRegion:no more space left.");
    }
    // recusive try.
    return this.pushStart(this.cursorBefore, size);
  }

  public pushEnd(before: number, size: LogicalSize, contextMeasure?: number): LogicalRect {
    if (this.flowRootRegion.canContain(size) === false) {
      throw new Error("FloatRegion:too large size");
    }
    this.cursorBefore = Math.max(this.cursorBefore, before);
    const restMeasure = this.getSpaceMeasureAt(this.cursorBefore, contextMeasure);
    if (this.startRects.length === 0 && this.endRects.length === 0 && size.measure > restMeasure) {
      throw new Error("FloatRegion:too large size");
    }
    if (size.measure < restMeasure) {
      const rect = this.getEndSideRect(this.cursorBefore);
      const maxMeasure = this.getMaxMeasure(contextMeasure);
      const start = rect ? rect.start - size.measure : maxMeasure - size.measure;
      const pos = new LogicalCursorPos({ start: start, before: this.cursorBefore });
      return this.pushEndRect(new LogicalRect(pos, size));
    }
    const skipExtent = this.getSkipExtentAt(this.cursorBefore);
    this.cursorBefore += skipExtent;
    if (this.cursorBefore + size.extent >= this.flowRootRegion.extent) {
      throw new Error("FloatRegion:no more space left.");
    }
    return this.pushEnd(this.cursorBefore, size);
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

  public getSpacePosFromStartBound(before: number): number {
    let rect = this.getStartSideRect(before);
    return rect ? rect.end : 0;
  }

  public getSpaceMeasureAt(before: number, contextMeasure?: number): number {
    return this.getMaxMeasure(contextMeasure) - this.getSideRectMeasureAt(before);
  }

  public hasSpaceForSize(before: number, wantedSize: LogicalSize, contextMeasure?: number): boolean {
    const spaceMeasure = this.getSpaceMeasureAt(before, contextMeasure);
    if (spaceMeasure < wantedSize.measure) {
      return false;
    }
    const wantedCursor = new LogicalCursorPos({ start: this.getSpacePosFromStartBound(before), before });
    const wantedSpace = new LogicalRect(wantedCursor, wantedSize);
    return this.allRects.filter(rect => rect.after > before).every(rect => !wantedSpace.collideWith(rect));
  }

  public findSpace(before: number, wantedSize: LogicalSize, contextMeasure?: number): LogicalCursorPos | undefined {
    if (this.hasSpaceForSize(before, wantedSize)) {
      const start = this.getSpacePosFromStartBound(before);
      return new LogicalCursorPos({ before, start });
    }
    const foundBefore = this.ledgePositions
      .filter(pos => pos > before)
      .find(pos => this.hasSpaceForSize(pos, wantedSize, contextMeasure));
    if (foundBefore === undefined) {
      return undefined;
    }
    const foundStart = this.getSpacePosFromStartBound(foundBefore);
    return new LogicalCursorPos({ before: foundBefore, start: foundStart });
  }

  private getSideRectMeasureAt(before: number): number {
    return this.getStartSideRectMeasure(before) + this.getEndSideRectMeasure(before);
  }

  private getMaxMeasure(contextMeasure?: number): number {
    return Math.min(this.flowRootRegion.measure, contextMeasure || Infinity);
  }

  private getSkipExtentAt(before: number): number {
    if (this.startRects.length === 0 && this.endRects.length === 0) {
      return 0;
    }
    const lastStartRect = this.startRects[this.startRects.length - 1];
    const lastEndRect = this.endRects[this.endRects.length - 1];
    if (!lastStartRect) {
      return lastEndRect.extent;
    }
    if (!lastEndRect) {
      return lastStartRect.extent;
    }
    return (lastStartRect.after < lastEndRect.after) ? lastStartRect.extent : lastEndRect.extent;
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

  private addLedgePos(sideLedgePositions: Set<number>, lastRect: LogicalRect | undefined, newRect: LogicalRect) {
    if (!lastRect) {
      sideLedgePositions.add(0);
      sideLedgePositions.add(newRect.after);
    } else if (lastRect.before === newRect.before) {
      if (newRect.extent > lastRect.extent) {
        sideLedgePositions.delete(lastRect.after);
      }
      sideLedgePositions.add(newRect.after);
    } else {
      if (lastRect.measure === newRect.measure) {
        sideLedgePositions.delete(lastRect.after);
      }
      sideLedgePositions.add(newRect.after);
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
    return this.flowRootRegion.measure - rect.start;
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
