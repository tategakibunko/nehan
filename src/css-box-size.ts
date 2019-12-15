import {
  BoxDimension,
  HtmlElement,
  FlowContext,
  CssLength
} from "./public-api";

export class CssBoxSize extends CssLength {
  public boxDimension: BoxDimension;

  constructor(css_text: string, box_dimension: BoxDimension) {
    super(css_text);
    this.boxDimension = box_dimension;
  }

  public computeInheritSize(element: HtmlElement): number {
    return this.computeParentSize(element);
  }

  public computeInitialSize(element: HtmlElement): number {
    return this.computeParentSize(element);
  }

  public computePercentSize(element: HtmlElement): number {
    let base_size = this.computeParentSize(element);
    let size = base_size * this.floatValue / 100;
    return Math.floor(size);
  }
}
