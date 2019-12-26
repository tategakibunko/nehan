import {
  BoxDimension,
  HtmlElement,
  CssLength,
  CssCascade,
  LogicalPadding,
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
    const position = CssCascade.getValue(element, "position");
    const contentSize = parseInt(CssCascade.getValue(element.parent, this.boxDimension), 10);
    /*
      [https://www.w3.org/TR/CSS22/visudet.html#the-width-property]
      For absolutely positioned elements whose containing block is based on a block container element,
      the percentage is calculated with respect to the width of the padding box of that element.
    */
    if (position !== "absolute") {
      return contentSize;
    }
    const padding = LogicalPadding.load(element.parent);
    const paddingSize = (this.boxDimension === "measure") ? padding.measure : padding.extent;
    return contentSize + paddingSize;
  }

  public computePercentSize(element: HtmlElement): number {
    let baseSize = this.computeParentSize(element);
    let size = baseSize * this.floatValue / 100;
    return Math.floor(size);
  }
}
