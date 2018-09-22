import {
  CssBoxSize,
  BoxDimension,
  HtmlElement,
  FlowContext
} from "./public-api";

// CssLength > CssBoxSize > CssBoxExtent
export class CssBoxExtent extends CssBoxSize {
  constructor(css_text: string){
    super(css_text, BoxDimension.EXTENT);
  }

  public computeParentSize(element: HtmlElement, parent_ctx?: FlowContext): number {
    if(!parent_ctx){
      console.error("parent extent for(%s) is not defined", element.tagName);
      throw new Error("parent extent is not defined");
    }
    return parent_ctx.region.maxContextBoxExtent;
  }
}
