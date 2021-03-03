import {
  DynamicStyleCallback,
  DynamicStyleContext,
  NehanElement,
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

  public call(element: NehanElement, parentCtx?: any): CssStyleDeclaration {
    const callbackCtx = new DynamicStyleContext({
      selector: this.selector,
      name: this.name,
      element: element,
      parentContext: parentCtx
    });
    const callResult = this.callback(callbackCtx) || {};
    if (typeof callResult === "string") {
      const declrBlock = { [this.name]: callResult };
      return CssParser.parseDeclarationBlock(this.selector, declrBlock);
    }
    return CssParser.parseDeclarationBlock(this.selector, callResult);
  }
}
