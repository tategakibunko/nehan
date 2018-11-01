import {
  Anchor,
  FlowRootContext,
  HtmlElement,
  LayoutOutlineCallbacks
} from "./public-api";

export class BodyContext extends FlowRootContext {
  constructor(element: HtmlElement){
    super(element);
  }

  public getAnchor(anchor_name: string): Anchor | null {
    return this.outline.getAnchor(anchor_name);
  }

  public isTooManyPages(): boolean {
    return this.counter.isTooManyPages();
  }

  public createOutlineElement(callbacks?: LayoutOutlineCallbacks): HTMLElement {
    return this.outline.createElement(callbacks);
  }
}
