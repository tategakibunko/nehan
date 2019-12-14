import {
  HtmlElement,
  CssEdgeSize,
  LogicalBorderWidthKeywordSize
} from "./public-api";

// CssLength > CssEdgeSize > CssBorde
export class CssBorderWidth extends CssEdgeSize {
  public computeKeywordSize(element: HtmlElement): number | null {
    // if undefined keyword is set, we set zero to avoid NaN in flow-region.
    return LogicalBorderWidthKeywordSize[this.cssText] || 0;
  }
}
