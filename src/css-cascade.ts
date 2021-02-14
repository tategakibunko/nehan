import {
  HtmlElement,
  BasicStyle
} from "./public-api";

export class CssCascade {
  static getValue(element: HtmlElement, prop: string): string {
    const computedValue = element.computedStyle.getPropertyValue(prop);
    return computedValue ?? this.getSpecValue(element, prop);
  }

  static getSpecValue(element: HtmlElement, prop: string): string {
    const specValue = element.style.getPropertyValue(prop) ?? "";
    const defaultCss = BasicStyle.get(prop);
    switch (specValue) {
      // no value specified
      case "":
        // if inheritable value, inherit parent 'computed' value.
        if (defaultCss.inherit && element.parent) {
          return this.getValue(element.parent, prop);
        }
        // if root, use initial value.
        return defaultCss.initial;
      case "initial":
        return defaultCss.initial;
      case "inherit":
        if (element.parent) {
          // if inheritable value, inherit parent 'computed' value.
          if (defaultCss.inherit) {
            return this.getValue(element.parent, prop);
          }
          // if non inheritable value, inherit parent 'specified' value(or initial value).
          return this.getSpecValue(element.parent, prop);
        }
        // if no parent, use initial value instead.
        return defaultCss.initial;
      default:
        return specValue;
    }
  }
}

