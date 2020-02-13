import {
  HtmlElement,
  Display,
  LogicalEdgeDirection,
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

  static getParentsUntilBody(element: HtmlElement): HtmlElement[] {
    let parents = [];
    let parent = element.parent;
    while (parent) {
      if (parent.tagName === "body" || !isFlowElement(parent)) {
        break;
      }
      parents.push(parent);
      parent = parent.parent;
    }
    return parents;
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

  static getAfterElements(element: HtmlElement): HtmlElement[] {
    return this.getParentsUntilBody(element).concat(element).concat(this.getLastChildren(element));
  }

  static getBeforeElements(element: HtmlElement): HtmlElement[] {
    return this.getParentsUntilBody(element).concat(element).concat(this.getFirstChildren(element));
  }

  static getMaxMarginFrom(elements: HtmlElement[], direction: LogicalEdgeDirection): number {
    return elements.map(e => {
      return parseInt(e.computedStyle.getPropertyValue(`margin-${direction}`) || "0", 10);
    }).reduce((max, margin) => {
      return margin > max ? margin : max;
    }, 0);
  }

  static getMaxAfterMargin(element: HtmlElement): number {
    if (element.isTextElement()) {
      return 0;
    }
    const elements = this.getAfterElements(element);
    return this.getMaxMarginFrom(elements, 'after');
  }

  static getMaxBeforeMargin(element: HtmlElement): number {
    if (element.isTextElement()) {
      return 0;
    }
    const elements = this.getBeforeElements(element);
    return this.getMaxMarginFrom(elements, 'before');
  }

  static getMarginFromLastBlock(element: HtmlElement): number {
    if (element.isTextElement()) {
      return 0;
    }
    const display = Display.load(element);
    if (display.isInlineLevel()) {
      return 0;
    }
    const float = LogicalFloat.load(element);
    if (!float.isNone()) {
      return parseInt(element.computedStyle.getPropertyValue("margin-before") || "0", 10);
    }
    if (element.isFirstElementChild() && element.parent && element.parent.tagName === "body") {
      return this.getMaxBeforeMargin(element);
    }
    const prevElement = element.previousElementSibling;
    if (prevElement && isFlowElement(prevElement)) {
      return Math.max(this.getMaxBeforeMargin(element), this.getMaxAfterMargin(prevElement));
    }
    // offset is already added by parent layout.
    return 0;
  }
}

