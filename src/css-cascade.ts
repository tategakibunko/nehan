import {
  HtmlElement,
  DefaultCss
} from "./public-api";

export class CssCascade {
  static getValue(element: HtmlElement, prop: string): string {
    let default_css = DefaultCss.get(prop);
    let computed_value = element.computedStyle.getPropertyValue(prop);
    if (computed_value) {
      return computed_value;
    }
    let value = element.style.getPropertyValue(prop);
    if (value && value !== "inherit") {
      return value;
    }
    if (default_css.inherit && element.parent && (!value || value === "inherit")) {
      return CssCascade.getValue(element.parent, prop);
    }
    return default_css.initial;
  }
}

