import {
  HtmlElement,
  CssStyleDeclaration,
  ComplexSelector,
  PseudoElementSelector
} from "./public-api";

export class CssRule {
  public selector: ComplexSelector;
  public style: CssStyleDeclaration;

  constructor(selector: ComplexSelector, style: CssStyleDeclaration) {
    this.selector = selector;
    this.style = style;
  }

  public toString(): string {
    return "(rule):" + this.selector.toString();
  }

  /*
    Matching for parent of pseudo-element is only required once by PseudoElementInitializer.
    So if matchPeRoot is false, matching for all rule including pseudo element returns false.

    Assume that
      'element' is p.add-first-letter,
      'rule' is "p.add-first-letter::first-letter{ font-size: 4em }"

    (a) Initialize pseudo element phase.
      1. rule.test(element, true) => true
         This matching is for searching 'parent element' of pseudo-element.
      2. rule has some pseudo element(::first-letter), so we inserted '::first-letter' to element. Name it 'peFL'.
      3. Then we set rule.style to peFL.style.

    (b) Matching phase
      1. Now matching for pseudo-element must be disabled because rule.style is for 'peFL', not for element.style.
         so we call 'test' metdhod with second arugment false.
         rule.test(element, false) => false
  */
  public test(element: HtmlElement, matchPeRoot = false): boolean {
    return this.selector.test(element, matchPeRoot);
  }

  public get pseudoElementName(): string {
    return this.peSelector ? this.peSelector.tagName : "";
  }

  public get peSelector(): PseudoElementSelector | null {
    return this.selector.peSelector;
  }

  public getPropertyValue(prop: string): string | null {
    return this.style.getPropertyValue(prop);
  }

  static compare(rule1: CssRule, rule2: CssRule): number {
    return ComplexSelector.compare(rule1.selector, rule2.selector);
  }
}
