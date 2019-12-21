import {
  Utils,
  HtmlElement,
  FlowContext,
  CssLength,
  CssCascade,
} from "./public-api";

export class CssEdgeSize extends CssLength {
  public readonly edgeName: string;

  constructor(css_text: string, edge_name: string) {
    super(css_text);
    this.edgeName = edge_name;
  }

  public computeKeywordSize(element: HtmlElement): number | null {
    return null;
  }

  public computeParentEdgeSize(element: HtmlElement): number {
    let parent = element.parent;
    if (!parent) {
      return 0;
    }
    let size = parent.computedStyle.getPropertyValue(this.edgeName) || "0";
    return Utils.atoi(size);
  }

  public computeInitialSize(element: HtmlElement): number {
    return 0;
  }

  public computePercentSize(element: HtmlElement): number {
    if (!element.parent) {
      throw new Error("parent is not defined");
    }
    // percentage size for edge is calculated from measure of containing block(parent element).
    let baseSize = parseInt(CssCascade.getValue(element.parent, "measure"), 10);
    let size = baseSize * this.floatValue / 100;
    return Math.floor(size);
  }
}
