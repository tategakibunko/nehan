import {
  Selector,
  CompoundSelector,
  PseudoElementSelector,
  HtmlElement,
  Specificity
} from "./public-api";

// complex-selector = (compound-selector | combinator) list
export class ComplexSelector extends Selector {
  private selectors: CompoundSelector[];
  private combinators: string[];

  constructor(selectors: CompoundSelector[], combinators: string[]) {
    super();
    this.selectors = selectors;
    this.combinators = combinators;
    this.specificity = this.getSpecificity();
  }

  public getSelectorItem(index: number): CompoundSelector {
    if (index < 0 || index >= this.selectors.length) {
      throw new Error("getSelectorItem: out of range");
    }
    return this.selectors[index];
  }

  public getCombinatorItem(index: number): string {
    if (index < 0 || index >= this.combinators.length) {
      throw new Error("getCombinatorItem: out of range");
    }
    return this.combinators[index];
  }

  static compare(selector1: ComplexSelector, selector2: ComplexSelector): number {
    return Specificity.compare(selector1.specificity, selector2.specificity);
  }

  private getSpecificity(): Specificity {
    let specificity = new Specificity(0, 0, 0);
    specificity = this.selectors.reduce((acm, selector) => {
      return Specificity.add(acm, selector.specificity);
    }, specificity);
    return specificity;
  }

  public get leafSelector(): CompoundSelector {
    return this.selectors[0];
  }

  public get peSelector(): PseudoElementSelector | null {
    for (let i = 0; i < this.selectors.length; i++) {
      let selector = this.selectors[i];
      if (selector.pseudoElement !== null) {
        return selector.pseudoElement;
      }
    }
    return null;
  }

  public toString(): string {
    let str = this.leafSelector.toString();
    for (var spos = 1, cpos = 0; spos < this.selectors.length; spos++ , cpos++) {
      str = this.selectors[spos].toString() + this.combinators[cpos] + str;
    }
    return str;
  }

  public queryDirectParent(element: HtmlElement, parent_sel: CompoundSelector):
    HtmlElement | null {
    if (element.parent && parent_sel.test(element.parent)) {
      return element.parent;
    }
    return null;
  }

  public queryParent(element: HtmlElement, selector: CompoundSelector): HtmlElement | null {
    let parent = element.parent;
    while (parent) {
      if (selector.test(parent)) {
        return parent;
      }
      parent = parent.parent;
    }
    return parent;
  }

  public queryDirectSibling(element: HtmlElement, selector: CompoundSelector):
    HtmlElement | null {
    let prev_element = element.previousSibling;
    if (prev_element && selector.test(prev_element)) {
      return prev_element;
    }
    return null;
  }

  public querySibling(element: HtmlElement, prev_selector: CompoundSelector):
    HtmlElement | null {
    let prev = element.previousSibling;
    while (prev) {
      if (!prev.isTextElement() && prev_selector.test(prev)) {
        return prev;
      }
      prev = prev.previousSibling;
    }
    return prev;
  }

  /**
     search element from [element] by [left_selector] and [combinator].

     @param left left side of selector
     @param cmb combinator between left selector and right selector.
     @param elm start element searched by left_selector and combinator.
     @returns return matched html element, null if not found.
  */
  public queryLeft(left: CompoundSelector, cmb: string, elm: HtmlElement): HtmlElement | null {
    switch (cmb) {
      case " ":
        return this.queryParent(elm, left);
      case ">":
        return this.queryDirectParent(elm, left);
      case "+":
        return this.queryDirectSibling(elm, left);
      case "~":
        return this.querySibling(elm, left);
      default:
        throw new Error("Invalid combinator[" + cmb + "]");
    }
  }

  public querySelectorAll(element: HtmlElement): HtmlElement[] {
    let leaf_elements = this.leafSelector.querySelectorAll(element);
    return leaf_elements.filter((elm) => {
      return this.test(elm);
    });
  }

  public querySelector(element: HtmlElement): HtmlElement | null {
    let leaf_elements = this.leafSelector.querySelectorAll(element);
    for (let i = 0; i < leaf_elements.length; i++) {
      let elm = leaf_elements[i];
      if (this.test(elm)) {
        return elm;
      }
    }
    return null;
  }

  public test(element: HtmlElement, matchPeRoot = false): boolean {
    let spos = 0, cpos = 0;
    let slen = this.selectors.length, clen = this.combinators.length;
    let cur: HtmlElement | null = element;
    while (true) {
      if (spos >= slen) {
        break;
      }
      let left = this.selectors[spos];
      if (spos === 0 && !left.test(cur, matchPeRoot)) { // if spos > 0, left.test is already executed.
        return false;
      }
      if (cpos >= clen) {
        break;
      }
      let cmb = this.combinators[cpos++];
      if (spos + 1 >= slen) {
        return false;
      }
      left = this.selectors[spos + 1];
      cur = this.queryLeft(left, cmb, cur);
      if (cur === null) {
        return false;
      }
      spos++;
    }
    return true;
  }
}


