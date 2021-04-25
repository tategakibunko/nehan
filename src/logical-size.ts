import {
  Utils,
  NehanElement,
  PhysicalSize,
  WritingMode,
  NativeStyleMap,
  ILogicalCssEvaluator,
} from "./public-api";

export class LogicalSize {
  public measure: number;
  public extent: number;

  constructor(args: { measure: number; extent: number }) {
    this.measure = args.measure;
    this.extent = args.extent;
  }

  static load(element: NehanElement): LogicalSize | null {
    let measure = this.loadMeasure(element);
    if (measure === null) {
      return null;
    }
    let extent = this.loadExtent(element);
    if (extent === null) {
      return null;
    }
    return new LogicalSize({ measure: measure, extent: extent });
  }

  static loadMeasure(element: NehanElement): number | null {
    let value = element.computedStyle.getPropertyValue("measure") || "auto";
    return (value === "auto") ? null : Utils.atoi(value);
  }

  static loadExtent(element: NehanElement): number | null {
    let value = element.computedStyle.getPropertyValue("extent") || "auto";
    return (value === "auto") ? null : Utils.atoi(value);
  }

  static get zero(): LogicalSize {
    return new LogicalSize({ measure: 0, extent: 0 });
  }

  public toString(): string {
    return `m:${this.measure}, e:${this.extent}`;
  }

  public clone(): LogicalSize {
    return new LogicalSize({ measure: this.measure, extent: this.extent });
  }

  public canContain(size: LogicalSize): boolean {
    return (this.measure >= size.measure && this.extent >= size.extent);
  }

  public isZero(): boolean {
    return this.measure === 0 && this.extent === 0;
  }

  public hasZero(): boolean {
    return this.measure === 0 || this.extent === 0;
  }

  public getPhysicalSize(writingMode: WritingMode): PhysicalSize {
    return new PhysicalSize({
      width: this.getWidth(writingMode),
      height: this.getHeight(writingMode)
    });
  }

  public getWidth(writingMode: WritingMode): number {
    return writingMode.isTextVertical() ? this.extent : this.measure;
  }

  public getHeight(writingMode: WritingMode): number {
    return writingMode.isTextVertical() ? this.measure : this.extent;
  }

  public resize(maxSize: LogicalSize): LogicalSize {
    if (this.measure <= maxSize.measure && this.extent <= maxSize.extent) {
      return this.clone();
    }
    const size = { measure: this.measure, extent: this.extent };
    //console.log("resize from (%d,%d)", this.measure, this.extent);
    //console.log("resize max (%d,%d)", maxSize.measure, maxSize.extent);
    const ePerM = this.extent / this.measure;
    const mPerE = this.measure / this.extent;
    while (size.measure > maxSize.measure || size.extent > maxSize.extent) {
      const dMeasure = size.measure - maxSize.measure;
      const dExtent = size.extent - maxSize.extent;
      if (dMeasure > dExtent) {
        size.measure = maxSize.measure;
        size.extent = size.extent - dMeasure * ePerM;
        //console.log("resize to (%d,%d)", size.measure, size.extent);
      } else {
        size.extent = maxSize.extent;
        size.measure = size.measure - dExtent * mPerE;
        //console.log("resize to (%d,%d)", size.measure, size.extent);
      }
    }
    return new LogicalSize({
      measure: Math.floor(size.measure),
      extent: Math.floor(size.extent)
    });
  }

  public acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    return visitor.visitSize(this);
  }
}
