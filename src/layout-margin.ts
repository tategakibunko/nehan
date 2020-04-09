import {
  Config,
  HtmlElement,
  LogicalFloat,
  Position,
  BoxEnv,
  ILogicalNodeGenerator,
  TextNodeGenerator,
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
    const marginStart = parseInt(element.computedStyle.getPropertyValue("margin-start") || "0");
    return marginStart;
  }

  static getMarginFromLastInline(element: HtmlElement): number {
    const prev = element.previousSibling;
    const marginStart = parseInt(element.computedStyle.getPropertyValue("margin-start") || "0");
    if (!prev || prev.isTextElement()) {
      return marginStart;
    }
    const marginEnd = parseInt(prev.computedStyle.getPropertyValue("margin-end") || "0");
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

  static getMaxMarginBefore(element: HtmlElement): number {
    const beforeElements = this.getBeforeElements(element);
    return Math.max(0, ...beforeElements.map(e => parseInt(e.computedStyle.getPropertyValue("margin-before") || "0")));
  }

  static getMaxMarginAfter(element: HtmlElement): number {
    const afterElements = this.getAfterElements(element);
    return Math.max(0, ...afterElements.map(e => parseInt(e.computedStyle.getPropertyValue("margin-after") || "0")));
  }

  /*
    o : collapse
    △ : margin-before(cur)
    ▽ : margin-after(prev)
    - : do nothing

    -------------------------------------------------
    | cur / prev | block text/inline float abs  none
    -------------------------------------------------
    | block      |   o        △        △    △     △
    | text       |   ▽        -        -    -     -
    | float      | ▽ + △      -        -    -     △
    | abs        |   -        -        -    -     -
    -------------------------------------------------
  */
  static getFlowMarginFromLastElement(parentEnv: BoxEnv, curGen: ILogicalNodeGenerator, prevGen?: ILogicalNodeGenerator): number {
    const curEnv = curGen.context.env;

    // [cur = abs]
    // Position of block with absolutely positioned is determined by itself,
    // so margin of it has no effect for flow context.
    if (curEnv.position.isAbsolute()) {
      return 0;
    }
    const prevEnv = prevGen ? prevGen.context.env : undefined;

    // [cur = float]
    if (!curEnv.float.isNone()) {
      if (!prevEnv) {
        return parseInt(curEnv.element.computedStyle.getPropertyValue("margin-before") || "0");
      }
      if (!prevEnv.float.isNone()) {
        return 0;
      }
      if (prevEnv.position.isAbsolute()) {
        return 0;
      }
      if (prevGen instanceof TextNodeGenerator || prevEnv.display.isInlineLevel()) {
        return 0;
      }
      if (prevEnv.display.isBlockLevel()) {
        const curMarginBefore = parseInt(curEnv.element.computedStyle.getPropertyValue("margin-before") || "0");
        const prevMarginAfter = this.getMaxMarginAfter(prevEnv.element);
        return prevMarginAfter + curMarginBefore;
      }
    }
    // [cur = text]
    if (curGen instanceof TextNodeGenerator) {
      if (!prevEnv) {
        return 0;
      }
      if (!prevEnv.float.isNone()) {
        return 0;
      }
      if (prevEnv.position.isAbsolute()) {
        return 0;
      }
      if (prevGen instanceof TextNodeGenerator || prevEnv.display.isInlineLevel()) {
        return 0;
      }
      if (prevEnv.display.isBlockLevel()) {
        return this.getMaxMarginAfter(prevEnv.element);
      }
    }
    // [cur = block(with normal flow layout)]
    if (curEnv.display.isBlockLevel()) {
      const isInternalBlock = !parentEnv.display.isFlowRoot() && parentEnv.display.isBlockLevel() && !parentEnv.position.isAbsolute() && parentEnv.float.isNone();
      if (!prevEnv && isInternalBlock) {
        return 0; // max margin-before is already added by parent block.
      }
      const maxMarginBefore = this.getMaxMarginBefore(curEnv.element);
      if (!prevEnv) {
        return maxMarginBefore;
      }
      if (prevGen instanceof TextNodeGenerator || prevEnv.display.isInlineLevel()) {
        return maxMarginBefore;
      }
      if (!prevEnv.float.isNone()) {
        return maxMarginBefore;
      }
      if (prevEnv.position.isAbsolute()) {
        return maxMarginBefore;
      }
      if (prevEnv.display.isBlockLevel()) {
        const maxMarginAfter = this.getMaxMarginAfter(prevEnv.element);
        return Math.max(maxMarginBefore, maxMarginAfter);
      }
    }
    return 0; // never
  }
}
