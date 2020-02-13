import {
  HtmlElement,
  CssStyleDeclaration,
  ComplexSelector,
  PseudoElementSelector
} from "./public-api";

export class CssRule {
  public selector: ComplexSelector;
  public style: CssStyleDeclaration;
  private disabled: boolean;

  constructor(selector: ComplexSelector, style: CssStyleDeclaration) {
    this.selector = selector;
    this.style = style;
    this.disabled = false;
  }

  public setDisabled(disabled: boolean) {
    this.disabled = disabled;
  }

  public toString(): string {
    return "(rule):" + this.selector.toString();
  }

  public test(element: HtmlElement): boolean {
    if (this.disabled) {
      return false;
    }
    return this.selector.test(element);
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
