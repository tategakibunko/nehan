import {
  HtmlElement,
  CssLength,
  CssCascade,
} from "./public-api";

class CssPosition extends CssLength {
  public computePercentSize(element: HtmlElement): number {
    let base_size = this.computeParentSize(element);
    let size = base_size * this.floatValue / 100;
    return Math.floor(size);
  }
}

export class CssInlinePosition extends CssPosition {
  public computeParentSize(element: HtmlElement): number {
    if (!element.parent) {
      throw new Error("parent is not defined");
    }
    return parseInt(CssCascade.getValue(element.parent, "measure"), 10);
  }
}

export class CssBlockPosition extends CssPosition {
  public computeParentSize(element: HtmlElement): number {
    if (!element.parent) {
      throw new Error("parent is not defined");
    }
    return parseInt(CssCascade.getValue(element.parent, "extent"), 10);
  }
}
