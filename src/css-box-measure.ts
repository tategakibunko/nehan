import {
  CssBoxSize,
  BoxDimension,
  HtmlElement,
  FlowContext
} from "./public-api";

// CssLength > CssBoxSize > CssBoxExtent
export class CssBoxMeasure extends CssBoxSize {
  constructor(css_text: string){
    super(css_text, BoxDimension.MEASURE);
  }

  public computeParentSize(element: HtmlElement, parent_ctx?: FlowContext): number {
    if(!parent_ctx){
      console.error("parent measure for(%s) is not defined", element.tagName);
      throw new Error("parent measure is not defined");
    }
    return parent_ctx.region.maxContextBoxMeasure;
  }
}
