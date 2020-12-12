import {
  ILexer,
  SelectorToken,
  SimpleSelectors,
  SelectorTokenType,
  UniversalSelector,
  TypeSelector,
  AttrSelector,
  IdSelector,
  ClassSelector,
  PseudoClassSelector,
  PseudoElementSelector,
  CompoundSelector,
  ComplexSelector,
} from "./public-api";

export class SelectorParser {
  constructor(private lexer: ILexer<SelectorToken>) { }

  private normalizeAttr(src: string) {
    let norm = src.trim()
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .replace(/["']/g, "")
      .replace(/\s/g, "");
    return norm;
  }

  private parseAttrSelector(src: string): AttrSelector {
    let body = this.normalizeAttr(src);
    if (body.indexOf("=") < 0) {
      return new AttrSelector(body);
    }
    let operators = ["*=", "^=", "$=", "~=", "|=", "="];
    for (var i = 0; i < operators.length; i++) {
      let operator = operators[i];
      let parts = body.split(operator);
      if (parts.length >= 2) {
        return new AttrSelector(parts[0], operator, parts[1]);
      }
    }
    throw new Error("syntax error(attribute selector)");
  }

  private parseCompoundSelector(): CompoundSelector {
    let loop = true, prop_count = 0;
    let selectors: SimpleSelectors = {
      classSelectors: [],
      pseudoClasses: []
    };
    while (loop && this.lexer.hasNext()) {
      let token = this.lexer.getNext();
      switch (token.type) {
        case SelectorTokenType.UNIVERSAL_SELECTOR:
          selectors.univSelector = new UniversalSelector();
          prop_count++;
          break;
        case SelectorTokenType.TYPE_SELECTOR:
          selectors.typeSelector = new TypeSelector(token.value);
          prop_count++;
          break;
        case SelectorTokenType.ID_SELECTOR:
          selectors.idSelector = new IdSelector(token.value);
          prop_count++;
          break;
        case SelectorTokenType.CLASS_SELECTOR:
          selectors.classSelectors.push(new ClassSelector(token.value));
          prop_count++;
          break;
        case SelectorTokenType.ATTR_SELECTOR:
          selectors.attrSelector = this.parseAttrSelector(token.value);
          prop_count++;
          break;
        case SelectorTokenType.PSEUDO_CLASS:
          selectors.pseudoClasses.push(new PseudoClassSelector(token.value));
          prop_count++;
          break;
        case SelectorTokenType.PSEUDO_ELEMENT:
          selectors.pseudoElement = new PseudoElementSelector(token.value);
          prop_count++;
          break;
        default:
          this.lexer.pushBack(1); // not simple selector
          loop = false;
          break;
      }
    }
    if (prop_count === 0) {
      throw new Error("syntax error. selector required");
    }
    return new CompoundSelector(selectors);
  }

  private parseCombinator(): string {
    let token = this.lexer.getNext();
    if (token.type !== SelectorTokenType.COMBINATOR) {
      throw new Error("syntax error. combinator required.");
    }
    return token.value;
  }

  public parse(): ComplexSelector {
    let selectors: CompoundSelector[] = [];
    let combinators: string[] = [];
    let right = null;

    // main div.foo>p
    // => [sel('p'), cmb('>'), sel('div.foo'), cmb(' '), sel('main')]
    while (this.lexer.hasNext()) {
      // first right selector
      if (!right) {
        right = this.parseCompoundSelector();
        selectors.push(right);
      }
      if (!this.lexer.hasNext()) {
        break;
      }
      let combinator = this.parseCombinator();
      combinators.push(combinator);
      if (!this.lexer.hasNext()) {
        // missing second value of combinator.
        throw new Error("missing left value for combinator[" + combinator + "]");
      }
      let left = this.parseCompoundSelector();
      selectors.push(left);
      right = left; // left side selector become next right side selector.
    }
    return new ComplexSelector(selectors, combinators);
  }
}

