/*
import {
  ILayoutContext,
  HtmlElement,
  LayoutValue,
  Config
} from "./public-api";

export class LayoutGenerator implements ILayoutContext {
  public element: HtmlElement;
  protected context: ILayoutContext;
  protected iterator: IterableIterator<LayoutValue []>;

  constructor(context: ILayoutContext){
    this.element = context.element;
    this.context = context;
    this.iterator = this.createIterator();
  }

  public get name(): string {
    return this.context.name;
  }

  public get progress(): number {
    return this.context.progress;
  }

  public pause(){
    this.context.pause();
  }

  public abort(){
    this.context.abort();
  }

  public resume(){
    this.context.resume();
  }

  public commit(){
    this.context.commit();
  }

  public rollback(){
    if(Config.debugLayout){
      console.log("[%s] rollback!", this.context.name);
    }
    this.context.rollback();
  }

  public updateStyle(){
    this.context.updateStyle();
  }

  public updateLead(){
    this.context.updateLead();
  }

  public hasNext(): boolean {
    return this.context.hasNext();
  }

  public isLayout(): boolean {
    return this.context.isLayout();
  }

  public getNext(): IteratorResult<LayoutValue []> {
    return this.iterator.next();
  }

  public isStatusNormal(): boolean {
    return this.context.isStatusNormal();
  }

  public isFloat(): boolean {
    return this.context.isFloat();
  }

  public isPositionAbsolute(): boolean {
    return this.context.isPositionAbsolute();
  }

  public isBlockLevel(): boolean {
    return this.context.isBlockLevel();
  }

  protected* createIterator(): IterableIterator<LayoutValue []> {
    throw new Error("LayoutGenerator.createIterator must be overrided.");
  }
}
*/