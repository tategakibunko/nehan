/*
import {
  HtmlElement,
  FlowContext,
  ConstantContext,
  LayoutControl,
  LayoutValue
} from "./public-api";

export class ControlContext extends ConstantContext {
  public control: LayoutControl;

  constructor(element: HtmlElement, parent: FlowContext, control: LayoutControl){
    super(element, parent);
    control.isGeneratorValue = true;
    this.control = control;
  }

  public updateLead(){
    // this.isLayout() === false, do nothing
  }

  public updateStyle(){
    // this.isLayout() === false, do nothing
  }

  public isLayout(): boolean {
    return false;
  }

  public isBlockLevel(): boolean {
    return false;
  }

  public isFloat(): boolean {
    return false;
  }

  public getValues(): LayoutValue [] {
    return [new LayoutValue(this.control)];
  }
}
*/