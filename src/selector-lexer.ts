import {
  SelectorToken,
  SelectorTokenType,
  Lexer,
  Utils,
} from "./public-api";

export class SelectorLexer extends Lexer<SelectorToken> {
  static rexMediaSelector: RegExp = /^@[a-z]*/;
  static rexTypeSelector: RegExp = /^[a-zA-Z][_a-zA-Z0-9-]*/;
  static rexClassSelector: RegExp = /^\.[_a-zA-Z][_a-zA-Z0-9-]*/;
  static rexAttrSelector: RegExp = /^\[(.*?)\]/;
  static rexIdSelector: RegExp = /^#[_a-zA-Z][_a-zA-Z0-9-]*/;
  static rexPseudoClass: RegExp = /^:[_a-z][_a-z0-9-]*[_a-z0-9-.,()]*/;
  static rexPseudoElement: RegExp = /^::[_a-z][_a-z0-9-]*/;

  protected normalize(source: string): string {
    let norm = source.trim();
    norm = Utils.String.multiSpaceToSingle(source);
    norm = norm.replace(/\s*([=>~+])\s*/g, "$1");
    return norm;
  }

  protected addToken(token: SelectorToken) {
    this.tokens.unshift(token); // leaf to node
  }

  protected createToken(): SelectorToken {
    let c1 = this.peekChar();

    // commna seperator not allowed
    if (c1 === ",") {
      throw new Error("comma separator is not allowed");
    }
    // universal selector
    if (c1 === "*") {
      this.stepBuff(1);
      return { type: SelectorTokenType.UNIVERSAL_SELECTOR, value: c1 };
    }
    // type selector
    let type_match = SelectorLexer.rexTypeSelector.exec(this.buff);
    if (type_match !== null) {
      //console.log("type:", type_match);
      let selector = type_match[0];
      this.stepBuff(selector.length);
      return { type: SelectorTokenType.TYPE_SELECTOR, value: selector };
    }
    // class selector
    let class_match = SelectorLexer.rexClassSelector.exec(this.buff);
    if (class_match !== null) {
      //console.log("class:", class_match);
      let selector = class_match[0];
      let value = selector.substring(1); // remove head dot
      this.stepBuff(selector.length);
      return { type: SelectorTokenType.CLASS_SELECTOR, value: value };
    }
    // id selector
    let id_match = SelectorLexer.rexIdSelector.exec(this.buff);
    if (id_match !== null) {
      //console.log("id:", id_match);
      let selector = id_match[0];
      let value = selector.substring(1); // remove head sharp
      this.stepBuff(selector.length);
      return { type: SelectorTokenType.ID_SELECTOR, value: value };
    }
    // attribute selector
    let attr_match = SelectorLexer.rexAttrSelector.exec(this.buff);
    if (attr_match !== null) {
      //console.log("attribute:", attr_match, RegExp.$1);
      let selector = attr_match[0]; // "[name=foo]"
      let value = RegExp.$1; // "name=foo"
      this.stepBuff(selector.length);
      return { type: SelectorTokenType.ATTR_SELECTOR, value: value };
    }
    // pseudo-class
    // offcourse it's rough regexp, but parsed again in pc-parser
    let pc_match = SelectorLexer.rexPseudoClass.exec(this.buff);
    if (pc_match !== null) {
      //console.log("pseudo class:", pc_match);
      let selector = pc_match[0];
      let value = selector.substring(1); // remove head colon.
      this.stepBuff(selector.length);
      return { type: SelectorTokenType.PSEUDO_CLASS, value: value };
    }
    // pseudo-element
    let pe_match = SelectorLexer.rexPseudoElement.exec(this.buff);
    if (pe_match !== null) {
      //console.log("pseudo element:", pe_match);
      let selector = pe_match[0];
      let value = selector.substring(2); // remove head double colon.
      this.stepBuff(selector.length);
      // if only pseudo-element itself is defined, like '::before',
      // treat it as type-selector for <::before>.
      if (this.src == selector) {
        return { type: SelectorTokenType.TYPE_SELECTOR, value: selector };
      }
      return { type: SelectorTokenType.PSEUDO_ELEMENT, value: value };
    }
    // combinator
    switch (c1) {
      case " ": // treat space as combinator
      case "+":
      case "~":
      case ">":
        //console.log("combinator");
        this.stepBuff(1);
        return { type: SelectorTokenType.COMBINATOR, value: c1 };
    }
    throw new Error(this.src);
  }
}
