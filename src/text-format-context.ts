import {
  BoxEnv,
  TextLexer,
  LayoutResult,
  LogicalCursorPos,
  ICharacter,
  ILayoutFormatContext,
  ILayoutReducer,
  IFlowRootFormatContext,
  IFlowFormatContext,
  PageRootFormatContext,
} from './public-api'

export class TextFormatContext implements ILayoutFormatContext {
  public name = "(text)";
  public progress: number;
  public cursorPos: LogicalCursorPos;
  public characters: ICharacter[];
  public text: string;

  constructor(
    public lexer: TextLexer,
    public parent: ILayoutFormatContext,
  ) {
    this.progress = 1; // skip!
    this.cursorPos = LogicalCursorPos.zero;
    this.characters = [];
    this.text = "";
  }

  public get env(): BoxEnv {
    return this.parent.env;
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

  // parent of text node must have some inlines.
  public isLineHead(): boolean {
    return this.cursorPos.start === 0 && this.inlineRoot.inlineNodes.length === 0;
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

  public get contextRestMeasure(): number {
    return this.parent.contextRestMeasure;
  }

  public get restMeasure(): number {
    return this.parent.contextRestMeasure - this.cursorPos.start;
  }

  public get restExtent(): number {
    return this.parent.restExtent - this.cursorPos.before;
  }

  public addCharacter(char: ICharacter) {
    this.characters.push(char);
    this.cursorPos.start += char.size.measure;
    this.text += char.text;
  }

  public acceptLayoutReducer(visitor: ILayoutReducer, overflow: boolean): LayoutResult {
    return visitor.visit(this, overflow);
  }
}

