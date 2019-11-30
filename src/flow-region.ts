import {
  FlowContext,
  FlowContent,
  FloatRegion,
  Config,
  HtmlElement,
  LogicalBox,
  LogicalBoxEdge,
  LogicalCursorPos,
  LogicalSize,
  LogicalClear,
  LogicalRect,
  BoxContent,
  BoxContentSize,
  BoxEnv,
  BoxType,
  isCharacter,
  WritingMode
} from "./public-api";

export class FlowRegion {
  protected content: FlowContent;
  protected context: FlowContext;
  protected cursor: LogicalCursorPos;
  protected floatRegion: FloatRegion | null;

  constructor(context: FlowContext, content = new FlowContent()) {
    this.context = context;
    this.cursor = LogicalCursorPos.zero;
    this.floatRegion = null;
    this.content = content;
  }

  public get name(): string {
    return this.context.name;
  }

  public clear() {
    this.cursor.zero();
    this.clearFloatRegion();
  }

  public clearFloatRegion() {
    // do nothing
  }

  public clearFloat(clear: LogicalClear) {
    if (Config.debugLayout) {
      console.log("[%s] clear float(%s)", this.name, clear.value);
    }
    let float_region = this.getFloatRegion();
    if (!float_region) {
      return;
    }
    if (clear.isBoth()) {
      this.cursor.before = float_region.clearBoth();
    } else if (clear.isStart()) {
      this.cursor.before = float_region.clearStart();
    } else if (clear.isEnd()) {
      this.cursor.before = float_region.clearEnd();
    }
  }

  public setMarginAuto(element: HtmlElement) {
    let start = element.style.getPropertyValue("margin-start") || "";
    let end = element.style.getPropertyValue("margin-end") || "";
    let measure = LogicalSize.loadMeasure(element);
    if (measure === null) {
      return;
    }
    if (start === "auto" && end === "auto") {
      let auto = Math.floor((this.maxContextBoxMeasure - measure) / 2);
      element.computedStyle.setProperty("margin-start", auto + "px");
    } else if (start === "auto" && end !== "auto") {
      let auto = this.maxContextBoxMeasure - measure;
      element.computedStyle.setProperty("margin-start", auto + "px");
    } else if (start !== "auto" && end === "auto") {
      let auto = this.maxContextBoxMeasure - measure;
      element.computedStyle.setProperty("margin-end", auto + "px");
    }
  }

  public isBlockEmpty(): boolean {
    return this.content.isBlockEmpty();
  }

  public isInlineEmpty(): boolean {
    return this.content.isInlineEmpty();
  }

  public isInlineError(obj: BoxContent): boolean {
    let max = this.maxSpaceMeasure;
    if (max <= 0) {
      console.error("[%s] too narrow parent area(max=%d, page=%d)", this.name, max);
      return true;
    }
    return false;
  }

  public isInlineOver(obj: BoxContent): boolean {
    let delta = BoxContentSize.getInlineSize(obj);
    let max = this.maxSpaceMeasure;
    let is_over = this.cursor.start + delta > max;
    if (is_over && Config.debugLayout) {
      let over_size = this.cursor.start + delta - max;
      console.log(
        "%c[%s] inline over! (cur=%d, delta=%d, maxM=%d, over=%d):",
        "color:green; font-weight:bold",
        this.name, this.cursor.start, delta, max, over_size, obj
      );
    }
    return is_over;
  }

  public isInlineMaxOver(obj: BoxContent): boolean {
    let delta = BoxContentSize.getInlineSize(obj);
    let max = this.maxSpaceMeasure;
    return delta > max;
  }

  public isInlineMaxBoxOver(size: number): boolean {
    let max = this.maxContextBoxMeasure;
    if (size > max) {
      console.error("[%s] unable to yield. size(%d) > max(%d)", this.name, size, max);
      return true;
    }
    return false;
  }

  // delta argument is used by word-break.
  public addInline(obj: BoxContent, delta?: number): boolean {
    delta = delta || BoxContentSize.getInlineSize(obj);
    let max = this.maxSpaceMeasure;
    let prev = this.cursor.start, next = prev + delta;
    if ((!isCharacter(obj) && Config.debugLayout) ||
      (isCharacter(obj) && Config.debugCharacter)) {
      console.log(
        "[%s] <- [%s]:(m:%d->%d, max:%d)",
        this.name, obj.toString(), prev, next, max
      );
    }
    this.content.addInline(obj);
    this.cursor.start += delta;
    let is_filled = this.cursor.start >= max;
    let is_break = obj instanceof LogicalBox && obj.lineBreak;
    return is_filled || is_break;
  }

  // note that this func checks if over(size > max), not filled(size >= max).
  public isBlockOver(block: LogicalBox): boolean {
    let delta = block.totalExtent, max = this.maxContextBoxExtent;
    let is_over = this.cursor.before + delta > max;
    if (is_over && Config.debugLayout) {
      let over_size = this.cursor.before + delta - max;
      console.log(
        "%c[%s] block over! (cur=%d, delta=%d, maxE=%d, over=%d):",
        "color:blue; font-weight:bold",
        this.name, this.cursor.before, delta, max, over_size, block
      );
    }
    return is_over;
  }

  // add normal flow block, return true if
  // 1. region is filled(this.cursor.before >= max)
  // 2. block.blockBreak flag is already set.
  public addBlock(block: LogicalBox): boolean {
    let delta = block.totalExtent, max = this.maxContextBoxExtent;
    let prev = this.cursor.before, next = prev + delta;
    block.blockPos = this.createBlockPos(block);
    this.content.addBlock(block);
    this.cursor.before += delta;
    if (Config.debugLayout) {
      console.log(
        "[%s]<-[%s]:(e:%d->%d,max:%d), pos:%o",
        this.name, block.toString(), prev, next, max, block.blockPos
      );
    }
    return this.cursor.before >= max || block.blockBreak;
  }

  public addAbsBlock(block: LogicalBox) {
    this.content.addBlock(block);
  }

  public addFloatBlock(block: LogicalBox) {
    if (!block.isFloat()) {
      return;
    }
    if (block.isFloatStart()) {
      block.blockPos = this.pushFloatStart(this.rootRegionBefore, block.totalSize).pos;
    } else if (block.isFloatEnd()) {
      block.blockPos = this.pushFloatEnd(this.rootRegionBefore, block.totalSize).pos;
    }
    this.content.addBlock(block);
  }

  public isFloatSpaceOver(block: LogicalBox): boolean {
    let delta = block.totalExtent, max = this.maxContextBoxExtent;
    let root_before = this.rootRegionBefore;
    let float_region = this.getFloatRegion();
    if (!float_region) {
      return false;
    }
    let before_measure = this.getSpaceMeasureAt(float_region, root_before);
    let after_measure = this.getSpaceMeasureAt(float_region, root_before + block.totalExtent);
    // float element can't be included at after position.
    if (after_measure < before_measure) {
      return true;
    }
    if (this.cursor.before + delta > max) {
      if (Config.debugLayout) {
        console.warn("[%s] float space over", this.name);
      }
      return true;
    }
    return false;
  }

  public addFloatSpaceBlock(block: LogicalBox): boolean {
    let delta = block.totalExtent, max = this.maxContextBoxExtent;
    let root_before = this.rootRegionBefore;
    block.blockPos = this.getFloatSpacePos(root_before);
    this.cursor.before += delta;
    this.content.addBlock(block);
    return this.cursor.before >= max;
  }

  protected createFloatRegion(): FloatRegion {
    throw new Error("must be overrided by FlowRootRegion");
  }

  protected createBlockAutoSize(): LogicalSize {
    return new LogicalSize({
      measure: this.maxContextBoxMeasure,
      extent: this.cursor.before
    });
  }

  protected createInlineAutoSize(env: BoxEnv): LogicalSize {
    return new LogicalSize({
      measure: this.cursor.start,
      extent: this.lineExtent
    });
  }

  protected createInlineBlockAutoSize(): LogicalSize {
    return new LogicalSize({
      measure: this.cursor.start,
      extent: this.cursor.before
    });
  }

  protected createInlineEdge(): LogicalBoxEdge {
    if (!this.context.edge) {
      return LogicalBoxEdge.none;
    }
    let edge = this.context.edge.clone();
    if (!this.context.isFirstOutput()) {
      edge.clearStart();
    }
    if (!this.context.isFinalOutput()) {
      edge.clearEnd();
    }
    return edge;
  }

  // create context-aware size of edge.
  protected createBlockEdge(): LogicalBoxEdge {
    if (!this.context.edge) {
      return LogicalBoxEdge.none;
    }
    // block edges of root layout are always available.
    if (this.context.isBody()) {
      return this.context.edge;
    }
    let edge = this.context.edge.clone();
    if (!this.context.isFirstOutput()) {
      edge.clearBefore();
    }
    if (!this.context.isFinalOutput()) {
      edge.clearAfter();
    }
    return edge;
  }

  protected createBlockPos(box: LogicalBox): LogicalCursorPos {
    let pos = new LogicalCursorPos({ start: 0, before: this.cursor.before });
    if (!box.isLine()) {
      return pos;
    }
    const float_region = this.getFloatRegion();
    if (float_region && box.float.isNone()) {
      pos.start = float_region.getSpaceStartAt(this.rootRegionBefore);
    }
    return pos;
  }

  protected createBlockSize(overflow: boolean): LogicalSize {
    let fixed_measure = this.fixedMeasure;
    let fixed_extent = this.fixedExtent;
    let extent = (fixed_extent !== null) ? fixed_extent :
      (overflow ? this.maxContextBoxExtent : this.cursor.before);
    let measure = (fixed_measure !== null) ? fixed_measure : this.maxContextBoxMeasure;
    let size = new LogicalSize({ measure: measure, extent: extent });
    // floating or flow-root
    if (this.context.isShrinkToFit()) {
      size.measure = fixed_measure || this.flowRootMeasure;
      size.extent = fixed_extent || this.flowRootExtent;
    }
    if (this.content.isEmptyBoxBlock()) {
      size.extent = 0;
    }
    return size;
  }

  public createBlockBox(env: BoxEnv, overflow: boolean, box_type: BoxType): LogicalBox {
    let size = this.createBlockSize(overflow);
    let box = this.content.createBlockBox(env, size, box_type);
    box.autoSize = this.createBlockAutoSize();
    box.contextEdge = this.createBlockEdge();
    box.blockBreak = overflow;
    return box;
  }

  public createInlineBlockBox(env: BoxEnv, overflow: boolean, box_type: BoxType): LogicalBox {
    let size = this.createBlockSize(overflow);
    let box = this.content.createBlockBox(env, size, box_type);
    box.contextEdge = this.createBlockEdge();
    box.autoSize = this.createInlineBlockAutoSize();
    box.blockBreak = overflow;
    return box;
  }

  protected createEmptyLineSize(env: BoxEnv): LogicalSize {
    return new LogicalSize({
      measure: this.maxSpaceMeasure,
      extent: env.fontSize
    });
  }

  public createEmptyLineBox(env: BoxEnv): LogicalBox {
    let size = this.createEmptyLineSize(env);
    let box = new LogicalBox(env, BoxType.LINE, size);
    box.autoSize = this.createBlockAutoSize();
    return box;
  }

  protected createInlineSize(env: BoxEnv, overflow: boolean): LogicalSize {
    return new LogicalSize({
      measure: this.cursor.start,
      extent: this.lineExtent
    });
  }

  public createInlineBox(env: BoxEnv, overflow: boolean): LogicalBox {
    let size = this.createInlineSize(env, overflow);
    let box = this.content.createInlineBox(env, size);
    box.autoSize = this.createInlineAutoSize(env);
    box.contextEdge = this.createInlineEdge();
    return box;
  }

  protected createLineSize(env: BoxEnv): LogicalSize {
    let is_white_space_only = this.content.isWhiteSpaceOnly();
    let is_empty_line = this.content.isInlineEmpty() || is_white_space_only;
    let is_root_line = env.isLineRoot();
    let extent = is_empty_line ? this.lineTextExtent :
      (is_root_line ? this.rootLineExtent : this.lineExtent);
    let size = new LogicalSize({
      measure: this.maxSpaceMeasure,
      extent: extent
    });
    if (this.context.isShrinkToFit()) {
      size.measure = this.cursor.start;
    }
    return size;
  }

  public createLineBox(env: BoxEnv): LogicalBox {
    let size = this.createLineSize(env);
    let box = this.content.createLineBox(env, size);
    box.autoSize = this.createBlockAutoSize();
    return box;
  }

  protected createBaselineSize(env: BoxEnv, parent: LogicalBox): LogicalSize {
    let size = new LogicalSize({
      measure: parent.size.measure,
      extent: this.lineTextExtent
    });
    return size;
  }

  public createBaselineBox(env: BoxEnv, line_box: LogicalBox): LogicalBox {
    let size = this.createBaselineSize(env, line_box);
    let box = this.content.createBaselineBox(env, size);
    box.autoSize = this.createInlineAutoSize(env);
    return box;
  }

  protected getLocalPosFromRootPos(root_pos: LogicalCursorPos): LogicalCursorPos {
    return new LogicalCursorPos({
      before: this.cursor.before,
      start: root_pos.start
    });
  }

  protected getLocalRectFromRootRect(root_rect: LogicalRect): LogicalRect {
    return new LogicalRect(this.getLocalPosFromRootPos(root_rect.pos), root_rect.size);
  }

  public pushFloatStart(root_before: number, size: LogicalSize): LogicalRect {
    const rootRect = this.rootRegion.pushFloatStart(root_before, size);
    return this.getLocalRectFromRootRect(rootRect);
  }

  public pushFloatEnd(root_before: number, size: LogicalSize): LogicalRect {
    const rootRect = this.rootRegion.pushFloatEnd(root_before, size);
    return this.getLocalRectFromRootRect(rootRect);
  }

  /*
  public pushFloatStart(root_before: number, size: LogicalSize): LogicalCursorPos {
    const root_pos = this.rootRegion.pushFloatStart(root_before, size);
    return this.getLocalPosFromRootPos(root_pos);
  }

  public pushFloatEnd(root_before: number, size: LogicalSize): LogicalCursorPos {
    const root_pos = this.rootRegion.pushFloatEnd(root_before, size);
    return this.getLocalPosFromRootPos(root_pos);
  }
  */

  protected getFloatSpacePos(root_before: number): LogicalCursorPos {
    const float_region = this.getFloatRegion();
    if (!float_region) {
      return new LogicalCursorPos({ start: 0, before: this.cursor.before });
    }
    const root_start = float_region.getSpaceStartAt(root_before);
    const root_pos = new LogicalCursorPos({ before: root_before, start: root_start });
    return this.getLocalPosFromRootPos(root_pos);
  }

  protected getSpaceMeasureAt(float_region: FloatRegion, root_before: number): number {
    const float_measure = float_region.getSideRectMeasureAt(root_before);
    return this.maxContextBoxMeasure - float_measure;
  }

  public getFloatRegion(): FloatRegion | null {
    return this.rootRegion.getFloatRegion();
  }

  public clearInlines() {
    this.content.clearInlines();
  }

  public clearBlocks() {
    this.content.clearBlocks();
  }

  public resetInlineCursor() {
    this.cursor.start = 0;
  }

  public resetBlockCursor() {
    this.cursor.before = 0;
  }

  public isFloatEnable(): boolean {
    return this.rootRegion.isFloatEnable();
  }

  public isTextHead(): boolean {
    return this.cursor.start === 0;
  }

  public isBlockHead(): boolean {
    if (this.cursor.before > 0) {
      return false;
    }
    if (!this.context.parent) {
      return true;
    }
    return this.context.parent.region.isBlockHead();
  }

  public isLineHead(): boolean {
    if (this.cursor.start > 0) {
      return false;
    }
    let inline_root = this.inlineRoot;
    return inline_root.cursor.start === 0;
  }

  protected get writingMode(): WritingMode {
    return this.context.env.writingMode;
  }

  protected get localOffset(): number {
    return this.rootRegion.cursor.before;
  }

  protected get rootRegionBefore(): number {
    return this.localOffset + this.cursor.before;
  }

  protected get rootRegion(): FlowRegion {
    return this.context.sectionRoot.region;
  }

  protected get inlineRoot(): FlowRegion {
    if (this.context.isBlockLevel()) {
      return this;
    }
    if (this.context.parent) {
      return this.context.parent.region.inlineRoot;
    }
    throw new Error("inline root not found!");
  }

  protected get totalEdgeMeasure(): number {
    return this.context.env.edge.measure;
  }

  protected get totalEdgeExtent(): number {
    return this.context.env.edge.extent;
  }

  protected get contextEdgeExtent(): number {
    return this.contextEdgeExtentBefore + this.contextEdgeExtentAfter;
  }

  protected get contextEdgeExtentBefore(): number {
    if (!this.context.edge || !this.context.isFirstOutput()) {
      return 0;
    }
    return this.context.edge.before;
  }

  protected get contextEdgeExtentAfter(): number {
    if (!this.context.edge || !this.context.isFinalOutput()) {
      return 0;
    }
    return this.context.edge.after;
  }

  protected get contextEdgeMeasure(): number {
    if (!this.context.edge) {
      return 0;
    }
    let display = this.context.env.display;
    let always = display.isBlockLevel() || display.isFlowRoot();
    let measure = 0;
    if (always || this.context.isFirstOutput()) {
      measure += this.context.edge.start;
    }
    if (always || this.context.isFinalOutput()) {
      measure += this.context.edge.end;
    }
    return measure;
  }

  protected get bodyExtent(): number {
    let body_env = this.context.body.env;
    let edge_size = body_env.edge.extent;
    let box_size = body_env.extent || Config.defaultBodyExtent;
    return Math.max(0, box_size - edge_size);
  }

  protected get bodyMeasure(): number {
    let body_env = this.context.body.env;
    let edge_size = body_env.edge.measure;
    let box_size = body_env.measure || Config.defaultBodyMeasure;
    return Math.max(0, box_size - edge_size);
  }

  public get restContextBoxMeasure(): number {
    if (!this.context.hasActiveChild()) {
      return this.maxContextBoxMeasure;
    }
    return this.maxContextBoxMeasure - this.cursor.start;
  }

  public get restContextBoxExtent(): number {
    return this.maxContextBoxExtent - this.cursor.before;
  }

  public get restEdgedBoxMeasure(): number {
    return this.maxEdgedBoxMeasure - this.cursor.start;
  }

  public get restEdgedBoxExtent(): number {
    return this.maxEdgedBoxExtent - this.cursor.before;
  }

  protected get rootLineExtent(): number {
    let root_line_extent = this.content.getRootLineExtent(this.context.env);
    let fixed_extent = this.fixedExtent;
    if (fixed_extent) {
      root_line_extent = Math.min(root_line_extent, fixed_extent);
    }
    //console.warn("[%s] rootLineExtent = %d", this.context.name, root_line_extent);
    return root_line_extent;
  }

  protected get lineExtent(): number {
    let line_extent = this.content.getLineExtent(this.context.env);
    let fixed_extent = this.fixedExtent;
    if (fixed_extent) {
      line_extent = Math.min(line_extent, fixed_extent);
    }
    //console.warn("[%s] lineExtent = %d", this.context.name, line_extent);
    return line_extent;
  }

  protected get lineTextExtent(): number {
    let line_text_extent = this.content.getLineTextExtent(this.context.env);
    let fixed_extent = this.fixedExtent;
    if (fixed_extent) {
      line_text_extent = Math.min(line_text_extent, fixed_extent);
    }
    //console.warn("[%s] lineTextExtent = %d", this.context.name, line_text_extent);
    return line_text_extent;
  }

  // Find max measure from it's block children.
  // Note that if inner display is flow-root,
  // whole width of the box is defined by the box itself(shrink to fit size),
  // not by it's parent.
  protected get flowRootMeasure(): number {
    return this.content.flowRootMeasure;
  }

  protected get flowRootExtent(): number {
    return this.content.flowRootExtent;
  }

  protected get fixedExtent(): number | null {
    if (!this.context.parent) { // body
      return this.bodyExtent;
    }
    let fixed_size = this.context.env.extent;
    if (!fixed_size) {
      return null;
    }
    return fixed_size;
  }

  protected get fixedMeasure(): number | null {
    if (!this.context.parent) { // body
      return this.bodyMeasure;
    }
    let fixed_size = this.context.env.measure;
    if (fixed_size === null) {
      return null;
    }
    return fixed_size;
  }

  protected get maxSpaceMeasure(): number {
    let float_region = this.getFloatRegion();
    if (!this.context.isFloat() && float_region) { // float space client
      let root_pos = this.rootRegionBefore;
      let measure = this.getSpaceMeasureAt(float_region, root_pos);
      // float region is already cleared by another layout.
      if (measure === this.maxContextBoxMeasure) {
        if (Config.debugLayout) {
          console.warn(
            "disabled float-region(at %s) in flow-root at %d(page=%d), root_pos = %d",
            this.rootRegion.name, this.cursor.before, this.context.bodyPageIndex, root_pos
          );
        }
        this.rootRegion.clearFloatRegion();
      }
      return measure;
    }
    return this.maxContextBoxMeasure;
  }

  public get restSpaceMeasure(): number {
    return this.maxSpaceMeasure - this.cursor.start;
  }

  // max 'content' measure(except 'context' edge size) refering to parent context.
  public get maxContextBoxMeasure(): number {
    let fixed_measure = this.fixedMeasure;
    if (fixed_measure !== null) {
      return fixed_measure;
    }
    if (!this.context.parent) {
      throw new Error("never"); // never happen
    }
    let parent_rest = this.context.parent.region.restContextBoxMeasure;
    let edge_size = this.contextEdgeMeasure;
    let size = parent_rest - edge_size;
    return size;
  }

  // max measure but full edge included.
  // so always [maxContextBoxMeasure] >= [maxEdgedBoxMeasure]
  public get maxEdgedBoxMeasure(): number {
    let fixed_measure = this.fixedMeasure;
    if (fixed_measure !== null) {
      return fixed_measure;
    }
    if (!this.context.parent) {
      throw new Error("never"); // never happen
    }
    let parent_rest = this.context.parent.region.restEdgedBoxMeasure;
    let edge_size = this.totalEdgeMeasure;
    let size = parent_rest - edge_size;
    return size;
  }

  // max 'content' extent(except 'context' edge size) referring to parent context.
  public get maxContextBoxExtent(): number {
    let fixed_extent = this.fixedExtent;
    if (fixed_extent !== null) {
      return fixed_extent;
    }
    if (!this.context.parent) {
      throw new Error("never"); // never happen
    }
    let parent_rest = this.context.parent.region.restContextBoxExtent;
    let edge_size = this.contextEdgeExtent;
    let size = parent_rest - edge_size;
    return size;
  }

  // max extent but full edge included.
  // so always [maxContextBoxExtent] >= [maxEdgedBoxExtent]
  public get maxEdgedBoxExtent(): number {
    let fixed_extent = this.fixedExtent;
    if (fixed_extent !== null) {
      return fixed_extent;
    }
    if (!this.context.parent) {
      throw new Error("never"); // never happen
    }
    let parent_rest = this.context.parent.region.restEdgedBoxExtent;
    let edge_size = this.totalEdgeExtent;
    let size = parent_rest - edge_size;
    return size;
  }
}
