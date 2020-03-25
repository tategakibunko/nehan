import {
  HtmlElement,
  LogicalFloat,
  Position,
} from './public-api'

function isFlowElement(element: HtmlElement): boolean {
  if (element.isTextElement()) {
    return false;
  }
  const float = LogicalFloat.load(element);
  if (!float.isNone()) {
    return false;
  }
  const position = Position.load(element);
  if (position.isAbsolute() || position.isFixed()) {
    return false;
  }
  return true;
}

export class InlineMargin {
  static getMarginFromParentBlock(element: HtmlElement): number {
    const marginStart = parseInt(element.computedStyle.getPropertyValue("margin-start") || "0", 10);
    return marginStart;
  }

  static getMarginFromLastInline(element: HtmlElement): number {
    const prev = element.previousSibling;
    const marginStart = parseInt(element.computedStyle.getPropertyValue("margin-start") || "0", 10);
    if (!prev || prev.isTextElement()) {
      return marginStart;
    }
    const marginEnd = parseInt(prev.computedStyle.getPropertyValue("margin-end") || "0", 10);
    return marginEnd + marginStart; // inline margin is never canceled!
  }
}

export class BlockMargin {
  static getLastChildren(element: HtmlElement): HtmlElement[] {
    let children = element.children.filter(isFlowElement); // text node is not included
    let lastChildren = [];
    while (children.length > 0) {
      const last = children[children.length - 1];
      lastChildren.push(last);
      children = last.children.filter(isFlowElement);
    }
    return lastChildren;
  }

  static getFirstChildren(element: HtmlElement): HtmlElement[] {
    let children = element.children.filter(isFlowElement);
    let firstChildren = [];
    while (children.length > 0) {
      const first = children[0];
      firstChildren.push(first);
      children = first.children.filter(isFlowElement);
    }
    return firstChildren;
  }

  static getBeforeElements(element: HtmlElement): HtmlElement[] {
    let elements = this.getFirstChildren(element).concat(element);
    if (!element.isFirstElementChild()) {
      return elements;
    }
    let parent = element.parent;
    while (parent) {
      if (!isFlowElement(parent)) {
        break;
      }
      if (!parent.isFirstElementChild()) {
        break;
      }
      elements.push(parent);
      parent = parent.parent;
    }
    return elements;
  }

  static getAfterElements(element: HtmlElement): HtmlElement[] {
    let elements = this.getLastChildren(element).concat(element);
    if (!element.isLastElementChild()) {
      return elements;
    }
    let parent = element.parent;
    while (parent) {
      if (!isFlowElement(parent)) {
        break;
      }
      if (!parent.isLastElementChild()) {
        break;
      }
      elements.push(parent);
      parent = parent.parent;
    }
    return elements;
  }

  static getMarginFromLastBlock(element: HtmlElement): number {
    const prevElement = element.previousElementSibling;
    if (prevElement && !LogicalFloat.load(prevElement).isNone()) {
      return 0;
    }
    if (Position.load(element).isAbsolute()) {
      return 0;
    }
    const float = LogicalFloat.load(element);
    if (!float.isNone() || !prevElement) {
      return parseInt(element.computedStyle.getPropertyValue("margin-before") || "0", 10);
    }
    const maxBefore = Math.max(...this.getBeforeElements(element).map(e => parseInt(e.computedStyle.getPropertyValue("margin-before") || "0")));
    const maxPrevAfter = Math.max(...this.getAfterElements(prevElement).map(e => parseInt(e.computedStyle.getPropertyValue("margin-after") || "0")));
    return Math.max(maxBefore, maxPrevAfter);
  }
}

