import {
  Config,
  BoxEnv,
  ContextBoxEdge,
  LogicalBlockNode,
  LogicalBlockReNode,
  LogicalInlineReNode,
  LogicalInlineBlockNode,
  LogicalInlineNode,
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
  PageRootFormatContext,
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
  public blockNodeHistory: ILogicalNode[];
  public inlineText: string;
  public listMarker?: LogicalInlineNode;
  public text: string;
  public progress: number;
  private progressDelta: number;

  constructor(public env: BoxEnv, public parent?: ILayoutFormatContext) {
    this.name = env.element.toString(true);
    this.cursorPos = LogicalCursorPos.zero;
    this.contextBoxEdge = new ContextBoxEdge(env.edge);
    this.suspendedGens = [];
    this.inlineMargin = 0;
    this.blockNodes = [];
    this.inlineNodes = [];
    this.blockNodeHistory = [];
    this.inlineText = "";
    this.text = "";
    this.progress = 0;
    this.progressDelta = 1 / env.element.childNodes.length;
  }

  public get inlineRoot(): IFlowFormatContext {
    let ctx: ILayoutFormatContext | undefined = this;
    while (ctx) {
      if (ctx.env.isBlockLevel()) {
        return ctx as IFlowFormatContext;
      }
      ctx = ctx.parent;
    }
    throw new Error("inline root not found!");
  }

  public get pageRoot(): PageRootFormatContext {
    let ctx: ILayoutFormatContext | undefined = this;
    while (ctx) {
      if (ctx instanceof PageRootFormatContext) {
        return ctx;
      }
      ctx = ctx.parent;
    }
    throw new Error(`[${this.env.element.tagName}] root context not found!`);
  }

  public get flowRoot(): IFlowRootFormatContext {
    let ctx: ILayoutFormatContext | undefined = this;
    while (ctx) {
      if (ctx.env.display.isFlowRoot()) {
        return ctx as IFlowRootFormatContext;
      }
      ctx = ctx.parent;
    }
    throw new Error(`[${this.env.element.tagName}] flow root context not found!`);
  }

  public acceptLayoutReducer(visitor: ILayoutReducer, ...args: any): LayoutResult {
    return visitor.visit(this, ...args);
  }

  public get restExtent(): number {
    if (this.parent) {
      return this.parent.restExtent - this.cursorPos.before;
    }
    return this.maxExtent - this.cursorPos.before;
  }

  public get lastBlockNode(): ILogicalNode | undefined {
    return this.blockNodeHistory[this.blockNodeHistory.length - 1] || undefined;
  }

  public get totalLineCount(): number {
    return this.blockNodeHistory.filter(node => node instanceof LogicalLineNode).length;
  }

  public get localLineCount(): number {
    return this.blockNodes.filter(node => node instanceof LogicalLineNode).length;
  }

  private get listMarkerOffset(): number {
    if (!this.listMarker) {
      return 0;
    }
    if (this.env.listStyle.isPositionInside()) {
      return 0;
    }
    return (this.totalLineCount > 0) ? this.listMarker.measure : 0;
  }

  private get floatStartOffset(): number {
    if (!this.flowRoot.floatRegion) {
      return 0;
    }
    const startEdgeSize = this.contextBoxEdge.getBorderBoxEdgeSize("start");
    console.log("startEdgesize:", startEdgeSize);
    const floatStartPos = this.flowRoot.floatRegion.getSpacePosFromStartBound(this.flowRootPos.before);
    console.log("floatStartPos = %d(flow root before = %d)", floatStartPos, this.flowRootPos.before);
    return startEdgeSize > floatStartPos ? startEdgeSize : floatStartPos - startEdgeSize;
  }

  private get textAlignOffset(): number {
    if (this.env.textAlign.isEnd()) {
      return this.maxMeasure - this.textStartPos;
    }
    if (this.env.textAlign.isCenter()) {
      return Math.floor((this.maxMeasure - this.textStartPos) / 2);
    }
    return 0;
  }

  private get textStartPos(): number {
    let startPos = this.cursorPos.start;
    startPos += this.listMarkerOffset;
    return startPos;
  }

  // this value is referenced from text-fmt-context, ruby-fmt-context etc.
  public get contextRestMeasure(): number {
    if (this.flowRoot.floatRegion) {
      let floatSpaceSize = this.flowRoot.floatRegion.getSpaceMeasureAt(this.flowRootPos.before);
      floatSpaceSize -= this.contextBoxEdge.borderBoxMeasure;
      // console.log("contextRestMeasure at %d = %d", this.flowRootPos.before, floatSpaceSize);
      return Math.min(floatSpaceSize, this.maxMeasure) - this.textStartPos;
    }
    return this.restMeasure;
  }

  public get lineBoxStartOffset(): number {
    let offset = 0;
    offset += this.floatStartOffset;
    offset += this.listMarkerOffset;
    offset += this.textAlignOffset;
    return offset;
  }

  public get restMeasure(): number {
    return this.maxMeasure - this.textStartPos;
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

  public get autoContentBoxSize(): LogicalSize {
    return new LogicalSize({
      measure: this.maxMeasure,
      extent: this.cursorPos.before - this.contextBoxEdge.borderWidth.extent
    });
  }

  // localPos = position from start-before-corner of border box.
  // Convert inline cursor(0 ~ this.maxMeasure) to (delta ~ delta + this.maxMeasure)
  // where delta = this.inlineMargin + this.contextBoxEdge.measure.
  // Note that contextBoxEdge.measure and inline margin is added to start-pos in this logic,
  // but contextBoxEdge.extent and block margin is added to before-pos in generator logic(see block-node-generator.ts).
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
    // inline distance of nehan is provided by css(padding/border).
    // so we dont have to worry about inline 'absolute' distance here.
    const start = 0;

    // For lineHeadPos, we need distance from inside the border.
    // Unlike inline direction, border size of block direction(border-width-before/border-width-after)
    // is added to cursorPos.before in generator logic,
    // so we have to subtract it to get the accurate distance from inside the border.
    const before = this.cursorPos.before - this.contextBoxEdge.borderWidth.getSize("before");
    return new LogicalCursorPos({ start, before });
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

  public addInlineMarginEdge(direction: "start" | "end", marginSize: number) {
    this.contextBoxEdge.margin.addEdge(direction);
    this.cursorPos.start += marginSize;
  }

  public addBlockMarginEdge(direction: "before" | "after", marginSize: number) {
    const old = this.cursorPos.before;
    this.contextBoxEdge.margin.addEdge(direction);
    this.cursorPos.before += marginSize;
    console.log("[%s] addBlockMarginEdge(%s): %d -> %d", this.name, direction, old, this.cursorPos.before);
  }

  // called by reducer of this context.
  public getBorderCollapseAfterSize(): number {
    const afterBorderSize = this.contextBoxEdge.borderWidth.getSize("after");
    if (afterBorderSize <= 0) {
      return 0;
    }
    const cells = this.blockNodes.find(child => child instanceof LogicalTableCellsNode);
    if (cells instanceof LogicalTableCellsNode) {
      return Math.min(afterBorderSize, ...cells.children.map(cell => cell.border.width.after));
    }
    const lastChild = this.blockNodes[this.blockNodes.length - 1];
    if (lastChild instanceof LogicalBlockNode) {
      return Math.min(lastChild.border.width.after, afterBorderSize);
    }
    return 0;
  }

  public addLine(line: LogicalLineNode) {
    console.log(`[${this.name}] addLine:${this.cursorPos.before} -> ${this.cursorPos.before + line.size.extent}`);
    this.pushBlockNode(line);
  }

  public addBlock(block: LogicalBlockNode) {
    // console.log(`[${this.name}] addBlock:${this.cursorPos.before} -> ${this.cursorPos.before + block.extent}`);
    this.pushBlockNode(block);
  }

  public addBlockRe(block: LogicalBlockReNode) {
    // console.log("[%s] addBlock:%o", this.name, block);
    // console.log(`[${this.name}] addBlock:${this.cursorPos.before} -> ${this.cursorPos.before + block.extent}`);
    this.pushBlockNode(block);
  }

  public addTable(block: LogicalBlockNode) {
    this.pushBlockNode(block);
  }

  // parent: table
  public addTableRowGroup(block: LogicalBlockNode) {
    if (this.env.borderCollapse.isCollapse()) {
      this.collapseBeforeStartBorder(block);
    }
    this.pushBlockNode(block);
  }

  // parent: table-row-group
  public addTableRow(block: LogicalBlockNode) {
    if (this.env.borderCollapse.isCollapse()) {
      this.collapseBeforeStartBorder(block);
    }
    this.pushBlockNode(block);
  }

  // parent: table-row
  // collapse target: firstChild -> table-row.before, else prev.after
  // where prev = this.blocks[this.blocks.length - 1]
  public addTableCells(cells: LogicalTableCellsNode) {
    if (this.env.borderCollapse.isCollapse() && cells.children.some(cell => cell.border.width.before > 0)) {
      const cellBeforeBorderSizes = cells.children.map(cell => cell.border.width.before);
      const beforeBorderSize = this.contextBoxEdge.borderWidth.getSize("before");
      if (Math.min(...cellBeforeBorderSizes) > 0 && beforeBorderSize > 0) {
        const collapseSize = Math.min(beforeBorderSize, ...cellBeforeBorderSizes);
        cells.pos.before -= collapseSize;
        this.cursorPos.before -= collapseSize;
        // console.log("[%s] collapse before %d", this.name, collapseSize);
      }
    }
    this.pushBlockNode(cells);
  }

  public addBlockLink(block: LogicalBlockNode) {
    this.pushBlockNode(block);
  }

  public addInlineBlock(inlineBlock: LogicalInlineBlockNode) {
    this.pushInlineNode(inlineBlock);
  }

  public addInline(inline: LogicalInlineNode) {
    this.pushInlineNode(inline);
  }

  public addInlineRe(inline: LogicalInlineReNode) {
    this.pushInlineNode(inline);
  }

  public addInlineLink(inline: LogicalInlineNode) {
    this.pushInlineNode(inline);
  }

  // Note that marker text is not included to inlineText.
  public addListMarker(marker: LogicalInlineNode) {
    // console.log("[%s] added list marker:", this.name, marker);
    this.pushInlineNode(marker);
  }

  public addText(text: ILogicalNode) {
    this.pushInlineNode(text);
  }

  public addRuby(ruby: ILogicalNode) {
    this.pushInlineNode(ruby);
  }

  private pushInlineNode(inline: ILogicalNode) {
    this.inlineNodes.push(inline);
    this.cursorPos.start += inline.measure;
    this.inlineText += inline.text;
  }

  private pushBlockNode(block: ILogicalNode) {
    // const old = this.cursorPos.before;
    this.blockNodes.push(block);
    this.blockNodeHistory.push(block);
    this.cursorPos.before += block.extent;
    this.text += block.text;
    this.progress += this.progressDelta * block.progress;
    // console.log("[%s] pushBlockNode:%o(%d -> %d)", this.name, block, old, this.cursorPos.before);
  }

  private getBorderCollapseStartSize(block: LogicalBlockNode): number {
    return Math.min(this.contextBoxEdge.borderWidth.getSize("start"), block.border.width.start);
  }

  private getBorderCollapseBeforeSize(block: LogicalBlockNode): number {
    const lastChild = this.blockNodes[this.blockNodes.length - 1];
    if (lastChild instanceof LogicalBlockNode) {
      return Math.min(lastChild.border.width.after, block.border.width.before);
    }
    return Math.min(this.contextBoxEdge.borderWidth.getSize("before"), block.border.width.before);
  }

  private collapseBeforeStartBorder(block: LogicalBlockNode) {
    const startCollapseSize = this.getBorderCollapseStartSize(block);
    const beforeCollapseSize = this.getBorderCollapseBeforeSize(block);
    // Note that inline border is not added to cursorPos.
    // cursor of inline direction moves within 'content-area'(0 ~ maxMeasure) without border/padding.
    block.pos.start = -startCollapseSize;

    // But cursor of block direction includes block border, ant it's added to cursorPos.
    // So to cancel border of block direction, we have to cancel both current border size and collapsed size.
    block.pos.before -= this.contextBoxEdge.borderWidth.getSize("before") + beforeCollapseSize;
    this.cursorPos.before -= beforeCollapseSize;

    // console.log("[%s] collapseBeforeStartBorder(before = %d, start = %d)", this.name, beforeCollapseSize, startCollapseSize);
  }
}
