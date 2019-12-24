import {
  Selector,
  UniversalSelector,
  IdSelector,
  TypeSelector,
  AttrSelector,
  ClassSelector,
  PseudoClassSelector,
  PseudoElementSelector,
  SimpleSelectors,
  Specificity,
  HtmlElement
} from "./public-api";

export class CompoundSelector extends Selector {
  private univSelector: UniversalSelector | null;
  private idSelector: IdSelector | null;
  private typeSelector: TypeSelector | null;
  private attrSelector: AttrSelector | null;
  private classSelectors: ClassSelector[];
  private pseudoClasses: PseudoClassSelector[];
  public pseudoElement: PseudoElementSelector | null;

  constructor(args: SimpleSelectors) {
    super();
    this.univSelector = args.univSelector || null;
    this.idSelector = args.idSelector || null;
    this.typeSelector = args.typeSelector || null;
    this.attrSelector = args.attrSelector || null;
    this.classSelectors = args.classSelectors || [];
    this.pseudoClasses = args.pseudoClasses || [];
    this.pseudoElement = args.pseudoElement || null;
    this.specificity = this.getSpecificity();
  }

  public getTagName(): string {
    if (this.typeSelector) {
      return this.typeSelector.tagName;
    }
    return "*";
  }

  public getSpecificity(): Specificity {
    let specificity = new Specificity(0, 0, 0);
    if (this.idSelector) {
      specificity = Specificity.add(specificity, this.idSelector.specificity);
    }
    if (this.typeSelector) {
      specificity = Specificity.add(specificity, this.typeSelector.specificity);
    }
    if (this.attrSelector) {
      specificity = Specificity.add(specificity, this.attrSelector.specificity);
    }
    if (this.pseudoElement) {
      specificity = Specificity.add(specificity, this.pseudoElement.specificity);
    }
    specificity = this.classSelectors.reduce((acm, selector) => {
      return Specificity.add(acm, selector.specificity);
    }, specificity);
    specificity = this.pseudoClasses.reduce((acm, selector) => {
      return Specificity.add(acm, selector.specificity);
    }, specificity);
    return specificity;
  }

  public toString(): string {
    let str = "";
    if (this.univSelector) {
      str += this.univSelector.toString();
    }
    if (this.typeSelector) {
      str += this.typeSelector.toString();
    }
    if (this.idSelector) {
      str += this.idSelector.toString();
    }
    str += this.classSelectors.reduce((ret, s) => {
      return ret + s.toString();
    }, "");
    if (this.attrSelector) {
      str += this.attrSelector.toString();
    }
    str += this.pseudoClasses.reduce((ret, s) => {
      return ret + s.toString();
    }, "");
    if (this.pseudoElement) {
      str += this.pseudoElement.toString();
    }
    return str;
  }

  public get leafSelector(): string {
    return this.typeSelector ? this.typeSelector.tagName : "*";
  }

  public querySelector(element: HtmlElement): HtmlElement | null {
    let elements = element.queryLeafs(this.leafSelector);
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];
      if (this.test(element)) {
        return element;
      }
    }
    return null;
  }

  public querySelectorAll(element: HtmlElement): HtmlElement[] {
    return element.queryLeafs(this.leafSelector).filter(elm => this.test(elm));
  }

  private testClasses(element: HtmlElement): boolean {
    return this.classSelectors.every((selector) => {
      return selector.test(element);
    });
  }

  private testPseudoClasses(element: HtmlElement): boolean {
    return this.pseudoClasses.every((selector) => {
      return selector.test(element);
    });
  }

  public test(element: HtmlElement, matchPeRoot = false): boolean {
    // If matchPeRoot is false, don't match as parent of pseudo element.
    if (this.pseudoElement && !matchPeRoot) {
      return false;
    }
    if (this.typeSelector !== null && !this.typeSelector.test(element)) {
      return false;
    }
    if (this.attrSelector !== null && !this.attrSelector.test(element)) {
      return false;
    }
    if (this.idSelector !== null && !this.idSelector.test(element)) {
      return false;
    }
    if (!this.testClasses(element)) {
      return false;
    }
    if (!this.testPseudoClasses(element)) {
      return false;
    }
    return true;
  }
}
