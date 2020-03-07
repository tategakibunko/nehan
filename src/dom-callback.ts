import {
  DomCallbackContext,
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

  // [TODO]
  // To keep backward compatibility, we use 'any' type for box argument.
  // But this must be updated to ILogicalNode in the future.
  public call(box: any, dom: HTMLElement) {
    return this.callback({
      selector: this.selector,
      name: this.name,
      box: box,
      dom: dom
    });
  }
}
