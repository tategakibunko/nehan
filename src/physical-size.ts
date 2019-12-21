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
    let attr_width = element.getAttribute("width");
    let attr_height = element.getAttribute("height");
    let prop_width = element.computedStyle.getPropertyValue("width");
    let prop_height = element.computedStyle.getPropertyValue("height");
    let width = Utils.atoi(attr_width || prop_width || "0");
    let height = Utils.atoi(attr_height || prop_height || "0");
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
