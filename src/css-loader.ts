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
import { CssSpecifiedDynamicValueLoader } from "./node-effector";

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

  static loadDynamic(element: HtmlElement, parentCtx?: any): boolean {
    if (!element.style.hasDynamicStyles()) {
      return false;
    }
    // load dynamic specified value.
    element.acceptEffector(new CssSpecifiedDynamicValueLoader(parentCtx));

    // inline style always win!
    element.acceptEffector(CssSpecifiedInlineValueLoader.instance);

    // specified value -> computed style(update)
    element.acceptEffector(CssComputedValueLoader.instance);

    // computed value -> used value
    element.acceptEffector(CssUsedRegionLoader.instance);

    return true; // successfully updated
  }
}

