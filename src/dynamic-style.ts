import {
  DynamicStyleCallback,
  DynamicStyleContext,
  HtmlElement,
  FlowContext,
  CssParser,
  CssStyleDeclaration
} from "./public-api";

export class DynamicStyle {
  public selector: string;
  public name: string;
  public callback: DynamicStyleCallback;

  constructor(selector: string, name: string, callback: DynamicStyleCallback) {
    this.selector = selector;
    this.name = name;
    this.callback = callback;
  }

  public call(element: HtmlElement, parentCtx?: FlowContext): CssStyleDeclaration {
    let callbackCtx = new DynamicStyleContext({
      selector: this.selector,
      name: this.name,
      element: element,
      parentContext: parentCtx
    });
    let callResult = this.callback(callbackCtx) || {};
    if (typeof callResult === "string") {
      let declr_block = { [this.name]: callResult };
      return CssParser.parseDeclarationBlock(this.selector, declr_block);
    }
    return CssParser.parseDeclarationBlock(this.selector, callResult);
  }
}
