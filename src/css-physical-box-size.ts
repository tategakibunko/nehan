import {
  CssLength,
  CssCascade,
  BoxDimension,
  HtmlElement,
  WritingMode,
} from "./public-api";

export class CssPhysicalBoxSize extends CssLength {
  public boxDimension: BoxDimension;
  public writingMode: WritingMode;

  constructor(cssText: string, boxDimension: BoxDimension, writingMode: WritingMode) {
    super(cssText);
    this.boxDimension = boxDimension;
    this.writingMode = writingMode;
  }

  private getLogicalBoxDimension(): BoxDimension {
    switch (this.boxDimension) {
      case "width":
        return this.writingMode.isTextHorizontal() ? "measure" : "extent";
      case "height":
        return this.writingMode.isTextHorizontal() ? "extent" : "measure";
      default:
        throw new Error(`CssPhysicalBoxSize.getLogicalBoxDimension(): invalid boxDimension(${this.boxDimension})`);
    }
  }

  public computeParentSize(element: HtmlElement): number {
    if (!element.parent) {
      throw new Error("parent is not defined");
    }
    const logicalBoxDim = this.getLogicalBoxDimension();
    return parseInt(CssCascade.getValue(element.parent, logicalBoxDim), 10);
  }

  public computePercentSize(element: HtmlElement): number {
    let baseSize = this.computeParentSize(element);
    let size = baseSize * this.floatValue / 100;
    return Math.floor(size);
  }
}
