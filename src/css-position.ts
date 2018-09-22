import {
  HtmlElement,
  FlowContext,
  CssLength
} from "./public-api";

class CssPosition extends CssLength {
  public computePercentSize(element: HtmlElement, parent_ctx?: FlowContext): number {
    let base_size = this.computeParentSize(element, parent_ctx);
    let size = base_size * this.floatValue / 100;
    return Math.floor(size);
  }
}

export class CssInlinePosition extends CssPosition {
  public computeParentSize(element: HtmlElement, parent_ctx?: FlowContext): number {
    if(!parent_ctx){
      throw new Error("parent measure is not defined");
    }
    return parent_ctx.region.maxContextBoxMeasure;
  }
}

export class CssBlockPosition extends CssPosition {
  public computeParentSize(element: HtmlElement, parent_ctx?: FlowContext): number {
    if(!parent_ctx){
      throw new Error("parent measure is not defined");
    }
    return parent_ctx.region.maxContextBoxExtent;
  }
}
