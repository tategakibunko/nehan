import {
  BoxDimension,
  HtmlElement,
  CssLength,
  CssCascade,
} from "./public-api";

export class CssBoxSize extends CssLength {
  public boxDimension: BoxDimension;

  constructor(cssText: string, boxDimension: BoxDimension) {
    super(cssText);
    this.boxDimension = boxDimension;
  }

  public computeInitialSize(element: HtmlElement): number {
    return this.computeParentSize(element);
  }

  public computeParentSize(element: HtmlElement): number {
    if (!element.parent) {
      throw new Error("parent is not defined");
    }
    return parseInt(CssCascade.getValue(element.parent, this.boxDimension), 10);
  }

  public computePercentSize(element: HtmlElement): number {
    let baseSize = this.computeParentSize(element);
    let size = baseSize * this.floatValue / 100;
    return Math.floor(size);
  }
}
