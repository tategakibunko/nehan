import {
  BoxEnv,
  BoxType,
  BoxContent,
  DomTokenList,
  LogicalSize,
  LogicalBoxEdge,
  LogicalCursorPos,
  ICharacter,
  isCharacter,
  LayoutParent,
  NativeStyleMap,
  Config,
  SpaceChar,
  PhysicalSize,
  HtmlElement,
  LogicalFloat,
  Display,
  WritingMode,
  TextCombineUpright,
  ListStyle,
  WhiteSpace,
} from "./public-api";

export class LogicalBox {
  public tagName: string;
  public parent: LogicalBox | null;
  public env: BoxEnv;
  public boxType: BoxType;
  public size: LogicalSize;
  public autoSize: LogicalSize;
  public contextEdge: LogicalBoxEdge | null;
  public blockPos: LogicalCursorPos | null;
  public charCount: number;
  public pageIndex: number;
  public localPageIndex: number;
  public lineBreak: boolean;
  public blockBreak: boolean;
  public hasNext: boolean;
  protected children: BoxContent [];

  constructor(env: BoxEnv, box_type: BoxType, size: LogicalSize){
    this.tagName = env.element.tagName;
    this.parent = null;
    this.env = env;
    this.boxType = box_type;
    this.size = size;
    this.autoSize = new LogicalSize({measure:0, extent:0});
    this.contextEdge = null;
    this.blockPos = null;
    this.charCount = 0;
    this.pageIndex = 0;
    this.localPageIndex = 0;
    this.children = [];
    this.lineBreak = false;
    this.blockBreak = false;
    this.hasNext = false;
  }

  public clearChildren(){
    this.children = [];
  }

  public getChild(index: number): BoxContent {
    return this.children[index];
  }

  public getChildren(): BoxContent [] {
    return this.children;
  }

  public getDirectCharacters(): ICharacter [] {
    return this.children.filter(isCharacter) as ICharacter [];
  }

  public getCharacters(): ICharacter [] {
    return this.children.reduce((acm, cont) => {
      if(isCharacter(cont)){
	return acm.concat(cont as ICharacter);
      } else if(cont instanceof LogicalBox){
	return acm.concat(cont.getCharacters());
      }
      return acm;
    }, [] as ICharacter []);
  }

  public addChild(child: BoxContent){
    if(child instanceof LogicalBox){
      child.parent = this;
    }
    this.children.push(child);
  }

  public addChildren(children: BoxContent []){
    children.forEach(child => this.addChild(child));
  }

  public getRootLine(): LogicalBox | null {
    if(this.isLine()){
      return this;
    }
    return this.parent? this.parent.getRootLine() : null;
  }

  public getRootTextLine(): LogicalBox | null {
    let root_line = this.getRootLine();
    if(root_line){
      let first_child = root_line.getChild(0) || null;
      return first_child? first_child as LogicalBox : null;
    }
    return null;
  }

  public getCssCursorPos(parent: LayoutParent, pos: LogicalCursorPos): NativeStyleMap {
    let edge = parent? parent.contextEdge : null;
    let offset = edge? edge.getInnerBoxOffset() : LogicalCursorPos.zeroValue;
    return pos.translate(offset).getCss(this);
  }

  protected getCssBox(parent: LayoutParent): NativeStyleMap {
    let css = new NativeStyleMap();
    let is_vert = this.writingMode.isTextVertical();
    this.env.font.getCss(parent, this).mergeTo(css);
    this.size.getCss(is_vert).mergeTo(css);
    if(this.contextEdge){
      this.contextEdge.getCss(this).mergeTo(css);
    }
    if(this.isPositionAbsolute() && this.env.absPos.hasValue()){
      this.env.absPos.getCss(this).mergeTo(css);
    } else if(this.blockPos){
      this.getCssCursorPos(parent, this.blockPos).mergeTo(css);
    } else if(is_vert && this.contextEdge && !this.contextEdge.padding.isZero() && this.parent){
      // if vertical inline without blockpos but padding value is enable
      // (example: <div>foo <a style='padding:10px'>bar</a> baz</div>),
      // fix block level padding offset.
      let off = this.contextEdge.getInnerBoxOffset();
      off.start = 0; // inline edge is already available in inline context.
      LogicalCursorPos.zero.translate(off).getCss(this).mergeTo(css);
      css.set("position", "relative");
    }
    // floating block has higher z-index than float-space box.
    if(this.isFloat()){
      css.set("z-index", "10");
    }
    // native line-height for vertical-line is already used to separate each character by <br>.
    if(!is_vert){
      css.set("line-height", this.env.font.lineHeight);
    }
    Config.unmanagedCssProps.forEach(prop => {
      let value = this.element.style.getPropertyValue(prop);
      if(value){
	css.set(prop, value);
      }
    });
    return css;
  }

  public getCssBlock(parent: LayoutParent): NativeStyleMap {
    let css = this.getCssBox(parent);
    this.env.backgroundPos.getCss(this).mergeTo(css);
    return css;
  }

  public getCssBlockRe(parent: LayoutParent): NativeStyleMap {
    let css = new NativeStyleMap();
    if(this.blockPos){
      this.getCssCursorPos(parent, this.blockPos).mergeTo(css);
    }
    if(this.contextEdge){
      this.contextEdge.getCss(this).mergeTo(css);
    }
    // floating block has higher z-index than float-space box.
    if(this.isFloat()){
      css.set("z-index", "10");
    }
    return css;
  }

  // inline css for vertical ReplacedElement like <img>, <video>.
  public getCssInlineVertRe(parent: LayoutParent): NativeStyleMap {
    let css = new NativeStyleMap();
    let root_text = this.getRootTextLine();
    if(root_text && root_text.totalExtent < this.totalExtent){
      let gap = Math.floor((root_text.totalExtent - this.totalExtent) / 2);
      css.set("margin-left", gap + "px");
    }
    css.set("display", "block");
    return css;
  }

  public getCssInline(parent: LayoutParent): NativeStyleMap {
    let css = this.getCssBox(parent);
    // if horizonta, inline box size is not required.
    if(!this.isTextVertical()){
      css.delete("height");
      css.delete("width");
    }
    if(parent &&
       parent.boxType === BoxType.BASELINE &&
       parent.isTextVertical() &&
       this.element.tagName !== "rt" && // because 'parent' is not real parent of rb, rt.
       this.element.tagName !== "rb"){
      // fix gap of base font-size
      if(parent.fontSize !== this.fontSize || this.env.isTextEmphasized()){
	let gap = Math.floor((parent.fontSize - this.fontSize) / 2);
	css.set("margin-left", gap + "px");
      }
    }
    return css;
  }

  public getCssInlineBlock(parent: LayoutParent): NativeStyleMap {
    let css = this.getCssBox(parent);
    if(parent && parent.isTextVertical()){
      // if inline-block is larger than extent of parent text-box, fix the gap.
      let gap = Math.floor((parent.totalExtent - this.totalExtent) / 2)
      if(gap < 0){
	css.set("margin-left", String(gap) + "px");
      }
    }
    return css;
  }

  public justify(baseline: LogicalBox){
    let chars = baseline.getDirectCharacters();
    let total_gap = baseline.restSpaceMeasure;
    if(total_gap === 0){
      return;
    }
    let unit_gap = total_gap / chars.length;
    let max_unit_gap = this.fontSize / 8;
    if(unit_gap > max_unit_gap){
      return;
    }
    chars.forEach(char => char.spacing = unit_gap);
  }

  public getCssLine(parent: LayoutParent): NativeStyleMap {
    let css = new NativeStyleMap();
    let is_vert = this.writingMode.isTextVertical();
    if(this.blockPos){
      this.getCssCursorPos(parent, this.blockPos).mergeTo(css);
    }
    if(this.contextEdge){
      this.contextEdge.getCss(this).mergeTo(css);
    }
    this.size.getCss(is_vert).mergeTo(css);
    return css;
  }

  public getCssBaseline(parent: LayoutParent): NativeStyleMap {
    let css = this.getCssBlock(parent);
    this.env.verticalAlign.getCss(this).mergeTo(css);
    this.env.textAlign.getCss(this).mergeTo(css);
    return css;
  }

  public getCssText(parent: LayoutParent): NativeStyleMap {
    let css = this.getCssBlock(parent);
    return css;
  }

  public get pureTagName(): string {
    return this.element.pureTagName;
  }

  public get id(): string {
    return this.element.id;
  }

  public get classList(): DomTokenList {
    return this.element.classList;
  }

  public toString(): string {
    let name = this.env.element.tagName;
    let btype = this.boxType;
    let measure = this.size.measure;
    let extent = this.size.extent;
    return [
      `<${name}:${btype}>`,
      `(${measure}x${extent}):`,
      `total=(${this.totalMeasure}, ${this.totalExtent}):`,
      (this.blockPos? this.blockPos.toString() : ""),
      `${this.text}`,
    ].join("");
  }

  public isBlockLevel(): boolean {
    return this.env.isBlockLevel();
  }

  public isFloat(): boolean {
    return this.float.isNone() === false;
  }

  public isFloatStart(): boolean {
    return this.float.isStart();
  }

  public isFloatEnd(): boolean {
    return this.float.isEnd();
  }

  public isVerticalRl(): boolean {
    return this.writingMode.isVerticalRl();
  }

  public isTextVertical(): boolean {
    return this.env.isTextVertical();
  }

  public isPositionAbsolute(): boolean {
    return this.env.isPositionAbsolute();
  }

  public isLine(): boolean {
    return this.boxType === BoxType.LINE;
  }

  public isBaseline(): boolean {
    return this.boxType === BoxType.BASELINE;
  }

  public isText(): boolean {
    return this.boxType === BoxType.TEXT;
  }

  public isEmptyLine(): boolean {
    return this.isLine() && this.children.length === 0;
  }

  public isImage(): boolean {
    return this.tagName === "img";
  }

  public isVideo(): boolean {
    return this.tagName === "video";
  }

  public isReplacedElement(): boolean {
    return this.isImage() || this.isVideo();
  }

  public isInlineBlock(): boolean {
    return this.boxType === BoxType.INLINE_BLOCK;
  }

  public isWhiteSpaceLine(): boolean {
    let text = this.children[0] as LogicalBox;
    return this.isLine() && text && text.children.every(value => value instanceof SpaceChar);
  }

  public get childBoxCount(): number {
    return this.children.length;
  }

  public get physicalSize(): PhysicalSize {
    return this.size.getPhysicalSize(this.writingMode);
  }

  public get text(): string {
    switch(this.tagName){
    case "img": case "video":
      return `(${this.tagName})`;
    }
    return this.children.reduce((acm, child) => {
      return acm + child.text;
    }, "");
  }

  public get element(): HtmlElement {
    return this.env.element;
  }

  public get float(): LogicalFloat {
    return this.env.float;
  }

  public get display(): Display {
    return this.env.display;
  }

  public get writingMode(): WritingMode {
    return this.env.writingMode;
  }

  public get textCombineUpright(): TextCombineUpright {
    return this.env.textCombineUpright;
  }

  public get fontSize(): number {
    return this.env.fontSize;
  }

  public get listStyle(): ListStyle {
    return this.env.listStyle;
  }

  public get whiteSpace(): WhiteSpace {
    return this.env.whiteSpace;
  }

  public get restSpaceMeasure(): number {
    return this.size.measure - this.autoSize.measure;
  }

  public get edgeMeasure(): number {
    return this.contextEdge? this.contextEdge.measure : 0;
  }

  public get edgeExtent(): number {
    return this.contextEdge? this.contextEdge.extent : 0;
  }

  public get totalSize(): LogicalSize {
    return new LogicalSize({
      measure:this.totalMeasure,
      extent:this.totalExtent
    });
  }

  public get totalMeasure(): number {
    return this.size.measure + this.edgeMeasure;
  }

  public get totalExtent(){
    return this.size.extent + this.edgeExtent;
  }
}
