import {
  CssBoxSize,
  BoxDimension,
  HtmlElement,
  FlowContext
} from "./public-api";

// CssLength > CssBoxSize > CssBoxExtent
export class CssBoxMeasure extends CssBoxSize {
  constructor(css_text: string) {
    super(css_text, BoxDimension.MEASURE);
  }

  public computeParentSize(element: HtmlElement): number {
    if (!element.parent) {
      console.error("parent measure for(%s) is not defined", element.tagName);
      throw new Error("parent measure is not defined");
    }
    return parseInt(element.parent.computedStyle.getPropertyValue("measure") || "0", 10);
  }
}
