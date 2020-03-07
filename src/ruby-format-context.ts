import {
  BoxEnv,
  LayoutResult,
  LogicalCursorPos,
  ILayoutFormatContext,
  ILogicalNodeGenerator,
  ILayoutReducer,
  LogicalInlineNode,
  FlowFormatContext,
  IFlowRootFormatContext,
  IFlowFormatContext,
  PageRootFormatContext,
} from './public-api'

export class RubyChildFormatContext extends FlowFormatContext {
  public get restMeasure(): number {
    return Infinity;
  }

  public get restExtent(): number {
    return Infinity;
  }
}

export interface RubyGroup {
  rb: LogicalInlineNode;
  rt: LogicalInlineNode;
}

export class RubyFormatContext implements ILayoutFormatContext {
  public rb?: LogicalInlineNode;
  public rt?: LogicalInlineNode;
  public child?: ILogicalNodeGenerator;
  public cursorPos: LogicalCursorPos;
  public rubyGroups: RubyGroup[];

  constructor(
    public env: BoxEnv,
    public parent: ILayoutFormatContext,
  ) {
    this.cursorPos = LogicalCursorPos.zero;
    this.rubyGroups = [];
  }

  public acceptLayoutReducer(visitor: ILayoutReducer, rubyGroup: RubyGroup): LayoutResult {
    return visitor.visit(this, rubyGroup);
  }

  public get globalPos(): LogicalCursorPos {
    return this.parent.globalPos.translate(this.cursorPos);
  }

  public get flowRootPos(): LogicalCursorPos {
    return this.parent.flowRootPos.translate(this.cursorPos);
  }

  public get localPos(): LogicalCursorPos {
    return this.parent.localPos.translate(this.cursorPos);
  }

  public get lineHeadPos(): LogicalCursorPos {
    return this.parent.lineHeadPos;
  }

  public get pageRoot(): PageRootFormatContext {
    return this.parent.pageRoot;
  }

  public get flowRoot(): IFlowRootFormatContext {
    return this.parent.flowRoot;
  }

  public get inlineRoot(): IFlowFormatContext {
    return this.parent.inlineRoot;
  }

  public get contextRestMeasure(): number {
    return this.parent.contextRestMeasure;
  }

  public get restMeasure(): number {
    return this.parent.contextRestMeasure - this.cursorPos.start;
  }

  public get restExtent(): number {
    return this.parent.restExtent - this.cursorPos.before;
  }

  public get maxMeasure(): number {
    return this.parent.maxMeasure;
  }

  public get maxExtent(): number {
    return this.parent.maxExtent;
  }

  public get rootMeasure(): number {
    return this.parent.rootMeasure;
  }

  public get rootExtent(): number {
    return this.parent.rootExtent;
  }

  public addRubyBase(rb: LogicalInlineNode) {
    this.rb = rb;
    this.groupRuby();
  }

  public addRubyText(rt: LogicalInlineNode) {
    this.rt = rt;
    this.groupRuby();
  }

  private groupRuby() {
    if (!this.rb || !this.rt) {
      return;
    }
    this.rubyGroups.push({ rb: this.rb, rt: this.rt });
    this.rb = this.rt = undefined;
  }
}


