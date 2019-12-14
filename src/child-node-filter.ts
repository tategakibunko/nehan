import {
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

