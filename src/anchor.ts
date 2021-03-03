import {
  NehanElement,
  ILogicalNode,
} from "./public-api";

export interface Anchor {
  name: string;
  element: NehanElement;
  pageIndex: number;
  box?: ILogicalNode;
  dom?: HTMLElement;
}
