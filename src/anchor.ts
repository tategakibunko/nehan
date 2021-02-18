import {
  HtmlElement,
  ILogicalNode,
} from "./public-api";

export interface Anchor {
  name: string;
  element: HtmlElement;
  pageIndex: number;
  box?: ILogicalNode;
  dom?: HTMLElement;
}
