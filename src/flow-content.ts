import {
  BoxEnv,
  BoxType,
  BoxContent,
  LogicalSize,
  LogicalBox,
  Ruby,
  SpaceChar,
} from "./public-api";

export class FlowContent {
  protected inlines: BoxContent [];
  protected blocks: LogicalBox [];

  constructor(){
    this.inlines = [];
    this.blocks = [];
  }

  // prevent from popping all inline items(at least first one is left).
  public roundInlineCount1(count: number): number {
    return Math.min(count, Math.max(0, this.inlines.length - 1));
  }

  protected getMaxInlineExtent(): number {
    return this.inlines.reduce((max_extent, item) => {
      if(item instanceof LogicalBox){
	return Math.max(max_extent, item.maxExtent);
      }
      if(item instanceof Ruby){
	return Math.max(max_extent, item.totalExtent);
      }
      return Math.max(max_extent, item.size.extent);
    }, 0);
  }

  protected getMaxInlineFontSize(env: BoxEnv): number {
    return this.inlines.reduce((max_extent, item) => {
      if(item instanceof LogicalBox){
	return Math.max(max_extent, item.maxFontSize);
      }
      if(item instanceof Ruby){
	return Math.max(max_extent, item.fontSize);
      }
      return Math.max(max_extent, item.size.extent);
    }, env.fontSize);
  }

  public getRootLineExtent(env: BoxEnv): number {
    if(this.isEmptyBoxInline()){
      return 0;
    }
    let max_inline_font_size = this.getMaxInlineFontSize(env);
    let max_inline_extent = this.getMaxInlineExtent();
    return Math.max(max_inline_extent, env.getLineExtent(max_inline_font_size));
  }

  public getLineExtent(env: BoxEnv): number {
    if(this.isEmptyBoxInline()){
      return 0;
    }
    return this.getMaxInlineExtent();
  }

  public getLineTextExtent(env: BoxEnv): number {
    if(this.isEmptyBoxInline()){
      return 0;
    }
    return this.getMaxInlineFontSize(env);
  }

  // Find max measure from it's block children.
  // Note that if inner display is flow-root,
  // whole width of the box is not defined by it's parent,
  // but the box itself(shrink to fit size).
  public get flowRootMeasure(): number {
    return this.blocks.reduce((max, block) => {
      if(block.isPositionAbsolute()){
	return max;
      }
      return Math.max(block.totalMeasure, max);
    }, 0);
  }

  public get flowRootExtent(): number {
    return this.blocks.reduce((sum, block) => {
      if(block.isPositionAbsolute()){
	return sum;
      }
      return sum + block.totalExtent;
    }, 0);
  }

  public isEmptyBoxInline(): boolean {
    return this.inlines.every(val => {
      return val instanceof LogicalBox && val.size.extent === 0;
    });
  }

  public isEmptyBoxBlock(): boolean {
    return this.blocks.every(val => {
      return val instanceof LogicalBox && val.size.extent === 0;
    });
  }

  public isInlineEmpty(): boolean {
    return this.inlines.length === 0;
  }

  public isBlockEmpty(): boolean {
    return this.blocks.length === 0;
  }

  public addInline(cont: BoxContent){
    if(cont instanceof LogicalBox && cont.isText()){
      this.addTextBox(cont);
    } else {
      this.inlines.push(cont);
    }
  }

  // inlining characters in text-box.
  protected addTextBox(text: LogicalBox){
    this.inlines = this.inlines.concat(text.getChildren());
  }

  public addBlock(block: LogicalBox){
    this.blocks.push(block);
  }

  public clearInlines(){
    this.inlines = [];
  }

  public clearBlocks(){
    this.blocks = [];
  }

  public popInline(): BoxContent | undefined {
    return this.inlines.pop();
  }

  public isWhiteSpaceOnly(): boolean {
    return this.inlines.every(val => val instanceof SpaceChar);
  }

  public createBlockBox(env: BoxEnv, size: LogicalSize, box_type: BoxType): LogicalBox {
    let box = new LogicalBox(env, box_type, size);
    box.addChildren(this.blocks);
    return box;
  }

  public createInlineBox(env: BoxEnv, size: LogicalSize): LogicalBox {
    let box = new LogicalBox(env, BoxType.INLINE, size);
    // note that if inline element accepts line(block) from child gen, blocks are not empty.
    let children = (this.blocks.length > 0)? this.blocks : this.inlines;
    box.addChildren(children);
    return box;
  }

  public createLineBox(env: BoxEnv, size: LogicalSize): LogicalBox {
    return new LogicalBox(env, BoxType.LINE, size);
  }

  public createBaselineBox(env: BoxEnv, size: LogicalSize): LogicalBox {
    let box = new LogicalBox(env, BoxType.BASELINE, size);
    box.addChildren(this.inlines);
    return box;
  }

  public createTextBox(env: BoxEnv, size: LogicalSize): LogicalBox {
    let box = new LogicalBox(env, BoxType.TEXT, size);
    box.addChildren(this.inlines);
    return box;
  }
}

