import {
  HtmlElement,
  LogicalFloat,
  Position,
  ILogicalNodeGenerator,
  TextNodeGenerator,
} from './public-api'
import { TextGenerator } from './text-generator';

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

  static getCollapsedMarginBetween(element: HtmlElement, prevElement: HtmlElement): number {
    const maxBefore = Math.max(...this.getBeforeElements(element).map(e => parseInt(e.computedStyle.getPropertyValue("margin-before") || "0")));
    const maxPrevAfter = Math.max(...this.getAfterElements(prevElement).map(e => parseInt(e.computedStyle.getPropertyValue("margin-after") || "0")));
    return Math.max(maxBefore, maxPrevAfter);
  }

  /*
    o : collapse
    △ : margin-before(cur)
    ▽ : margin-after(prev)
    - : do nothing

    ---------------------------------------------
    | cur / prev | block text float abs  none
    ---------------------------------------------
    | block      |   o     △    △    △     △
    | text       |   ▽     -    -    -     -
    | float      | ▽ + △   -    -    -     △
    | abs        |   -     -    -    -     -
    ----------------------------------------------
  */
  static getFlowMarginFromLastElement(curGen: ILogicalNodeGenerator, prevGen?: ILogicalNodeGenerator): number {
    const curEnv = curGen.context.env;

    // [cur = abs]
    // Position of block with absolutely positioned is determined by itself,
    // so margin of it has no effect for flow context.
    if (curEnv.position.isAbsolute()) {
      return 0;
    }
    const curMarginBefore = parseInt(curEnv.element.computedStyle.getPropertyValue("margin-before") || "0");
    const prevEnv = prevGen ? prevGen.context.env : undefined;
    const prevMarginAfter = prevEnv ? parseInt(prevEnv.element.computedStyle.getPropertyValue("margin-after") || "0") : 0;

    // [cur = float]
    if (!curEnv.float.isNone()) {
      if (!prevEnv) {
        return curMarginBefore;
      }
      if (!prevEnv.float.isNone()) {
        return 0;
      }
      if (prevEnv.position.isAbsolute()) {
        return 0;
      }
      if (prevGen instanceof TextNodeGenerator) {
        return 0;
      }
      if (prevEnv.display.isBlockLevel()) {
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
      if (prevGen instanceof TextNodeGenerator) {
        return 0;
      }
      if (prevEnv.display.isBlockLevel()) {
        return prevMarginAfter;
      }
    }
    // [cur = block(with normal flow layout)]
    if (curEnv.display.isBlockLevel()) {
      if (!prevEnv) {
        return curMarginBefore;
      }
      if (prevGen instanceof TextGenerator) {
        return curMarginBefore;
      }
      if (!prevEnv.float.isNone()) {
        return curMarginBefore;
      }
      if (prevEnv.position.isAbsolute()) {
        return curMarginBefore;
      }
      if (prevEnv.display.isBlockLevel()) {
        return this.getCollapsedMarginBetween(curEnv.element, prevEnv.element);
      }
    }
    return 0; // never
  }
}

