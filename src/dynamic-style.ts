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

  constructor(selector: string, name: string, callback: DynamicStyleCallback){
    this.selector = selector;
    this.name = name;
    this.callback = callback;
  }

  public call(element: HtmlElement, parent_ctx?: FlowContext): CssStyleDeclaration {
    let callback_context = new DynamicStyleContext({
      selector:this.selector,
      name: this.name,
      element: element,
      parentContext: parent_ctx
    });
    let call_result = this.callback(callback_context) || {};
    if(typeof call_result === "string"){
      let declr_block = {[this.name]:call_result};
      return CssParser.parseDeclarationBlock(this.selector, declr_block);
    }
    return CssParser.parseDeclarationBlock(this.selector, call_result);
  }
}
