import {
  HtmlElement,
  CssRule,
  CssStyleDeclaration,
  CssParser, CssRules, CssDeclarationBlock,
  PseudoElement
} from "./public-api";

export class CssStyleSheet {
  public rules: CssRule [];

  constructor(css_rules?: CssRules){
    this.rules = [];
    if(css_rules){
      this.addCssRules(css_rules);
    }
  }

  private sort(): CssStyleSheet{
    this.rules.sort(CssRule.compare);
    return this;
  }

  public mergeStyleSheet(stylesheet: CssStyleSheet){
    this.rules = this.rules.concat(stylesheet.rules);
    this.sort();
    return this;
  }

  public getStyleOfElement(element: HtmlElement): CssStyleDeclaration {
    let rules = this.getRulesOfElement(element);
    return rules.reduce((block: CssStyleDeclaration, rule: CssRule) => {
      return block.mergeFrom(rule.style);
    }, new CssStyleDeclaration());
  }

  public getRulesOfElement(element: HtmlElement): CssRule [] {
    return this.rules.filter((rule) => {
      if(!rule.test(element)){
	return false;
      }
      if(rule.peSelector){
	let pe_name = rule.peSelector.tagName;
	let pe = element.querySelector(pe_name) || PseudoElement.addElement(element, pe_name);
	if(!pe){
	  console.error("failed to create PseudoElement(%s) to %s", pe_name, element.toString());
	  return;
	}
	// PseudoElements are dynamically generated at css-loading phase,
	// so if we don't set styles of them at this point,
	// there is no chance for them to get their own css-styles.
	// Note that cssRules is already sorted by specificity,
	// so it's no problem just copying [rule.style] to [pe.style].
	pe.style.mergeFrom(rule.style);
	return false;
      }
      return true;
    });
  }

  public addCssRules(rules: CssRules): CssStyleSheet {
    for(let selector in rules){
      let rule_list = CssParser.parseRule(selector, rules[selector]);
      this.rules = this.rules.concat(rule_list);
    }
    return this.sort();
  }

  public addRule(selector: string, declr_block: CssDeclarationBlock): CssStyleSheet {
    let rule_list = CssParser.parseRule(selector, declr_block);
    this.rules = this.rules.concat(rule_list);
    return this.sort();
  }
}
