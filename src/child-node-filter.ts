import {
  Config,
  HtmlElement,
  Display,
  WhiteSpace,
  PseudoElement,
} from './public-api';

export interface ChildNodeFilter {
  visit: (element: HtmlElement) => boolean;
}

export class ValidBlockSelector implements ChildNodeFilter {
  static instance = new ValidBlockSelector();
  private constructor() { }

  visit(element: HtmlElement): boolean {
    if (element.isTextElement()) {
      return true;
    }
    if (Config.ignoredTags.includes(element.tagName)) {
      // console.log("remove ignored element:", element.getNodeName());
      return false;
    }
    // self closing elements or iframe, video are not discarded even if children is empty.
    if (["br", "hr", "img", "wbr", "video", "iframe"].includes(element.tagName)) {
      return true;
    }
    const display = Display.load(element);
    if (display.isNone()) {
      // console.log("remove display = none:", element.getNodeName());
      return false;
    }
    if (!display.isBlockLevel()) {
      return true;
    }
    element.acceptChildFilter(this);
    if (element.childNodes.length === 0) {
      // console.log("remove empty block:", element.getNodeName());
      return false;
    }
    if (element.childNodes.every(child => WhiteSpace.isWhiteSpaceElement(child))) {
      // console.log("remove white-space only block:", element.getNodeName());
      return false;
    }
    return true;
  }
}

