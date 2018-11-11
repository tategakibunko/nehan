import {
  LogicalBox,
  LogicalPadding,
  LogicalBorder,
  LogicalMargin,
  LogicalCursorPosValue,
  HtmlElement,
  NativeStyleMap,
} from "./public-api";

export interface LogicalBoxEdgeValue {
  padding: LogicalPadding,
  border: LogicalBorder,
  margin: LogicalMargin
}

export class LogicalBoxEdge {
  public padding: LogicalPadding;
  public border: LogicalBorder;
  public margin: LogicalMargin;

  constructor(values: LogicalBoxEdgeValue){
    this.padding = values.padding;
    this.border = values.border;
    this.margin = values.margin;
  }

  static load(element: HtmlElement): LogicalBoxEdge {
    return new LogicalBoxEdge({
      padding:LogicalPadding.load(element),
      border:LogicalBorder.load(element),
      margin:LogicalMargin.load(element)
    });
  }

  static get none(): LogicalBoxEdge {
    return new LogicalBoxEdge({
      padding:LogicalPadding.none,
      border:LogicalBorder.none,
      margin:LogicalMargin.none
    });
  }

  public clone(): LogicalBoxEdge {
    return new LogicalBoxEdge({
      padding:this.padding.clone(),
      border:this.border.clone(),
      margin:this.margin.clone()
    });
  }

  public clearBefore(){
    this.padding.before = 0;
    this.border.clearBefore();
    this.margin.before = 0;
  }

  public clearAfter(){
    this.padding.after = 0;
    this.border.clearAfter();
    this.margin.after = 0;
  }

  public clearStart(){
    this.padding.start = 0;
    this.border.clearStart();
    this.margin.start = 0;
  }

  public clearEnd(){
    this.padding.end = 0;
    this.border.clearEnd();
    this.margin.end = 0;
  }

  public get start(): number {
    return this.padding.start + this.border.startWidth + this.margin.start;
  }

  public get end(): number {
    return this.padding.end + this.border.endWidth + this.margin.end;
  }

  public get before(): number {
    return this.padding.before + this.border.beforeWidth + this.margin.before;
  }

  public get after(): number {
    return this.padding.after + this.border.afterWidth + this.margin.after;
  }

  public get extent(): number {
    return this.before + this.after;
  }

  public get measure(): number {
    return this.start + this.end;
  }

  public getInnerBoxOffset(): LogicalCursorPosValue {
    return {
      start:this.padding.start,
      before:this.padding.before
    };
  }

  public getCss(box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    this.padding.getCss(box).mergeTo(css);
    this.border.getCss(box).mergeTo(css);
    // root margin is out of nehan layouting(in other words, use native css instead)
    if(!box.isRootBox()){
      this.margin.getCss(box).mergeTo(css);
    }
    return css;
  }
}
