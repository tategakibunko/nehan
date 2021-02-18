import {
  HtmlElement,
  ILogicalNode,
} from "./public-api";

export interface Anchor {
  element: HtmlElement;
  pageIndex: number;
  box?: ILogicalNode;
  dom?: HTMLElement;
}
