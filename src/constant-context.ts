import {
  HtmlElement,
  ILayoutContext, getContextName,
  FlowContext,
  LayoutCounter,
  LayoutStatus,
  LayoutValue,
  BoxEnv,
  Config
} from "./public-api";

export class ConstantContext implements ILayoutContext {
  public element: HtmlElement;
  public progress: number;
  public env: BoxEnv;
  public parent: FlowContext; // not null
  protected counter: LayoutCounter;
  protected status: LayoutStatus;

  constructor(element: HtmlElement, parent: FlowContext) {
    this.element = element;
    this.progress = 1;
    this.env = new BoxEnv(element);
    this.parent = parent;
    this.counter = new LayoutCounter();
    this.status = new LayoutStatus();
  }

  public get name(): string {
    return getContextName(this.element, "const");
  }

  public isStatusNormal(): boolean {
    return this.status.isNormal();
  }

  public getValues(): LayoutValue[] {
    throw new Error("must be overrided");
  }

  public updateStyle() {
    throw new Error("must be overrided");
  }

  public updateLead() {
    throw new Error("must be overrided");
  }

  public isFloat(): boolean {
    return this.env.isFloat();
  }

  public isPositionAbsolute(): boolean {
    return this.env.isPositionAbsolute();
  }

  public isBlockLevel(): boolean {
    return this.env.isBlockLevel();
  }

  public isLayout(): boolean {
    throw new Error("must be override");
  }

  public isFirstOutput(): boolean {
    return true;
  }

  public isFinalOutput(): boolean {
    return true;
  }

  public resume() {
    this.status.setNormal();
  }

  public pause() {
    this.status.setPause();
  }

  public abort() {
    console.warn("[%s] aborted", this.name);
    this.status.setAbort();
  }

  public commit() {
    this.counter.incYield();
    this.counter.resetRollback();
    if (Config.debugLayout) {
      console.log("[%s] is commited!", this.name);
    }
  }

  public rollback() {
    this.counter.resetYield();
    this.counter.incRollback();
    if (Config.debugLayout) {
      console.log("[%s] is rollbacked!", this.name);
    }
  }

  public hasNext(): boolean {
    if (this.status.isAbort()) {
      return false;
    }
    return this.counter.isNotYielded(); // output only once.
  }

  public getNext(): IteratorResult<LayoutValue[]> {
    throw new Error("not implemented.");
  }
}
