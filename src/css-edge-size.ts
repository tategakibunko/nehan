import {
  Utils,
  HtmlElement,
  FlowContext,
  CssLength
} from "./public-api";

export class CssEdgeSize extends CssLength {
  public readonly edgeName: string;

  constructor(css_text: string, edge_name: string){
    super(css_text);
    this.edgeName = edge_name;
  }

  public computeKeywordSize(element: HtmlElement): number | null {
    return null;
  }

  public computeParentEdgeSize(element: HtmlElement): number {
    let parent = element.parent;
    if(!parent){
      return 0;
    }
    let size = parent.computedStyle.getPropertyValue(this.edgeName) || "0";
    return Utils.atoi(size, 10);
  }

  public computeInheritSize(element: HtmlElement): number {
    return this.computeParentEdgeSize(element);
  }

  public computeInitialSize(element: HtmlElement): number {
    return 0;
  }

  public computePercentSize(element: HtmlElement, parnet_ctx?: FlowContext): number {
    let base_size = this.computeParentEdgeSize(element);
    let size = base_size * this.floatValue / 100;
    return Math.floor(size);
  }
}
