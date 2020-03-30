import {
  CssCascade,
  HtmlElement,
  PositionValue,
  Display,
} from './public-api';

export class ContainingElement {
  // if position is absolute, ancestor element is nearest element that is not 'static' positioned.
  static getAbsAncestor(element: HtmlElement): HtmlElement {
    let parent = element.parent;
    while (parent) {
      const position = parent.computedStyle.getPropertyValue("position");
      if (position !== "static") {
        break;
      }
      parent = parent.parent;
    }
    return parent || element.ownerDocument.body;
  }

  static getBlockAncestor(element: HtmlElement): HtmlElement {
    let parent = element.parent;
    while (parent) {
      const display = Display.load(parent, false);
      if (display.isBlockLevel() || display.isFlowRoot()) {
        return parent;
      }
      parent = parent.parent;
    }
    return element.ownerDocument.body;
  }

  static get(element: HtmlElement): HtmlElement {
    const position = CssCascade.getValue(element, "position") as PositionValue;
    if (element.tagName === "body") {
      return element;
    }
    if (!element.parent) {
      return element.ownerDocument.body;
    }
    if (position === "absolute" || position === "fixed") {
      return this.getAbsAncestor(element);
    }
    if (Display.load(element, false).isBlockLevel()) {
      return this.getBlockAncestor(element);
    }
    return element.parent;
  }
}