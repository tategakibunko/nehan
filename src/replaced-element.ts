import {
  HtmlElement
} from "./public-api";

export class ReplacedElement {
  static isReplacedElement(element: HtmlElement): boolean {
    switch (element.tagName) {
      case "img":
      case "video":
      case "iframe":
        return true;
    }
    return false;
  }
}
