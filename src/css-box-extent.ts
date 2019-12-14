import {
  CssBoxSize,
  BoxDimension,
  HtmlElement,
} from "./public-api";

// CssLength > CssBoxSize > CssBoxExtent
export class CssBoxExtent extends CssBoxSize {
  constructor(css_text: string) {
    super(css_text, BoxDimension.EXTENT);
  }

  public computeParentSize(element: HtmlElement): number {
    if (!element.parent) {
      console.error("parent extent for(%s) is not defined", element.tagName);
      throw new Error("parent extent is not defined");
    }
    return parseInt(element.parent.computedStyle.getPropertyValue("extent") || "0", 10);
  }
}
