import {
  Config,
  BoxEnv,
  ContextBoxEdge,
  LogicalFloat,
  LogicalBlockNode,
  LogicalBlockReNode,
  LogicalInlineReNode,
  LogicalInlineBlockNode,
  LogicalInlineNode,
  LogicalTextNode,
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
  ILogicalNodePos,
  IFlowFormatContext,
  IFlowRootFormatContext,
  PageRootFormatContext,
  ILogicalFloatableNode,
} from './public-api'

export class FlowFormatContext implements IFlowFormatContext {
  public name: string;
  public child?: ILogicalNodeGenerator;
  public suspendedGens: ILogicalNodeGenerator[];
  public cursorPos: LogicalCursorPos; // range: (0,0) ~ (this.maxMeasure, this.maxExtent)
  public contextBoxEdge: ContextBoxEdge;
  public curChildStartMargin: number;
  public blockNodes: ILogicalNode[];
  public inlineNodes: ILogicalNode[];
  public blockNodeHistory: ILogicalNode[];
  public inlineText: string;
  public listMarker?: LogicalInlineNode;
  public text: string;
  public progress: number;

  constructor(public env: BoxEnv, public parent?: ILayoutFormatContext) {
    this.name = Config.useStrictFormatContextName ? env.element.toString(true) : env.element.getNodeName();
    this.cursorPos = LogicalCursorPos.zero;
    this.contextBoxEdge = new ContextBoxEdge(env.edge);
    this.suspendedGens = [];
    this.curChildStartMargin = 0; // current child <-> this.context marginStart in block flow mode. [TODO] rename var.
    this.blockNodes = [];
    this.inlineNodes = [];
    this.blockNodeHistory = [];
    this.inlineText = "";
    this.text = "";
    this.progress = 0;
  }

  public get inlineRoot(): IFlowFormatContext {
    let ctx: ILayoutFormatContext | undefined = this;
    while (ctx) {
      if (ctx.env.display.isBlockLevel() || ctx.env.display.isFlowRoot()) {
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
      if (ctx.env.display.isFlowRoot() || ctx instanceof PageRootFormatContext) {
        return ctx as IFlowRootFormatContext;
      }
      ctx = ctx.parent;
    }
    throw new Error(`[${this.env.element.tagName}] flow root context not found!`);
  }

  // [NOTICE] For performance reason, we should not write this code recursive way.
  public get parentBlock(): IFlowFormatContext | undefined {
    let ctx: ILayoutFormatContext | undefined = this.parent;
    while (ctx) {
      if (ctx.env.display.isBlockLevel() || ctx.env.display.isFlowRoot()) {
        return ctx as IFlowFormatContext;
      }
      ctx = ctx.parent;
    }
    return undefined;
  }

  public acceptLayoutReducer(visitor: ILayoutReducer, ...args: any): LayoutResult {
    return visitor.visit(this, ...args);
  }

  public get restExtent(): number {
    const parentBlock = this.parentBlock;
    if (parentBlock) {
      return parentBlock.restExtent - this.cursorPos.before;
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
    const startEdgeSize = this.contextBoxEdge.borderWidth.getSize("start");
    // console.log("startEdgesize:", startEdgeSize);
    const floatStartPos = this.flowRoot.floatRegion.getSpacePosFromStartBound(this.flowRootPos.before);
    // console.log("floatStartPos = %d(flow root before = %d)", floatStartPos, this.flowRootPos.before);
    const offset = startEdgeSize > floatStartPos ? startEdgeSize : floatStartPos - startEdgeSize;
    // console.log("floatStartOffset = %d", offset);
    return offset;
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

  // Hierarchical edge sizes are not inlucded in returned value of 'floatRegion.getSpaceMeasureAt(xxx)'.
  // You can get total edge size from flowRootContext until this context by this property.
  private get parentInlineEdgeSize(): number {
    let parent = this.parent;
    let size = 0;
    while (parent) {
      size += parent.env.edge.measure;
      // console.log("parent(%s) edge size = %d", parent.env.element.getNodeName(), parent.env.edge.measure);
      if (parent === this.flowRoot) {
        break;
      }
      parent = parent.parent;
    }
    // console.log("[%s] inlineEdgeSizeUntilFlowRoot = %d", this.name, size);
    return size;
  }

  // this value is referenced from text-fmt-context, ruby-fmt-context etc.
  public get contextRestMeasure(): number {
    if (this.flowRoot.floatRegion) {
      const contextEdgeSize = this.contextBoxEdge.borderBoxMeasure + this.parentInlineEdgeSize;
      const floatSpaceSize = this.flowRoot.floatRegion.getSpaceMeasureAt(this.flowRootPos.before) - contextEdgeSize;
      // console.log("[%s] contextRestMeasure at %d = %d, maxMeasure = %d", this.name, this.flowRootPos.before, floatSpaceSize, this.maxMeasure);
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
    if (this.parent) {
      return Math.min(this.parent.restMeasure, this.maxMeasure) - this.cursorPos.start;
    }
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

  public get maxMeasure(): number {
    if (this.env.measure !== null) {
      return this.env.measure;
    }
    if (this.parent) {
      return this.parent.maxMeasure;
    }
    return this.rootMeasure;
  }

  public get maxExtent(): number {
    if (this.env.extent !== null) {
      return this.env.extent;
    }
    return this.rootExtent;
  }

  public get contentBlockSize(): LogicalSize {
    const measure = this.maxMeasure;
    const extent = (this.env.extent || this.cursorPos.before) - this.contextBoxEdge.borderWidth.extent;
    return new LogicalSize({ measure, extent });
  }

  public get autoContentBlockSize(): LogicalSize {
    return new LogicalSize({
      measure: this.maxMeasure,
      extent: this.cursorPos.before - this.contextBoxEdge.borderWidth.extent
    });
  }

  // shrink to fit size
  public get contentInlineBlockSize(): LogicalSize {
    const measure = (this.env.measure !== null) ? this.env.measure : Math.max(...this.blockNodes.map(block => block.measure));
    const extent = ((this.env.extent !== null) ? this.env.extent : this.cursorPos.before) - this.contextBoxEdge.borderWidth.extent;
    return new LogicalSize({ measure, extent });
  }

  public get autoContentInlineBlockSize(): LogicalSize {
    const measure = (this.env.measure !== null) ? this.env.measure : Math.max(...this.blockNodes.map(block => block.measure));
    const extent = this.cursorPos.before - this.contextBoxEdge.borderWidth.extent
    return new LogicalSize({ measure, extent });
  }

  // start-before position of this context from nearest flowRoot.
  public get boxPos(): ILogicalNodePos {
    return {
      offsetPos: this.parent ?
        this.parent.flowRootPos.translate({
          start: this.curChildStartMargin,
          before: this.contextBoxEdge.margin.getSize("before")
        }) : this.cursorPos.cloneValue(),
      clientPos: {
        start: this.contextBoxEdge.borderBoxStartSize,
        before: this.contextBoxEdge.borderBoxBeforeSize
      }
    };
  }

  // localPos = cursor position from start-before-corner of 'border box'(of this context).
  // Convert inline cursor(0 ~ this.maxMeasure) to (delta ~ delta + this.maxMeasure)
  // where delta = this.curChildStartMargin + this.contextBoxEdge.measure.
  // Note that contextBoxEdge.measure and inline margin is added to start-pos in this logic,
  // but contextBoxEdge.extent and block margin is added to before-pos in generator logic(see block-node-generator.ts).
  public get localPos(): LogicalCursorPos {
    return new LogicalCursorPos({
      start: this.cursorPos.start + this.curChildStartMargin + this.contextBoxEdge.borderBoxStartSize,
      before: this.cursorPos.before
    });
  }

  // flowRootPos = cursor position from start-before-corner of flowRoot element of this context.
  public get flowRootPos(): LogicalCursorPos {
    if (!this.parent || this.env.display.isFlowRoot()) {
      return this.localPos;
    }
    return this.parent.flowRootPos.translate(this.localPos);
  }

  // globalPos = cursor position from start-before-corner of root element(body).
  public get globalPos(): LogicalCursorPos {
    if (!this.parent) {
      return this.localPos;
    }
    return this.parent.globalPos.translate(this.localPos);
  }

  public get blockPos(): LogicalCursorPos {
    const parentBlock = this.parentBlock;
    return parentBlock ? parentBlock.localPos : LogicalCursorPos.zero;
  }

  public get lineHeadPos(): LogicalCursorPos {
    // inline distance of nehan is provided by css(padding/border).
    // so we dont have to worry about inline 'absolute' distance here.
    const start = 0;

    // For lineHeadPos, we need distance from inside of the border.
    // Unlike inline level, block border(border-width-before) is added to cursorPos.before in generator,
    // so we have to subtract it to get the accurate distance from inside of the border.
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
      if (Config.debugLayout) {
        console.log("[%s] addBorderBoxEdge(%s): %d -> %d", this.name, direction, old, this.cursorPos.before);
      }
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
    if (Config.debugLayout) {
      console.log("[%s] addBlockMarginEdge(%s): %d -> %d", this.name, direction, old, this.cursorPos.before);
    }
  }

  // called by reducer of this context.
  public getBorderCollapseAfterSize(): number {
    const afterBorderSize = this.contextBoxEdge.borderWidth.getSize("after");
    if (afterBorderSize <= 0) {
      return 0;
    }
    const cells = this.blockNodes.find(child => child instanceof LogicalTableCellsNode);
    if (cells instanceof LogicalTableCellsNode) {
      return Math.min(afterBorderSize, ...cells.children.map(cell => {
        return cell instanceof LogicalBlockNode ? cell.border.width.after : 0;
      }));
    }
    const lastChild = this.blockNodes[this.blockNodes.length - 1];
    if (lastChild instanceof LogicalBlockNode) {
      return Math.min(lastChild.border.width.after, afterBorderSize);
    }
    return 0;
  }

  public setFloat(block: ILogicalFloatableNode, float: LogicalFloat) {
    this.flowRoot.addFloat(block, float, this.maxMeasure, this.flowRootPos);
  }

  public addLine(line: LogicalLineNode) {
    if (Config.ignoreEmptyLine && line.children.length === 0) {
      return;
    }
    this.pushBlockNode(line);
  }

  public addBlock(block: LogicalBlockNode) {
    this.pushBlockNode(block);
  }

  public addBlockRe(block: LogicalBlockReNode) {
    if (Config.ignoreZeroRe && block.size.hasZero()) {
      return;
    }
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
    if (this.env.borderCollapse.isCollapse() && cells.children.some(cell => {
      return cell instanceof LogicalBlockNode ? cell.border.width.before > 0 : false;
    })) {
      const cellBeforeBorderSizes = cells.children.map(cell => {
        return cell instanceof LogicalBlockNode ? cell.border.width.before : 0;
      });
      const beforeBorderSize = this.contextBoxEdge.borderWidth.getSize("before");
      if (Math.min(...cellBeforeBorderSizes) > 0 && beforeBorderSize > 0) {
        const collapseSize = Math.min(beforeBorderSize, ...cellBeforeBorderSizes);
        cells.rowPos.before -= collapseSize;
        this.cursorPos.before -= collapseSize;
        if (Config.debugLayout) {
          console.log("[%s] collapse before %d", this.name, collapseSize);
        }
      }
    }
    this.pushBlockNode(cells);
  }

  public addBlockLink(block: LogicalBlockNode) {
    this.pushBlockNode(block);
  }

  public addInlineBlock(inlineBlock: LogicalInlineBlockNode) {
    if (Config.ignoreEmptyInline && inlineBlock.size.hasZero() && inlineBlock.children.length === 0) {
      return;
    }
    this.pushInlineNode(inlineBlock);
  }

  public addInline(inline: LogicalInlineNode) {
    if (Config.ignoreEmptyInline && inline.children.length === 0) {
      return;
    }
    this.pushInlineNode(inline);
  }

  public addInlineRe(inline: LogicalInlineReNode) {
    if (Config.ignoreZeroRe && inline.size.hasZero()) {
      return;
    }
    this.pushInlineNode(inline);
  }

  public addInlineLink(inline: LogicalInlineNode) {
    const id = inline.env.element.id;
    // if element has id(anchored element), keep it alive even if it's empty.
    if (!id && Config.ignoreEmptyInline && inline.children.length === 0) {
      return;
    }
    // if empty anchor, use zero size.
    if (id && inline.children.length === 0) {
      inline.size.extent = 0;
    }
    this.pushInlineNode(inline);
  }

  // Note that marker text is not included to inlineText.
  public addListMarker(marker: LogicalInlineNode) {
    this.pushInlineNode(marker, false);
  }

  public addText(text: LogicalTextNode) {
    if (text.children.length === 0) {
      return;
    }
    this.pushInlineNode(text);
  }

  public addRuby(ruby: ILogicalNode) {
    this.pushInlineNode(ruby);
  }

  private addAnchorElement(id: string, node: ILogicalNode) {
    const anchor = this.pageRoot.getAnchor(id);
    if (anchor) {
      anchor.box = node; // block-level node will overwrite this field for same element id.
      if (anchor.pageIndex < 0) {
        anchor.pageIndex = this.pageRoot.pageCount; // pageIndex is not overwritten.
      }
    }
  }

  private pushInlineNode(inline: ILogicalNode, hasText = true) {
    const old = this.cursorPos.start;
    this.inlineNodes.push(inline);
    this.cursorPos.start += inline.measure;
    if (hasText) {
      this.inlineText += inline.text;
    }
    if (inline.env.element.id) {
      this.addAnchorElement(inline.env.element.id, inline);
    }
    if (Config.debugLayout) {
      console.log("[%s] pushInlineNode:%o(%d -> %d)", this.name, inline, old, this.cursorPos.start);
    }
  }

  private pushBlockNode(block: ILogicalNode) {
    const old = this.cursorPos.before;
    this.text += block.text;
    this.progress = Math.min(1, this.progress + block.progress / this.env.element.childNodes.length);
    // console.log("[%s] child-progress: %f, block-progress: %f", this.name, block.progress, this.progress);
    this.blockNodes.push(block);
    this.blockNodeHistory.push(block);
    if (!block.env.position.isAbsolute()) {
      this.cursorPos.before += block.extent;
    }
    if (block.env.element.id) {
      this.addAnchorElement(block.env.element.id, block);
    }
    switch (block.env.element.tagName) {
      case "h1": case "h2": case "h3": case "h4": case "h5": case "h6":
        const section = this.pageRoot.getHeaderSection(block.env.element);
        if (section && section.pageIndex < 0) {
          section.pageIndex = this.pageRoot.pageCount; // set strict page index for header.
        }
        break;
    }
    if (Config.debugLayout) {
      console.log("[%s] pushBlockNode:%o(%d -> %d)", this.name, block, old, this.cursorPos.before);
    }
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
    block.layoutPos.start = -startCollapseSize;

    // But cursor of block direction includes block border, ant it's added to cursorPos.
    // So to cancel border of block direction, we have to cancel both current border size and collapsed size.
    block.layoutPos.before -= this.contextBoxEdge.borderWidth.getSize("before") + beforeCollapseSize;
    this.cursorPos.before -= beforeCollapseSize;

    // console.log("[%s] collapseBeforeStartBorder(before = %d, start = %d)", this.name, beforeCollapseSize, startCollapseSize);
  }
}
