import {
  BoxDimension,
  HtmlElement,
  FlowContext,
  CssLength
} from "./public-api";

export class CssBoxSize extends CssLength {
  public boxDimension: BoxDimension;

  constructor(css_text: string, box_dimension: BoxDimension){
    super(css_text);
    this.boxDimension = box_dimension;
  }

  public computeInheritSize(element: HtmlElement, parent_ctx?: FlowContext): number {
    return this.computeParentSize(element, parent_ctx);
  }

  public computeInitialSize(element: HtmlElement, parent_ctx?: FlowContext): number {
    return this.computeParentSize(element, parent_ctx);
  }

  public computePercentSize(element: HtmlElement, parent_context?: FlowContext): number {
    let base_size = this.computeParentSize(element, parent_context);
    let size = base_size * this.floatValue / 100;
    return Math.floor(size);
  }
}
