import {
  HtmlElement,
  CssRule,
  CssStyleDeclaration,
  CssParser,
  CssRules,
  CssDeclarationBlock,
} from "./public-api";

export class CssStyleSheet {
  private rules: CssRule[];

  constructor(cssRules?: CssRules) {
    this.rules = [];
    if (cssRules) {
      this.addCssRules(cssRules);
    }
  }

  private sort(): CssStyleSheet {
    this.rules.sort(CssRule.compare);
    return this;
  }

  public mergeStyleSheet(stylesheet: CssStyleSheet) {
    this.rules = this.rules.concat(stylesheet.rules);
    this.sort();
    return this;
  }

  public getPseudoRules(): CssRule[] {
    return this.rules.filter(rule => rule.peSelector !== null);
  }

  public getStyleOfElement(element: HtmlElement): CssStyleDeclaration {
    const rules = this.rules.filter(rule => rule.test(element));
    return rules.reduce((block: CssStyleDeclaration, rule: CssRule) => {
      return block.mergeFrom(rule.style);
    }, new CssStyleDeclaration());
  }

  public addCssRules(rules: CssRules): CssStyleSheet {
    for (let selector in rules) {
      let addedRules = CssParser.parseRule(selector, rules[selector]);
      this.rules = this.rules.concat(addedRules);
    }
    return this.sort();
  }

  public addRule(selector: string, declrBlock: CssDeclarationBlock): CssStyleSheet {
    const addedRules = CssParser.parseRule(selector, declrBlock);
    this.rules = this.rules.concat(addedRules);
    return this.sort();
  }
}
