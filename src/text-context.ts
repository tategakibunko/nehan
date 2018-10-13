import {
  ILayoutContext,
  FlowContext,
  HtmlElement,
  LayoutStatus,
  LayoutCounter,
  LayoutValue,
  TextRegion,
  TextLexer,
  LogicalBox,
  BoxEnv,
  Config,
  Character,
  Word,
  Utils,
  SpaceChar,
  Tcy,
  DualChar,
  getContextName,
  DirectTextLexer,
} from "./public-api";

export class TextContext implements ILayoutContext {
  public name: string;
  public parent: FlowContext;
  public element: HtmlElement;
  protected status: LayoutStatus;
  protected counter: LayoutCounter;
  protected region: TextRegion;
  protected lexer: TextLexer;
  protected backupPos: number;
  protected brokenWord: Word | null;
  
  constructor(element: HtmlElement, parent: FlowContext){
    this.element = element;
    this.name = getContextName(element);
    this.parent = parent;
    this.counter = new LayoutCounter();
    this.region = new TextRegion(parent);
    this.status = new LayoutStatus();
    this.lexer = this.createLexer(element, parent);
    this.backupPos = 0;
    this.brokenWord = null;
  }

  public get progress(): number {
    return this.lexer.progress;
  }

  public isStatusNormal(): boolean {
    return this.status.isNormal();
  }

  protected normalizeText(str: string): string {
    let norm_str = str
      .replace(/&#x([0-9A-F]+);/gi, (match, p1) => {
	return String.fromCodePoint(Utils.atoi(p1, 16));
      })
      .replace(/&#([0-9]+);/gi, (match, p1) => {
	return String.fromCodePoint(Utils.atoi(p1, 10));
      });
    if(this.parent.isPre() === false){
      norm_str = Utils.String.multiSpaceToSingle2(norm_str);
    }
    return norm_str;
  }

  protected createLexer(element: HtmlElement, parent: FlowContext): TextLexer {
    let text = this.normalizeText(element.textContent);
    let is_vert = parent.isTextVertical();
    let is_tcy = parent.isTextTcy();
    let lexer = (is_vert && is_tcy)?
      new DirectTextLexer(text, [new Tcy(text)]) :
      new TextLexer(text);
    if(is_vert && parent.isTextUpright()){
      lexer.uprightTokens();
    }
    return lexer;
  }

  public resume(){
    this.status.setNormal();
  }

  public pause(){
    this.status.setPause();
  }

  public abort(){
    console.warn("[%s] aborted", this.name);
    this.status.setAbort();
  }

  public commit(){
  }

  public updateStyle(){
  }

  public updateLead(){
    // no child layout, do nothing.
  }

  public isFloat(): boolean {
    return false;
  }

  public isLayout(): boolean {
    return true;
  }

  public isBlockLevel(): boolean {
    return false;
  }

  public isPositionAbsolute(): boolean {
    return false;
  }

  public hasNext(): boolean {
    if(this.status.isAbort()){
      return false;
    }
    return this.lexer.hasNext();
  }

  protected get env(): BoxEnv {
    return this.parent.env;
  }

  protected addInline(char: Character): boolean {
    let is_filled = this.region.addInline(char);
    this.counter.incInlineChar(char.charCount);
    return is_filled;
  }

  protected addOverflowWord(word: Word): boolean {
    let is_filled = this.region.addOverflowWord(word);
    this.counter.incInlineChar(word.charCount);
    return is_filled;
  }

  // char, uchar, dual-char, mix-char, space-char, tcy
  public shiftCharacter(char: Character): boolean {
    if(this.region.isInlineError(char)){
      return true;
    }
    if(char instanceof Word){
      return this.shiftWord(char as Word);
    }
    // white-space:pre and '\n' makes new line immediately.
    if(char instanceof SpaceChar && char.isLineFeed() && this.env.whiteSpace.isPre()){
      return true;
    }
    if(this.region.isInlineOver(char)){
      this.pushBack();
      this.hyphenate();
      return true;
    }
    if(this.addInline(char)){
      this.hyphenate();
      return true;
    }
    return false;
  }

  protected shiftWord(word: Word): boolean {
    if(this.region.isInlineOver(word)){
      // word-break:break-all
      // preffered over 'overflow-wrap:break-word'.
      if(this.env.wordBreak.isBreakAll()){
	return this.shiftWordWithBreak(word);
      }
      // if word size is larger than inline max.
      if(this.region.isInlineMaxOver(word)){
	// if overflow-wrap:break-word, break word.
	if(this.env.overflowWrap.isBreakWord()){
	  return this.shiftWordWithBreak(word);
	}
	// otherwise, add long word even if it's overflow.
	this.addOverflowWord(word);
	return true; // new line in any way.
      }
      // retry at new line.
      this.pushBack();
      return true;
    }
    return this.addInline(word);
  }

  protected shiftWordWithBreak(word: Word): boolean {
    let word_head = this.region.breakWord(word);
    // too narrow rest space
    if(word_head.text === ""){
      if(Config.debugLayout){
	console.warn("failed to break word, too narrow rest space for:", word);
      }
      this.pushBack();
      return true;
    }
    if(Config.debugLayout){
      console.log("[%s] set broken word:", this.name, word_head);
    }
    this.pushBack();
    this.brokenWord = word_head;
    return this.shiftCharacter(word_head);
  }

  public getNext(): IteratorResult<LayoutValue []> {
    let prev = this.lexer.peek(-1);
    let text = this.lexer.getNext();
    if((text instanceof DualChar && text.isKernEnable()) &&
       (prev instanceof DualChar && prev.isKernEnable())){
      text.setKerning(this.env, true);
    }
    // If text is not word and metrics is already calculated, skip calling setMetrics.
    // Note that word token should be called setMetrics always,
    // because any word could be broken by 'overflow-wrap:break-word' or 'word-break:break-all'.
    if(text instanceof Word || text.size.measure === 0){
      text.setMetrics(this.env);
    }
    return {done: false, value:[new LayoutValue(text)]};
  }

  public save(){
    if(this.parent.region.isTextHead() && this.region.isTextHead()){
      this.backupPos = this.lexer.getPos();
      if(Config.debugLayout){
	console.log(
	  "[%s] save at %d [%s]",
	  this.name, this.backupPos, this.element.textContent.substring(this.backupPos)
	);
      }
    }
  }

  public pushBack(){
    let pos = this.lexer.getPos();
    this.lexer.setPos(pos - 1);
  }

  public rollback(){
    if(Config.debugLayout){
      let backtext = this.lexer.src.slice(this.backupPos, this.lexer.getPos());
      let pos = this.lexer.getPos();
      let backpos = this.backupPos;
      console.log("[%s] rollback:(%d->%d):%s", this.name, pos, backpos, backtext);
    }
    // if word is broken, but parent caused rollback, restore it.
    if(this.brokenWord){
      let last_word = this.lexer.peek() as Word;
      // [TODO]
      // sometimes last_word is null, I don't know why.
      if(last_word && last_word instanceof Word){
	if(Config.debugLayout){
	  console.log("[%s] rollback last word:", this.name, last_word);
	}
	last_word.restoreBrokenWord(this.brokenWord);
      }
      this.brokenWord = null;
    }
    this.lexer.setPos(this.backupPos);
  }

  public createTextBox(overflow: boolean): LogicalBox {
    let box = this.region.createTextBox(this.env, overflow);
    box.lineBreak = overflow;
    box.charCount = this.counter.inlineChar;
    this.region.clearInlines();
    this.region.resetInlineCursor();
    this.counter.resetInlineCounter();
    if(Config.debugLayout){
      console.log("[%s] createTextBox[%s]:%o", this.name, box.text, box);
    }
    return box;
  }

  protected hyphenate(){
    let offset = this.getHyphenatePos();
    // if offset is minus, it's 'OI-DASHI'.
    if(offset < 0){
      if(Config.debugLayout){
	console.log("OI-DASHI:", offset);
      }
      let pop_count = -offset;
      // prevent from popping all inlines.
      pop_count = this.region.roundHyphenationPopCount(pop_count);
      for(var i = 0; i < pop_count; i++){
	//let char = this.region.popInline();
	this.region.popInline();
	this.pushBack();
      }
    }
    // if offst is plus, it's 'BURA-SAGARI'.
    else if(offset > 0){
      if(Config.debugLayout){
	console.log("BURA=SAGARI:", offset);
      }
      let push_count = offset;
      for(var i = 0; i < push_count; i++){
	this.region.pushInline(this.lexer.getNext());
      }
    }
  }

  protected getHyphenatePos(): number {
    let tail  = this.lexer.peek(-1);
    let head  = this.lexer.peek( 0);
    let next1 = this.lexer.peek(+1);

    // c ... [prev2][prev1][tail] <br>
    // [head(NG)][next1]
    if(head instanceof DualChar && head.isHeadNg() && head.isHangEnable()){
      //
      // BURA-SAGARI for head-NG(+1)
      //
      // c ... [prev2][prev1][tail][head] <br>
      // [next1]
      if(next1 === null || next1 instanceof DualChar === false){
	return +1;
      }
      if(next1 && next1 instanceof DualChar && next1.isHeadNg() === false){
	return +1;
      }

      //
      // OI-DASHI for head-NG(-1)
      // 
      // c ... c [prev2][prev1]<br>
      // [tail][head][next1]
      if(tail && tail instanceof DualChar === false){
	return -1;
      }
      if(tail && tail instanceof DualChar && tail.isHeadNg() === false){
	return -1;
      }
    }

    // c ... c [prev2][prev1][tail(NG)]<br>
    // [head][next1]
    if(tail instanceof DualChar && tail.isTailNg()){
      let move = -1;
      while(true){
	let prev = this.lexer.peek(move - 1); // prev1(-2), prev2(-3) ...
	if(!prev){
	  break;
	}
	if(prev && prev instanceof DualChar === false){
	  break;
	}
	if(prev && prev instanceof DualChar && prev.isTailNg() === false){
	  break;
	}
	move--;
      }
      return move;
    }
    return 0;
  }
}
