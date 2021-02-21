import {
  DomCallbackContext,
  IFlowRootFormatContext,
} from "./public-api";

export type DomCallbackValue = (context: DomCallbackContext) => void

export class DomCallback {
  public selector: string;
  public name: string;
  public callback: DomCallbackValue;

  constructor(selector: string, name: string, callback: DomCallbackValue) {
    this.selector = selector;
    this.name = name;
    this.callback = callback;
  }

  public call(box: any, dom: HTMLElement, flowRoot: IFlowRootFormatContext) {
    return this.callback({
      selector: this.selector,
      name: this.name,
      box,
      dom,
      flowRoot,
    });
  }
}
