import {
  FlowRootContext,
  HtmlElement,
  LayoutOutlineCallbacks
} from "./public-api";

export class BodyContext extends FlowRootContext {
  constructor(element: HtmlElement){
    super(element);
  }

  public isTooManyPages(): boolean {
    return this.counter.isTooManyPages();
  }

  public createOutlineElement(callbacks?: LayoutOutlineCallbacks): HTMLElement {
    return this.outline.createElement(callbacks);
  }
}
