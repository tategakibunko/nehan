import {
  Config,
  HtmlElement,
  Display,
  WhiteSpace,
} from './public-api';

export interface ChildNodeFilter {
  visit: (element: HtmlElement) => boolean;
}

/*
  # remove white space element between blocks

  <div>[white-spaces
     ]<p>some text</p>[white-spaces
  ]</div>

  =>
  
  <div><p>some text</p></div>
*/
export class WhiteSpaceEliminator implements ChildNodeFilter {
  static instance = new WhiteSpaceEliminator();
  private constructor() { }

  private isBlockElement(element: HtmlElement): boolean {
    const display = Display.load(element);
    return display.isBlockLevel();
  }

  visit(element: HtmlElement): boolean {
    if (!WhiteSpace.isWhiteSpaceElement(element)) {
      return true;
    }
    const parent = element.parent;
    // remove first white-spaces in block
    if (parent && element.isFirstChild() && this.isBlockElement(parent)) {
      return false;
    }
    const prev = element.previousSibling;
    if (!prev) {
      return true;
    }
    // remove whitespaces after block, or before block.
    if (this.isBlockElement(prev)) {
      return false;
    }
    return true;
  }
}

export class IgnoredBlockEliminator implements ChildNodeFilter {
  static instance = new IgnoredBlockEliminator();
  private constructor() { }

  private isWhiteSpaceOrIgnoredElement(element: HtmlElement): boolean {
    if (WhiteSpace.isWhiteSpaceElement(element)) {
      return true;
    }
    if (Config.ignoredTags.includes(element.tagName)) {
      return true;
    }
    if (Display.load(element).isNone()) {
      return true;
    }
    return false;
  }

  visit(element: HtmlElement): boolean {
    if (element.isTextElement()) {
      return true;
    }
    // self closing element is not discarded even if children is empty.
    if (["br", "hr"].includes(element.tagName)) {
      return true;
    }
    const display = Display.load(element);
    if (!display.isBlockLevel()) {
      return true;
    }
    if (element.childNodes.length === 0) {
      // console.log("remove empty block:", element);
      return false;
    }
    if (element.childNodes.every(child => this.isWhiteSpaceOrIgnoredElement(child))) {
      // console.log("remove ignored block:", element);
      return false;
    }
    return true;
  }
}

