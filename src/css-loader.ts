import {
  HtmlElement,
  FlowContext,
  CssStyleDeclaration,
  CssParser,
  ComputedStyle,
  Config,
  PseudoElement,
  MarginCollapse,
} from "./public-api";

export class CssLoader {
  static loadAll(element: HtmlElement) {
    this.load(element);
    element.children.forEach(child => this.loadAll(child));
    if (element.tagName === "body") {
      this.loadDynamic(element);
    }
  }

  static load(element: HtmlElement, parent_ctx?: FlowContext) {
    if (element.isTextElement()) {
      return;
    }
    // set specified styles
    let spec_style = this.getSpecifiedStyle(element);
    // spec-styles of pseudo element are already initialized by PseudoElementInitializer.
    if (!PseudoElement.isPseudoElement(element)) {
      element.style = spec_style;
    }

    /*
    // get dynamic style and overwrite if parent_ctx
    let dynamic_style = this.getDynamicStyle(element, parent_ctx);
    element.style.mergeFrom(dynamic_style);
    */

    // get inline style and overwrite
    let inline_style = this.getInlineStyle(element);
    element.style.mergeFrom(inline_style);

    // set computed-value to element.computedStyle
    ComputedStyle.setComputedValue(element);

    // [TODO] Deprecated in the future
    // set collapse value
    if (Config.edgeSkipTags.indexOf(element.tagName) < 0) {
      MarginCollapse.collapse(element);
    }
  }

  static loadDynamic(element: HtmlElement, parent_ctx?: FlowContext): boolean {
    // get new style by latest context.
    let new_style = element.style.getDynamicStyle(element, parent_ctx);
    if (new_style.isEmpty()) {
      return false; // no update
    }
    // inline style always win!
    let inline_style = this.getInlineStyle(element);
    new_style.mergeFrom(inline_style);

    // update specified style.
    element.style.mergeFrom(new_style);

    // remove old value from current 'computed' styles.
    new_style.forEach((key, value) => {
      element.computedStyle.removeProperty(key);
    });

    // update computed style.
    ComputedStyle.setComputedValue(element);
    return true; // successfully updated
  }

  static getSpecifiedStyle(element: HtmlElement): CssStyleDeclaration {
    return element.ownerDocument.specStyleSheet.getStyleOfElement(element);
  }

  static getDynamicStyle(element: HtmlElement, parent_ctx?: FlowContext):
    CssStyleDeclaration {
    return element.style.getDynamicStyle(element, parent_ctx);
  }

  static getInlineStyle(element: HtmlElement): CssStyleDeclaration {
    let inline_style_src = element.getAttribute("style") || "";
    return CssParser.parseInlineStyle(inline_style_src);
  }
}

