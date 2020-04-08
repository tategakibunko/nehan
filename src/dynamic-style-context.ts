import {
  Utils,
  HtmlElement,
  CssLength,
  ILayoutFormatContext,
  FlowFormatContext,
} from "./public-api";

export interface DynamicStyleContextValue {
  selector: string;
  name: string;
  element: HtmlElement;
  parentContext?: ILayoutFormatContext;
}

// dynamic context is called after CssLoader::loadSpecifiedStyle,
// so when this context is called, element.style(specified value) is already set,
// but computed value is not set yet.
export class DynamicStyleContext {
  public selector: string;
  public name: string;
  public element: HtmlElement;
  public parentContext?: ILayoutFormatContext;

  constructor(value: DynamicStyleContextValue) {
    this.selector = value.selector;
    this.name = value.name;
    this.element = value.element;
    this.parentContext = value.parentContext;
  }

  public get fontSize(): number {
    return CssLength.computeFontSize(this.element);
  }

  public get remSize(): number {
    if (this.parentContext instanceof FlowFormatContext && this.parentContext.pageRoot) {
      this.parentContext.pageRoot.env.font.size;
    }
    return this.emSize;
  }

  public get emSize(): number {
    return CssLength.computeFontSize(this.element);
  }

  public get lineHeight(): number {
    const value = this.element.computedStyle.getPropertyValue("line-height");
    if (!value) {
      throw new Error("line-height is not defined!");
    }
    if (value.indexOf("px") < 0) {
      return Math.floor(this.emSize * parseFloat(value));
    }
    return Utils.atoi(value);
  }

  public get restContextBoxExtent(): number {
    if (this.parentContext) {
      return this.parentContext.restExtent;
    }
    throw new Error("parent context is not defined");
  }
}
