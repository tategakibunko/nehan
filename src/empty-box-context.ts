import {
  ConstantContext,
  LayoutValue,
  LogicalBox,
  LogicalSize,
  BoxEnv,
  Config
} from "./public-api";

export class EmptyBoxContext extends ConstantContext {
  public updateStyle() {
    this.env = this.parent.createChildEnv(this.element);
  }

  public updateLead() {
    // no children, do nothing
  }

  public isFloat(): boolean {
    return false;
  }

  public isBlockLevel(): boolean {
    return false;
  }

  public isLayout(): boolean {
    return true;
  }

  public isPositionAbsolute(): boolean {
    return false;
  }

  public getValues(): LayoutValue[] {
    let box = this.createEmptyBox();
    return [new LayoutValue(box)];
  }

  public createEmptyBox(): LogicalBox {
    let env = new BoxEnv(this.element);
    let size = new LogicalSize({ measure: 0, extent: 0 });
    let box = new LogicalBox(env, env.boxType, size);
    box.contextEdge = env.edge; // single output, so fixed.
    box.pageIndex = this.parent.bodyPageIndex;
    box.localPageIndex = this.parent.pageIndex;
    if (Config.debugLayout) {
      console.log("[%s@ctx] createEmptyBox:", this.element.toString(true), box);
    }
    return box;
  }
}
