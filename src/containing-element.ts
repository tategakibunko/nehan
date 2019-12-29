import {
  CssCascade,
  HtmlElement,
  PositionValue,
} from './public-api';

export class ContainingElement {
  // if position is absolute, ancestor element is nearest element that is not 'static' positioned.
  static getAbsAncestor(element: HtmlElement): HtmlElement {
    let parent = element.parent;
    while (parent) {
      const display = parent.computedStyle.getPropertyValue("position");
      if (display === "static") {
        parent = parent.parent;
      }
    }
    return parent || element.ownerDocument.body;
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
    return element.parent;
  }
}