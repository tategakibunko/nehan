import {
  HtmlElement,
  DynamicStyle,
  DomCallback,
  CssParser,
  CssProp,
  CssText,
  ILogicalCssEvaluator,
  IFlowRootFormatContext,
  NativeStyleMap,
} from "./public-api";

// Original abstraction of CSSStyleDeclaration in nehan.js
// url - https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
export class CssStyleDeclaration {
  private styles: Map<string, string>; // (css_property, CssSpecifiedValue) set
  private dynamicStyles: DynamicStyle[]; // dynamically declared style (function)
  private domCallbacks: DomCallback[]; // @oncreate function for dom creation.

  constructor() {
    this.styles = new Map<string, string>();
    this.dynamicStyles = [];
    this.domCallbacks = [];
  }

  public hasDynamicStyles(): boolean {
    return this.dynamicStyles.length > 0;
  }

  public isEmpty(): boolean {
    return this.styles.size === 0 &&
      this.dynamicStyles.length === 0 &&
      this.domCallbacks.length === 0;
  }

  public callDomCallbacks(box: any, dom: HTMLElement, flowRoot: IFlowRootFormatContext) {
    this.domCallbacks.forEach(callback => callback.call(box, dom, flowRoot));
  }

  public getPropertyValue(prop: string): string | null {
    return this.styles.get(prop) || null;
  }

  public setProperty(prop: string, value: string): CssStyleDeclaration {
    // Notice that declaration is many if css is shorthanded.
    const cssProp = new CssProp(prop);
    const cssText = new CssText({ prop: cssProp.value, value: value });
    const declrs = CssParser.parseDeclaration(cssProp, cssText);
    return declrs.reduce((acm, declr) => {
      acm.styles.set(declr.prop, declr.value);
      return acm;
    }, this);
  }

  public addDynamicStyle(dynamicStyle: DynamicStyle): CssStyleDeclaration {
    this.dynamicStyles.push(dynamicStyle);
    return this;
  }

  public addDomCallback(callback: DomCallback): CssStyleDeclaration {
    this.domCallbacks.push(callback);
    return this;
  }

  // [Warning]
  // Removing shorthanded property doesn't work.
  // Because all shorthanded properties is inserted as each decribed properties.
  // For example, if you set "margin:1em", it's stored as margin-(before|end|after|start):1em.
  // So removeProperty("margin") doesn't work. If you want to remove 'margin' in this case,
  // you have to call removeProperty("margin-before"), .... removeProperty("margin-start").
  public removeProperty(prop: string): boolean {
    return this.styles.delete(prop);
  }

  public forEach(fn: (key: string, value: string) => void) {
    // [CAUTION] (value, key) in Map, but fn(key, value).
    this.styles.forEach((value: string, key: string) => fn(key, value));
  }

  // import [css_declr].styles to this.styles and return [this].
  public mergeFrom(src: CssStyleDeclaration): CssStyleDeclaration {
    src.styles.forEach((value, prop) => {
      this.styles.set(prop, value);
    });
    this.dynamicStyles = this.dynamicStyles.concat(src.dynamicStyles);
    this.domCallbacks = this.domCallbacks.concat(src.domCallbacks);
    return this;
  }

  public getDynamicStyle(element: HtmlElement, parentCtx?: any): CssStyleDeclaration {
    return this.dynamicStyles.reduce((style, dynamic) => {
      const dynamicStyle = dynamic.call(element, parentCtx) || {};
      return style.mergeFrom(dynamicStyle);
    }, new CssStyleDeclaration());
  }

  public acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    return visitor.visitUnmanagedCssProps(this);
  }
}
