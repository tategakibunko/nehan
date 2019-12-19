import {
  CssBoxSize,
  BoxDimension,
  HtmlElement,
  CssCascade,
} from "./public-api";

// CssLength > CssBoxSize > CssBoxExtent
export class CssBoxExtent extends CssBoxSize {
  constructor(css_text: string) {
    super(css_text, BoxDimension.EXTENT);
  }

  public computeParentSize(element: HtmlElement): number {
    if (!element.parent) {
      throw new Error("parent is not defined");
    }
    return parseInt(CssCascade.getValue(element.parent, "extent"), 10);
  }
}
