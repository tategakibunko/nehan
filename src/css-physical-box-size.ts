import {
  CssBoxSize,
  CssCascade,
  BoxDimension,
  HtmlElement,
  WritingMode,
} from "./public-api";

// CssLength > CssBoxSize > CssPhysicalBoxSize
export class CssPhysicalBoxSize extends CssBoxSize {
  private writingMode: WritingMode;

  constructor(cssText: string, boxDimension: BoxDimension, writingMode: WritingMode) {
    super(cssText, boxDimension);
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
}
