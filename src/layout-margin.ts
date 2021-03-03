import {
  NehanElement,
  LogicalFloat,
  Position,
  BoxEnv,
  ILogicalNodeGenerator,
  TextNodeGenerator,
  WhiteSpace,
} from './public-api'

function isCollapseTarget(element: NehanElement): boolean {
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

function getFirstCollapseTarget(element: NehanElement): NehanElement | null {
  let firstChild = element.firstChild;
  while (firstChild && firstChild.isTextElement() && WhiteSpace.isWhiteSpaceElement(firstChild)) {
    firstChild = firstChild.nextSibling;
  }
  return firstChild;
}

function getLastCollapseTarget(element: NehanElement): NehanElement | null {
  let lastChild = element.lastChild;
  while (lastChild && lastChild.isTextElement() && WhiteSpace.isWhiteSpaceElement(lastChild)) {
    lastChild = lastChild.previousSibling;
  }
  return lastChild;
}

export class InlineMargin {
  static getMarginFromParentBlock(element: NehanElement): number {
    const marginStart = parseInt(element.computedStyle.getPropertyValue("margin-start") || "0");
    return marginStart;
  }

  static getMarginFromLastInline(element: NehanElement): number {
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
  static getLastChildren(element: NehanElement): NehanElement[] {
    let last = getLastCollapseTarget(element);
    let lastChildren = [];
    while (last) {
      if (!isCollapseTarget(last)) {
        break;
      }
      if (last.computedStyle.getPropertyValue("border-after-width") !== "0px") {
        break;
      }
      lastChildren.push(last);
      last = getLastCollapseTarget(last);
    }
    return lastChildren;
  }

  static getFirstChildren(element: NehanElement): NehanElement[] {
    let first = getFirstCollapseTarget(element);
    let firstChildren = [];
    while (first) {
      if (!isCollapseTarget(first)) {
        break;
      }
      if (first.computedStyle.getPropertyValue("border-before-width") !== "0px") {
        break;
      }
      firstChildren.push(first);
      first = getFirstCollapseTarget(first);
    }
    return firstChildren;
  }

  static getMaxMarginBefore(element: NehanElement): number {
    const beforeElements = this.getFirstChildren(element).concat(element); // child-first-chain
    // console.log("beforeElements for %s is %o", element.tagName, beforeElements);
    return Math.max(0, ...beforeElements.map(e => parseInt(e.computedStyle.getPropertyValue("margin-before") || "0")));
  }

  static getMaxMarginAfter(element: NehanElement): number {
    const afterElements = this.getLastChildren(element).concat(element); // child-last-chain
    // console.log("afterElements for %s is %o", element.tagName, afterElements);
    return Math.max(0, ...afterElements.map(e => parseInt(e.computedStyle.getPropertyValue("margin-after") || "0")));
  }

  /*
    o : collapse
    △ : margin-before(cur)
    ▽ : margin-after(prev)
    - : do nothing

    -------------------------------------------------
    | cur / prev  | block text/inline float abs  none
    -------------------------------------------------
    | block       |   o        △        △    △     △
    | text/inline |   ▽        -        -    -     -
    | float       | ▽ + △      -        -    -     △
    | abs         |   -        -        -    -     -
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
    // [cur = text | inline]
    if (curGen instanceof TextNodeGenerator || curEnv.display.isInlineLevel()) {
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
      // has before border
      if (curEnv.edge.border.width.before > 0) {
        if (prevEnv) {
          const maxMarginAfter = this.getMaxMarginAfter(prevEnv.element);
          return Math.max(curEnv.edge.margin.before, maxMarginAfter);
        }
        return curEnv.edge.margin.before;
      }
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
