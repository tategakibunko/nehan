import {
  HtmlElement,
  LogicalEdge,
  LogicalEdgeDirection,
  CssLength,
  CssCascade,
} from "./public-api";

export class CssPosition extends CssLength {
  public direction: LogicalEdgeDirection;

  constructor(cssText: string, direction: LogicalEdgeDirection) {
    super(cssText);
    this.direction = direction;
  }

  public computeParentSize(element: HtmlElement): number {
    if (!element.parent) {
      throw new Error("parent is not defined");
    }
    const logicalSizeProp = LogicalEdge.isBlockEdge(this.direction) ? "extent" : "measure";
    return parseInt(CssCascade.getValue(element.parent, logicalSizeProp), 10);
  }

  public computePercentSize(element: HtmlElement): number {
    let base_size = this.computeParentSize(element);
    let size = base_size * this.floatValue / 100;
    return Math.floor(size);
  }
}
