import {
  Utils,
  HtmlElement,
  WritingMode,
  LogicalSize,
} from "./public-api";

export interface PhysicalSizeValue {
  width: number,
  height: number
}

export class PhysicalSize {
  public width: number;
  public height: number;

  constructor(size: PhysicalSizeValue) {
    this.width = size.width;
    this.height = size.height;
  }

  static load(element: HtmlElement): PhysicalSize {
    const attr_width = element.getAttribute("width");
    const attr_height = element.getAttribute("height");
    const prop_width = element.computedStyle.getPropertyValue("width");
    const prop_height = element.computedStyle.getPropertyValue("height");
    const width = prop_width === "auto" ? 0 : Utils.atoi(attr_width || prop_width || "0");
    const height = prop_height === "auto" ? 0 : Utils.atoi(attr_height || prop_height || "0");
    return new PhysicalSize({ width: width, height: height });
  }

  public getLogicalSize(writing_mode: WritingMode): LogicalSize {
    return new LogicalSize({
      measure: this.getMeasure(writing_mode),
      extent: this.getExtent(writing_mode)
    });
  }

  public getExtent(writing_mode: WritingMode): number {
    return writing_mode.isTextVertical() ? this.width : this.height;
  }

  public getMeasure(writing_mode: WritingMode): number {
    return writing_mode.isTextVertical() ? this.height : this.width;
  }

  public getWidthPerHeight(): number {
    return (this.height === 0) ? 1 : this.width / this.height;
  }
}
