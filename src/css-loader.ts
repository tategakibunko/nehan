import {
  HtmlElement,
  FlowContext,
  Config,
  MarginCollapse,
  CssSpecifiedValueLoader,
  CssSpecifiedInlineValueLoader,
  CssComputedValueLoader,
  CssUsedRegionLoader,
} from "./public-api";

export class CssLoader {
  static loadAll(element: HtmlElement) {
    if (element.isTextElement()) {
      return;
    }
    this.load(element);

    element.children.forEach(child => this.loadAll(child));

    if (element.tagName === "body") {
      this.loadDynamic(element);
    }
  }

  static load(element: HtmlElement) {
    if (element.isTextElement()) {
      return;
    }
    // set specified styles(normal + inline)
    element.acceptEffector(CssSpecifiedValueLoader.instance);
    element.acceptEffector(CssSpecifiedInlineValueLoader.instance);

    // specified value -> computed value
    element.acceptEffector(CssComputedValueLoader.instance);

    // computed value -> used value
    element.acceptEffector(CssUsedRegionLoader.instance);

    // [TODO] Deprecated in the future
    // set collapse value
    if (Config.edgeSkipTags.indexOf(element.tagName) < 0) {
      MarginCollapse.collapse(element);
    }
  }

  static loadDynamic(element: HtmlElement, parentCtx?: FlowContext): boolean {
    // get new style by latest context.
    let newStyle = element.style.getDynamicStyle(element, parentCtx);
    if (newStyle.isEmpty()) {
      return false; // no update
    }
    // update specified style.
    element.style.mergeFrom(newStyle);

    // inline style always win!
    element.acceptEffector(CssSpecifiedInlineValueLoader.instance);

    // remove old value from current 'computed' styles.
    newStyle.forEach((key, value) => {
      element.computedStyle.removeProperty(key);
    });

    // update computed style.
    element.acceptEffector(CssComputedValueLoader.instance);

    // computed value -> used value
    element.acceptEffector(CssUsedRegionLoader.instance);

    return true; // successfully updated
  }
}

