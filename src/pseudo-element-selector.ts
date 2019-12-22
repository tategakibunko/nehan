import {
  Selector,
  HtmlElement,
  PseudoElementTagNames,
} from "./public-api";

export class PseudoElementSelector extends Selector {
  private src: string;

  constructor(source: string) {
    super();
    this.src = source;
    this.specificity.c = 1;
    if (!PseudoElementTagNames.includes(this.tagName)) {
      console.error("pseudo element(" + this.pseudoName + ") is not defined.");
    }
  }

  public toString(): string {
    return this.tagName;
  }

  public get pseudoName(): string {
    return this.src;
  }

  public get tagName(): string {
    return "::" + this.pseudoName;
  }

  public test(element: HtmlElement): boolean {
    return element.tagName === this.tagName;
  }
}
