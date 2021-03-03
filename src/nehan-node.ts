import {
  HtmlDocument
} from "./public-api";

// TODO
export class NehanNode {
  constructor(
    public $node: Node,
    public root: HtmlDocument
  ) { }
}