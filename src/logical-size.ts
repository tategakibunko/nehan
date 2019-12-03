import {
  Utils,
  HtmlElement,
  PhysicalSize,
  WritingMode,
  NativeStyleMap,
} from "./public-api";

export interface LogicalSizeValue {
  measure: number,
  extent: number
}

export class LogicalSize {
  public measure: number;
  public extent: number;

  constructor(value: LogicalSizeValue) {
    this.measure = value.measure;
    this.extent = value.extent;
  }

  static load(element: HtmlElement): LogicalSize | null {
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

  static loadMeasure(element: HtmlElement): number | null {
    let value = element.computedStyle.getPropertyValue("measure") || "auto";
    return (value === "auto") ? null : Utils.atoi(value, 10);
  }

  static loadExtent(element: HtmlElement): number | null {
    let value = element.computedStyle.getPropertyValue("extent") || "auto";
    return (value === "auto") ? null : Utils.atoi(value, 10);
  }

  static get zero(): LogicalSize {
    return new LogicalSize({ measure: 0, extent: 0 });
  }

  public toString(): string {
    return `(m=${this.measure}, e=${this.extent})`
  }

  public clone(): LogicalSize {
    return new LogicalSize({ measure: this.measure, extent: this.extent });
  }

  public isZero(): boolean {
    return this.measure === 0 && this.extent === 0;
  }

  public getPhysicalSize(writing_mode: WritingMode): PhysicalSize {
    return new PhysicalSize({
      width: this.getWidth(writing_mode),
      height: this.getHeight(writing_mode)
    });
  }

  public getWidth(writing_mode: WritingMode): number {
    return writing_mode.isTextVertical() ? this.extent : this.measure;
  }

  public getHeight(writing_mode: WritingMode): number {
    return writing_mode.isTextVertical() ? this.measure : this.extent;
  }

  public resize(max_size: LogicalSize): LogicalSize {
    if (this.measure <= max_size.measure && this.extent <= max_size.extent) {
      return this;
    }
    let size = { measure: this.measure, extent: this.extent };
    //console.log("resize from (%d,%d)", this.measure, this.extent);
    //console.log("resize max (%d,%d)", max_size.measure, max_size.extent);
    let e_per_m = this.extent / this.measure;
    let m_per_e = this.measure / this.extent;
    while (size.measure > max_size.measure || size.extent > max_size.extent) {
      let d_measure = size.measure - max_size.measure;
      let d_extent = size.extent - max_size.extent;
      if (d_measure > d_extent) {
        size.measure = max_size.measure;
        size.extent = Math.floor(size.extent - d_measure * e_per_m);
        //console.log("resize to (%d,%d)", size.measure, size.extent);
      } else {
        size.extent = max_size.extent;
        size.measure = Math.floor(size.measure - d_extent * m_per_e);
        //console.log("resize to (%d,%d)", size.measure, size.extent);
      }
    }
    return new LogicalSize(size);
  }

  public getCss(is_vert: boolean): NativeStyleMap {
    if (is_vert) {
      return this.getCssVert();
    }
    return this.getCssHori();
  }

  public getCssVert(): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("width", this.extent + "px");
    css.set("height", this.measure + "px");
    return css;
  }

  public getCssHori(): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("width", this.measure + "px");
    css.set("height", this.extent + "px");
    return css;
  }
}
