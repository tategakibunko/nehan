/*
import {
  FlowContext,
  FlowRegion,
  LegacyFloatRegion,
  LogicalSize,
  LogicalRect,
} from "./public-api";

export class FlowRootRegion extends FlowRegion {
  protected floatRegion: LegacyFloatRegion | null;

  constructor(context: FlowContext) {
    super(context);
    this.floatRegion = null;
  }

  protected get rootRegionBefore(): number {
    return this.cursor.before;
  }

  public get rootRegion() {
    return this;
  }

  public get floatExtent(): number {
    return this.cursor.before;
  }

  public isFloatEnable(): boolean {
    return this.floatRegion !== null;
  }

  protected createFloatRegion(): LegacyFloatRegion {
    let size = new LogicalSize({
      measure: this.maxContextBoxMeasure,
      extent: this.maxContextBoxExtent
    });
    return new LegacyFloatRegion(size, this.cursor.before);
  }

  public clearFloatRegion() {
    if (this.floatRegion) {
      //this.floatRegion.clear();
      this.floatRegion = null;
    }
  }

  protected getLocalOffset(): number {
    return 0;
  }

  public getFloatRegion(): LegacyFloatRegion | null {
    return this.floatRegion;
  }

  public pushFloatStart(root_before: number, size: LogicalSize): LogicalRect {
    if (!this.floatRegion) {
      this.floatRegion = this.createFloatRegion();
    }
    return this.floatRegion.pushStart(root_before, size);
  }

  public pushFloatEnd(root_before: number, size: LogicalSize): LogicalRect {
    if (!this.floatRegion) {
      this.floatRegion = this.createFloatRegion();
    }
    return this.floatRegion.pushEnd(root_before, size);
  }
}
*/