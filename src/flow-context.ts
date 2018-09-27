import {
  ILayoutContext,
  LayoutGenerator,
  LayoutGeneratorFactory,
  getContextName,
  Ruby,
  LogicalBox,
  LogicalBoxEdge,
  LogicalClear,
  BoxEnv,
  BoxType,
  BoxContent,
  Config,
  WhiteSpace,
  CssLoader,
  FlowRegion,
  HtmlElement,
  LayoutValue,
  LayoutControl,
  LayoutOutline,
  LayoutSection,
  LayoutCounter,
  LayoutStatus,
  FlowChildGenerators,
} from "./public-api";

export class FlowContext implements ILayoutContext {
  public name: string;
  public parent?: FlowContext;
  public body: FlowContext;
  public sectionRoot: FlowContext;
  public section?: LayoutSection;
  public outline: LayoutOutline;
  public region: FlowRegion;
  public env: BoxEnv;
  protected counter: LayoutCounter;
  protected childGens: FlowChildGenerators;
  protected status: LayoutStatus;

  constructor(element: HtmlElement, parent?: FlowContext){
    this.name = getContextName(element);
    this.env = this.createEnv(element, parent);
    this.parent = parent;
    this.body = (!this.parent)? this : this.parent.body;
    this.sectionRoot = this.getSectionRootContext();
    this.outline = this.createOutline(this.sectionRoot);
    this.counter = new LayoutCounter();
    this.status = new LayoutStatus();
    this.region = this.createRegion();
    this.childGens = this.createChildGenerators();
  }

  public openElement(){
    this.section = this.sectionRoot.outline.openElement(this, this.element);
  }

  public closeElement(){
    if(this.hasNext() === false){
      this.sectionRoot.outline.closeSection(this, this.element);
    }
  }

  public getSectionRootContext(): FlowContext {
    if(!this.parent || this.isSectionRoot()){
      return this;
    }
    return this.parent.getSectionRootContext();
  }

  public getNextElement(): HtmlElement | null {
    if(!this.childGens){
      return null;
    }
    let next = this.childGens.getNextSibling();

    // skip white-space after current tag
    if(next && WhiteSpace.isWhiteSpaceElement(next)){
      if(Config.debugLayout){
	console.log("[%s] skip white space:", this.name, next);
      }
      next = next.nextSibling;
    }
    if(!next){
      return null;
    }
    return next;
  }

  public getNext(): IteratorResult<LayoutValue []> {
    if(this.childGens.hasNext()){
      return this.childGens.getNext();
    }
    return this.getNextChildLayout();
  }

  protected getNextChildLayout(): IteratorResult<LayoutValue []> {
    let next_element = this.getNextElement();
    if(Config.debugLayout){
      console.log("[%s] nextElement:", this.name, next_element);
    }
    // Note that if we output done:true at this point, it is propagated to root layout,
    // and whole generator is aborted, so we have to send 'skip' to parent gen temporary,
    // and parent will stop because 'hasNext()' will be false in next loop.
    if(!next_element){
      // this error occurs when we tried to get layout from child gen,
      // but nothing yielded because of layout error(too large image, or empty element etc).
      console.error("[%s] no more next element:%o -> abort", this.name, this);
      this.abort();
      let skip = LayoutControl.createSkip();
      return {done:false, value:[new LayoutValue(skip)]};
    }

    let next_generator = this.createGenerator(next_element);

    if((next_generator.isBlockLevel() || next_generator.isFloat()) &&
       this.region.isInlineEmpty() === false){
      // If inline level is interrupted by block level, split them. For example,
      // <span>foo<p>bar</p>baz</span> is devided into
      // [<span>foo</span><br>, <span><p>bar</p></span>, <span>baz</span>]
      // by <p>bar</p>. Note that <br> after <span> is inserted to split inline level.
      if(this.isInlineFlow()){
	// Control command 'inline-break' leads generator to close current inline context,
	// and yield <br> to make current inline-box separated to next block level.
	// As a result, parent generator will accept [line-box, line-break] as LayoutValue [].
	if(Config.debugLayout){
	  console.log("[%s] inline level is splited by block!", this.name);
	}
	let inline_split = LayoutControl.createInlineSplit();
	return {done:false, value:[new LayoutValue(inline_split)]};
      }
      // If block level is divided by some inline elements, sweep out line before next block.
      // But if line is white-space only, ignore it.
      let line = this.createLineBox();
      if(line.isWhiteSpaceLine()){
	if(Config.debugLayout){
	  console.log("[%s] skip white-space line before block", this.name);
	}
	let skip = LayoutControl.createSkip();
	return {done:false, value:[new LayoutValue(skip)]};
      }
      return {done:false, value:[new LayoutValue(line)]};
    }

    this.childGens.updateActive(next_generator);

    if(this.region.isLineHead() && next_generator.isFloat() === false){
      this.childGens.updateLead(next_generator);
    }

    return this.getNext();
  }

  public hasNext(): boolean {
    if(this.status.isAbort() || this.status.isPause()){
      if(Config.debugLayout){
	console.log("[%s] %s, hasNext = false", this.name, this.status.toString());
      }
      return false;
    }
    if(this.childGens && this.childGens.hasNext()){
      return true;
    }
    if(this.getNextElement() !== null){
      return true;
    }
    return false;
  }

  public pause(){
    this.status.setPause();
    if(Config.debugLayout){
      console.log("[%s] paused.", this.name);
    }
  }

  public abort(){
    let page_index = this.bodyPageIndex;
    console.warn("[%s] aborted. page=%d, element:", this.name, page_index, this.element);
    this.status.setAbort();
  }

  public resume(){
    this.status.setNormal();
    this.childGens.resume();
  }

  public updateStyle(){
    if(CssLoader.loadDynamic(this.element, this.parent)){
      if(Config.debugLayout){
	console.warn("[%s] style is dynamically updated!", this.element.getNodeName());
      }
      this.env = this.createEnv(this.element, this.parent);
    }
    if(this.childGens){
      this.childGens.updateStyle();
    }
  }

  public updateLead(){
    this.childGens.setActiveAsLead();
  }

  // called from parent generator
  public commit(){
    if(this.isFirstOutput() && this.section){
      this.section.pageIndex = this.sectionRoot.pageIndex;
    }
    this.counter.incYield();
    this.counter.resetRollback();
    if(this.region.isLineHead()){
      this.updateLead();
    }
    this.region.resetInlineCursor(); // 'after' update lead, set cursor to line head.
    if(Config.debugLayout){
      console.log("[%s] commit", this.name);
    }
  }

  public rollback(){
    if(Config.debugLayout){
      console.log("[%s]: rollback", this.name);
    }
    this.region.resetInlineCursor();
    this.counter.incRollback();

    // If it's rollbacked too many, abort generator to avoid infinite loop.
    // But we exclude body-gen because there is no parent committer for body-gen,
    // so counter.rollback of body-gen is not cleared.
    if(this.isBody() === false && this.counter.isError()){
      console.error("[%s] counter error! -> abort.", this.name);
      console.warn("aborted element:%o, child-gens:%o", this.element, this.childGens);
      this.abort();
      return;
    }
    this.childGens.rollback();
  }

  protected addInline(obj: BoxContent): boolean {
    let is_filled = this.region.addInline(obj);
    this.counter.incInlineChar(obj.charCount);
    this.childGens.commit();
    return is_filled;
  }

  public shiftControl(control: LayoutControl){
    if(control.isGeneratorValue){
      this.childGens.commit();
    }
  }

  public shiftInlineLevel(obj: BoxContent): boolean {
    if(this.region.isInlineError(obj)){
      console.error("[%s] inline error at %d", this.name, this.bodyPageIndex);
      return true;
    }
    if(obj instanceof Ruby){
      return this.shiftRuby(obj as Ruby);
    }
    let box = obj as LogicalBox;
    //console.assert(obj instanceof LogicalBox);
    if(box.isText()){
      return this.shiftText(box);
    }
    return this.shiftInlineBox(box);
  }

  protected shiftText(text: LogicalBox): boolean {
    // if region over, it's bug of text-region.
    // maybe size of inline max space is not shared by parent layout.
    if(this.region.isInlineOver(text)){
      console.error("region error:%o(text.m=%d)", this.region, text.totalMeasure);
      return true;
    }
    // if single text can't be afford to yield, it' line limit.
    if(text.totalMeasure === 0){
      return true;
    }
    return this.addInline(text);
  }

  protected shiftInlineBox(box: LogicalBox): boolean {
    if(this.region.isInlineOver(box)){
      this.childGens.rollbackActive();
      return true;
    }
    return this.addInline(box);
  }

  protected shiftRuby(ruby: Ruby): boolean {
    if(this.region.isInlineOver(ruby)){
      this.childGens.rollbackActive();
      return true;
    }
    return this.addInline(ruby);
  }

  // normal block but inserted into float rest space.
  public shiftFloatSpaceBlock(block: LogicalBox): boolean {
    let delta = block.totalExtent;
    if(delta === 0){
      this.counter.incEmptyBox();
    }
    if(this.region.isFloatSpaceOver(block)){
      this.rollback();
      return true;
    }
    let is_filled = this.region.addFloatSpaceBlock(block);
    if(block.isLine()){
      this.counter.incLine();
      this.removeBrAfterLine();
      this.updateLead(); // active <- lead
    } else if(block.blockPos){
      // inline offset pos is only available to anonymous line box.
      block.blockPos.start = 0;
    }
    this.childGens.commit();
    return is_filled;
  }

  // normal flow blocks.
  public shiftBlockLevel(block: LogicalBox): boolean {
    let delta = block.totalExtent;
    if(delta === 0){
      this.counter.incEmptyBox();
    }
    let is_over = this.region.isBlockOver(block);
    if(is_over){
      // If we rollback by empty-line(generated by <br> gen),
      // lead-gen before <br> is rollbacked instead,
      // because control-generator(like <br> gen) can't be lead-gen.
      // So we prevent rollback when block is empty-line(generated by <br> gen).
      if(!block.isEmptyLine()){
	this.rollback();
      }
      return true;
    }
    if(block.isLine()){
      this.counter.incLine();
      this.removeBrAfterLine();
      this.updateLead(); // active <- lead
    }
    this.counter.incBlockChar(block.charCount);
    this.childGens.commit();
    return this.region.addBlock(block);
  }

  // absolute positioned box doesn't affect any flow cursor.
  public shiftAbsBlock(block: LogicalBox) {
    this.region.addAbsBlock(block);
    this.childGens.commit();
  }

  // add block to float-chain.
  public shiftFloatBlock(block: LogicalBox): boolean {
    try {
      this.region.addFloatBlock(block);
      this.childGens.commit();
      return false;
    } catch(err){
      if(Config.debugLayout){
	console.error("float block over!:", err);
      }
      this.region.clear();
      this.childGens.rollback();
      return true;
    }
  }

  // full-filled line and br just after it causes double line-break, so skip it.
  public removeBrAfterLine(){
    let next_element = this.getNextElement();
    if(this.childGens.hasNextActive() === false &&
       next_element && next_element.tagName === "br"){
      this.element.removeChild(next_element);
    }
  }

  public clearRegionFloat(clear: LogicalClear){
    this.region.clearFloat(clear);
  }

  public incPageBreak(){
    this.counter.incPageBreak();
  }

  public setRegionMarginAuto(element: HtmlElement){
    this.region.setMarginAuto(element);
  }

  public isBody(): boolean {
    return this.element.tagName === "body";
  }

  public isPositionAbsolute(): boolean {
    return this.env.position.isAbsolute();
  }

  public isFloatClient(): boolean {
    if(this.isFloat()){
      return false;
    }
    return this.region.isFloatEnable();
  }

  public hasActiveChild(): boolean {
    return this.childGens && this.childGens.hasActive();
  }

  public isStatusNormal(): boolean {
    return this.status.isNormal();
  }

  public isBlockLevel(): boolean {
    return this.env.display.isBlockLevel();
  }

  public isInlineFlow(): boolean {
    return this.env.display.isInlineFlow();
  }

  public isFlowRoot(): boolean {
    return this.env.display.isFlowRoot() || this.isSectionRoot();
  }

  public isFloat(): boolean {
    return this.env.float.isFloat();
  }

  public isLayout(): boolean {
    return true;
  }

  public isFirstLine(): boolean {
    return this.counter.isFirstLine();
  }

  public isListItem(): boolean {
    return this.env.display.isListItem();
  }

  public isPre(): boolean {
    return this.env.whiteSpace.isPre();
  }

  public isShrinkToFit(): boolean {
    return this.isFloat() || (this.isFlowRoot() && !this.isBody());
  }

  public isEmpty(): boolean {
    return this.region.isBlockEmpty() && this.region.isInlineEmpty();
  }

  public isSectionRoot(): boolean {
    return LayoutSection.isSectioningRootElement(this.element);
  }

  public isSection(): boolean {
    return LayoutSection.isSectioningElement(this.element);
  }

  public isTextVertical(): boolean {
    return this.env.writingMode.isTextVertical();
  }

  public isTextTcy(): boolean {
    return this.env.textCombineUpright.isNone() === false;
  }

  public isTextUpright(): boolean {
    return this.env.textOrientation.isUpright();
  }

  public isNotPageBroken(): boolean {
    return this.counter.isNotPageBroken();
  }

  public isLineYielded(): boolean {
    return this.counter.isLineYielded();
  }

  public isFirstOutput(): boolean {
    return this.counter.isNotYielded();
  }

  public isFinalOutput(): boolean {
    return this.hasNext() === false;
  }

  public isBlockEmpty(): boolean {
    return this.region.isBlockEmpty();
  }

  public isInlineEmpty(): boolean {
    return this.region.isInlineEmpty();
  }

  public isBlockHead(): boolean {
    return this.region.isBlockHead();
  }

  public get pageIndex(): number {
    return this.counter.pageIndex;
  }

  public get bodyPageIndex(): number {
    return this.body.pageIndex;
  }

  public get element(): HtmlElement {
    return this.env.element;
  }

  public get edge(): LogicalBoxEdge {
    return this.env.edge;
  }

  public createChildEnv(element: HtmlElement): BoxEnv {
    return new BoxEnv(element, this.env);
  }

  protected createEnv(element: HtmlElement, parent?: FlowContext): BoxEnv {
    if(parent){
      return parent.createChildEnv(element);
    }
    return new BoxEnv(element);
  }

  protected createRegion(): FlowRegion {
    return new FlowRegion(this);
  }

  protected createOutline(section_root_context: FlowContext): LayoutOutline {
    if(this.isSectionRoot()){
      return new LayoutOutline();
    }
    return section_root_context.outline;
  }

  protected createChildGenerators(): FlowChildGenerators {
    let first_generator = this.createFirstGenerator();
    return new FlowChildGenerators(this, first_generator);
  }

  protected createFirstElement(): HtmlElement {
    let first_child = this.element.firstChild;
    if(first_child && WhiteSpace.isWhiteSpaceElement(first_child)){
      first_child = first_child.nextSibling;
    }
    // If empty node, use 'content' value if defined.
    if(!first_child){
      let content = this.env.contentValue;
      first_child = this.element.root.createTextNode(content);
      this.element.replaceChild(first_child, this.element.firstChild);
    }
    return first_child;
  }

  protected createFirstGenerator(): LayoutGenerator {
    let first_element = this.createFirstElement();
    return this.createGenerator(first_element);
  }

  protected createGenerator(element: HtmlElement): LayoutGenerator {
    return LayoutGeneratorFactory.createGenerator(this, element);
  }

  public createInlineBox(overflow: boolean): LogicalBox {
    let box = this.region.createInlineBox(this.env, overflow);
    box.pageIndex = this.bodyPageIndex;
    box.localPageIndex = this.pageIndex;
    box.lineBreak = overflow;
    box.charCount = this.counter.inlineChar;
    this.region.clearInlines();
    this.region.clearBlocks();
    this.counter.resetInlineCounter();
    if(Config.debugLayout){
      console.log("[%s] createInlineBox[%s]:%o", this.name, box.text, box);
    }
    return box;
  }

  public createEmptyLineBox(): LogicalBox {
    let box = this.region.createEmptyLineBox(this.env);
    box.pageIndex = this.bodyPageIndex;
    box.localPageIndex = this.pageIndex;
    box.charCount = 0;
    this.region.resetInlineCursor();
    this.counter.resetInlineCounter();
    this.region.clearInlines();
    if(Config.debugLayout){
      console.log("[%s] createEmptyLineBox:%o", this.name, box);
    }
    return box;
  }

  public createLineBox(): LogicalBox {
    let box = this.region.createLineBox(this.env);
    box.pageIndex = this.bodyPageIndex;
    box.localPageIndex = this.pageIndex;
    box.hasNext = this.hasNext();
    let baseline = this.createBaselineBox(box);
    box.addChild(baseline);
    box.charCount = this.counter.inlineChar;
    if(this.env.isTextJustify()){
      box.justify(baseline);
    }
    this.region.resetInlineCursor();
    this.region.clearInlines();
    this.counter.resetInlineCounter();
    if(Config.debugLayout){
      console.log("[%s] createLineBox[%s]:%o", this.name, box.text, box);
    }
    return box;
  }

  public createBaselineBox(line_box: LogicalBox): LogicalBox {
    let box = this.region.createBaselineBox(this.env, line_box);
    box.pageIndex = this.bodyPageIndex;
    box.localPageIndex = this.pageIndex;
    box.hasNext = line_box.hasNext;
    box.charCount = this.counter.inlineChar;
    if(Config.debugLayout){
      console.log("[%s] createBaselineBox:", this.name, box);
    }
    return box;
  }

  public createBlockBox(overflow: boolean, box_type = BoxType.BLOCK): LogicalBox {
    let box = this.region.createBlockBox(this.env, overflow, box_type);
    box.pageIndex = this.bodyPageIndex;
    box.localPageIndex = this.pageIndex;
    box.charCount = this.counter.blockChar;
    box.hasNext = this.hasNext();
    this.counter.incPage(); // increment local page count
    this.counter.resetBlockCounter();
    this.region.resetBlockCursor();
    this.region.clearBlocks();
    if(this.isFlowRoot()){
      this.region.clearFloatRegion();
    }
    this.resume(); // re-activate resumed generators after closing current block.
    if(Config.debugLayout){
      console.log("[%s] createBlockBox[%s:%s]:%o", this.name, box.boxType, box.text, box);
    }
    return box;
  }

  public createInlineBlockBox(overflow: boolean, box_type = BoxType.INLINE_BLOCK): LogicalBox {
    let box = this.region.createInlineBlockBox(this.env, overflow, box_type);
    box.pageIndex = this.bodyPageIndex;
    box.localPageIndex = this.pageIndex;
    box.charCount = this.counter.blockChar;
    box.hasNext = this.hasNext();
    this.counter.incPage();
    this.counter.resetBlockCounter();
    this.region.resetBlockCursor();
    this.region.clearBlocks();
    if(Config.debugLayout){
      console.log("[%s] createInlineBlockBox[%s]:", this.name, box.text, box);
    }
    return box;
  }

  public createPageBreakBeforeElement(element: HtmlElement): HtmlElement {
    let hr = element.root.createElement("hr");
    hr.setAttribute("style", "page-break-before:always; extent:0; margin:0; border:0");
    if(element.parent){
      element.parent.insertBefore(hr, element);
    }
    if(Config.debugLayout){
      console.log("inserted dynamic page-break before [%s]", element.toString());
    }
    return hr;
  }

  public createEmptyInlineControl(overflow: boolean, size: number): LayoutControl {
    if(overflow && !this.region.isInlineMaxBoxOver(size)){
      return LayoutControl.createLineBreak();
    }
    this.childGens.abortActive();
    return LayoutControl.createSkip();
  }
}
