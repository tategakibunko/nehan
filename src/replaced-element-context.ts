/*
import {
  ConstantContext,
  ReplacedElementRegion,
  FlowContext,
  HtmlElement,
  WritingMode,
  LayoutValue,
  LayoutControl,
  LogicalSize,
  LogicalBox,
} from "./public-api";

export class ReplacedElementContext extends ConstantContext {
  public isYielded: boolean;
  public isPageBreakBefore: boolean;
  protected region: ReplacedElementRegion;

  constructor(element: HtmlElement, parent: FlowContext){
    super(element, parent);
    this.region = new ReplacedElementRegion(this);
    this.isYielded = false;
    this.isPageBreakBefore = false;
  }

  public updateStyle(){
    this.env = this.parent.createChildEnv(this.element);
  }

  public updateLead(){
    // replaced-elements has no children, so just ignore.
  }

  public isLayout(): boolean {
    return true;
  }

  public hasNext(): boolean {
    if(this.isYielded){
      return false;
    }
    return super.hasNext();
  }

  public commit(){
    if(!this.isYielded){
      return;
    }
    super.commit();
  }

  public get writingMode(): WritingMode {
    return this.parent.env.writingMode;
  }

  public getValues(): LayoutValue [] {
    // prevent page-break if enough space is left.
    if(this.region.isEnoughSpaceLeft()){
      this.isYielded = true;
      let size = this.region.getSizeForRestSpace();
      let box = this.createReplacedElementBox(size);
      return [new LayoutValue(box)];
    }
    // if enough space is not left, but page is not broken yet, page-break.
    if(this.isPageBreakBefore === false){
      this.isPageBreakBefore = true;
      let page_break = LayoutControl.createPageBreak();
      return [new LayoutValue(page_break)];
    }
    // if enough space is not left, and page is already broken,
    // then resize image using max parent area.
    this.isYielded = true;
    let size = this.region.getSizeForMaxSpace();
    let box = this.createReplacedElementBox(size);
    return [new LayoutValue(box)];
  }

  public createReplacedElementBox(size: LogicalSize): LogicalBox {
    throw new Error("must be overrided");
  }
}
*/