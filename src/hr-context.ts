import {
  ConstantContext,
  LayoutValue,
  HtmlElement,
  LogicalBox,
  HrRegion,
  BoxEnv,
  Config,
} from "./public-api";

export class HrContext extends ConstantContext {
  public updateLead(){
    // do child, do nothing
  }

  public updateStyle(){
    this.env = this.parent.createChildEnv(this.element);
  }

  public isFloat(): boolean {
    return false;
  }

  public isBlockLevel(): boolean {
    return true;
  }

  public isLayout(): boolean {
    return true;
  }

  public isPositionAbsolute(): boolean {
    return false;
  }

  public getValues(): LayoutValue [] {
    let hr = this.createHrBox(this.element);
    return [new LayoutValue(hr)];
  }

  public createHrBox(element: HtmlElement): LogicalBox {
    let region = new HrRegion(this.parent);
    let env = new BoxEnv(element, this.parent.env);
    let box = region.createHrBox(env);
    box.pageIndex = this.parent.bodyPageIndex;
    box.localPageIndex = 0; // always zero
    if(Config.debugLayout){
      console.log("[%s] createHrBox:", this.element.toString(), box);
    }
    return box;
  }
}
