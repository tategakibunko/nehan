import {
  BoxEnv,
  ContextBoxEdge,
  LogicalBlockNode,
  LogicalTableCellsNode,
  LogicalLineNode,
  LogicalCursorPos,
  LogicalEdgeDirection,
  LayoutResult,
  LogicalSize,
  ILayoutFormatContext,
  ILogicalNodeGenerator,
  ILayoutReducer,
  ILogicalNode,
  IFlowFormatContext,
  IFlowRootFormatContext,
} from './public-api'

export class FlowFormatContext implements IFlowFormatContext {
  public name: string;
  public child?: ILogicalNodeGenerator;
  public suspendedGens: ILogicalNodeGenerator[];
  public cursorPos: LogicalCursorPos; // range: (0,0) ~ (this.maxMeasure, this.maxExtent)
  public contextBoxEdge: ContextBoxEdge;
  public inlineMargin: number;
  public blockNodes: ILogicalNode[];
  public inlineNodes: ILogicalNode[];
  public inlineText: string;
  public text: string;

  constructor(
    public env: BoxEnv,
    public parent?: ILayoutFormatContext,
  ) {
    this.name = env.element.toString(true);
    this.cursorPos = LogicalCursorPos.zero;
    this.contextBoxEdge = new ContextBoxEdge(env.edge);
    this.suspendedGens = [];
    this.inlineMargin = 0;
    this.blockNodes = [];
    this.inlineNodes = [];
    this.inlineText = "";
    this.text = "";
  }

  public get inlineRoot(): IFlowFormatContext {
    if (this.env.isBlockLevel()) {
      return this;
    }
    let parent: ILayoutFormatContext | undefined = this.parent;
    while (parent) {
      if (parent.env.isBlockLevel()) {
        return parent as IFlowFormatContext;
      }
      parent = parent.parent;
    }
    throw new Error("inline root not found!");
  }

  public get flowRoot(): IFlowRootFormatContext {
    let parent: ILayoutFormatContext | undefined = this.parent;
    while (parent) {
      if (parent.env.display.isFlowRoot()) {
        return parent as IFlowRootFormatContext;
      }
      parent = parent.parent;
    }
    throw new Error(`[${this.env.element.tagName}] flow root not found!`);
  }

  public acceptLayoutReducer(visitor: ILayoutReducer, ...args: any): LayoutResult {
    return visitor.visit(this, args);
  }

  public get restExtent(): number {
    if (this.parent) {
      return this.parent.restExtent - this.cursorPos.before;
    }
    return this.maxExtent - this.cursorPos.before;
  }

  public get contextRestMeasure(): number {
    if (this.flowRoot.floatRegion) {
      const floatSpace = this.flowRoot.floatRegion.getSpaceMeasureAt(this.flowRootPos.before);
      return Math.min(floatSpace, this.maxMeasure) - this.cursorPos.start;
    }
    return this.restMeasure;
  }

  public get floatOffset(): number {
    if (!this.flowRoot.floatRegion) {
      return 0;
    }
    const startEdgeSize = this.contextBoxEdge.getBorderBoxEdgeSize("start");
    return this.flowRoot.floatRegion.getSpacePosFromStartBound(this.flowRootPos.before) - startEdgeSize;
  }

  public get restMeasure(): number {
    if (this.parent) {
      return this.parent.restMeasure - this.cursorPos.start;
    }
    return this.maxMeasure - this.cursorPos.start;
  }

  public get rootMeasure(): number {
    if (this.parent) {
      return this.parent.rootMeasure;
    }
    if (!this.env.measure) {
      throw new Error("root measure is not defined!");
    }
    return this.env.measure;
  }

  public get rootExtent(): number {
    if (this.parent) {
      return this.parent.rootExtent;
    }
    if (!this.env.extent) {
      throw new Error("root extent is not defined!");
    }
    return this.env.extent;
  }

  protected getContextMeasure(): number {
    if (!this.flowRoot.floatRegion) {
      return this.maxMeasure;
    }
    const spaceMeasure = this.flowRoot.floatRegion.getSpaceMeasureAt(this.flowRootPos.before);
    return Math.min(spaceMeasure, this.maxMeasure);
  }

  public get maxMeasure(): number {
    if (this.env.measure) {
      return this.env.measure;
    }
    if (this.parent) {
      return this.parent.maxMeasure;
    }
    return this.rootMeasure;
  }

  public get maxExtent(): number {
    return this.env.extent || this.rootExtent;
  }

  public get contentBoxSize(): LogicalSize {
    return new LogicalSize({
      measure: this.maxMeasure,
      extent: (this.env.extent || this.cursorPos.before) - this.contextBoxEdge.borderWidth.extent
    });
  }

  // localPos = position from start-before-corner of border box.
  // Convert inline cursor(0 ~ this.maxMeasure) to (delta ~ delta + this.maxMeasure)
  // where delta = this.inlineMargin + this.contextBoxEdge.measure.
  // Note that contextBoxEdge.measure is added by this.inlineMargin in this logic,
  // but contextBoxEdge.extent is added to cursorPos.before by generator logic(see block-node-generator.ts).
  public get localPos(): LogicalCursorPos {
    return new LogicalCursorPos({
      start: this.cursorPos.start + this.inlineMargin + this.contextBoxEdge.borderBoxMeasure,
      before: this.cursorPos.before
    });
  }

  // flowRootPos = position from start-before-corner of flowRoot element of this context.
  public get flowRootPos(): LogicalCursorPos {
    if (!this.parent || this.env.display.isFlowRoot()) {
      return this.localPos;
    }
    return this.parent.flowRootPos.translate(this.localPos);
  }

  // globalPos = position from start-before-corner of root element(body).
  public get globalPos(): LogicalCursorPos {
    if (!this.parent) {
      return this.localPos;
    }
    return this.parent.globalPos.translate(this.localPos);
  }

  public get lineHeadPos(): LogicalCursorPos {
    return new LogicalCursorPos({
      start: this.contextBoxEdge.borderBoxStart,
      before: this.cursorPos.before - this.contextBoxEdge.borderWidth.getSize("before")
    });
  }

  public addBorderBoxEdge(direction: LogicalEdgeDirection) {
    this.contextBoxEdge.padding.addEdge(direction);
    this.contextBoxEdge.borderWidth.addEdge(direction);
    if (direction === "before" || direction === "after") {
      const old = this.cursorPos.before;
      this.cursorPos.before += this.contextBoxEdge.padding.getSize(direction);
      this.cursorPos.before += this.contextBoxEdge.borderWidth.getSize(direction);
      console.log("[%s] addBorderBoxEdge(%s): %d -> %d", this.name, direction, old, this.cursorPos.before);
    }
  }

  public addMarginEdge(direction: LogicalEdgeDirection, marginSize: number) {
    this.contextBoxEdge.margin.addEdge(direction);
    this.cursorPos.before += marginSize;
  }

  public addLine(block: LogicalLineNode) {
    console.log(`[${this.name}] addLine:${this.cursorPos.before} -> ${this.cursorPos.before + block.size.extent}`);
    this.blockNodes.push(block);
    this.cursorPos.before += block.size.extent;
    this.text += block.text;
  }

  public addBlock(block: LogicalBlockNode) {
    console.log("[%s] addBlock:%o", this.name, block);
    console.log(`[${this.name}] addBlock:${this.cursorPos.before} -> ${this.cursorPos.before + block.extent}`);
    this.blockNodes.push(block);
    this.cursorPos.before += block.extent;
    this.text += block.text;
  }

  public addTableCells(cells: LogicalTableCellsNode) {
    if (this.env.borderCollapse.isCollapse() && cells.isFirstRow) {
      const cellBeforeBorderSizes = cells.children.map(cell => cell.border.width.before);
      const beforeBorderSize = this.contextBoxEdge.borderWidth.getSize("before");
      if (Math.min(...cellBeforeBorderSizes) > 0 && beforeBorderSize > 0) {
        const collapseSize = Math.min(beforeBorderSize, ...cellBeforeBorderSizes);
        cells.pos.before -= collapseSize;
        this.cursorPos.before -= collapseSize;
      }
    }
    this.blockNodes.push(cells);
    this.cursorPos.before += cells.extent;
    this.text += cells.text;
  }

  public addInline(inline: ILogicalNode) {
    this.inlineNodes.push(inline);
    this.cursorPos.start += inline.size.measure;
    this.inlineText += inline.text;
  }

  public addText(text: ILogicalNode) {
    this.inlineNodes.push(text);
    this.cursorPos.start += text.size.measure;
    this.inlineText += text.text;
  }

  public addRuby(ruby: ILogicalNode) {
    this.inlineNodes.push(ruby);
    this.cursorPos.start += ruby.size.measure;
    this.inlineText += ruby.text;
  }

  public addEmpha(empha: ILogicalNode) {
    this.inlineNodes.push(empha);
    this.cursorPos.start += empha.size.measure;
    this.inlineText += empha.text;
  }
}
