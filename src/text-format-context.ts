import {
  BoxEnv,
  ILexer,
  LayoutResult,
  LogicalCursorPos,
  ICharacter,
  ILayoutFormatContext,
  ILayoutReducer,
  IFlowRootFormatContext,
  IFlowFormatContext,
  PageRootFormatContext,
  ILogicalNodePos,
} from './public-api'

export class TextFormatContext implements ILayoutFormatContext {
  public name = "(text)";
  public progress: number;
  public cursorPos: LogicalCursorPos;
  public characters: ICharacter[];
  public text: string;

  constructor(
    public lexer: ILexer<ICharacter>,
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

  // start-before position of this context from nearest flowRoot.
  public get boxPos(): ILogicalNodePos {
    return {
      offsetPos: this.parent.flowRootPos,
      clientPos: { start: 0, before: 0 }
    };
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
    if (this.cursorPos.start > 0) {
      return false;
    }
    let ctx: ILayoutFormatContext | undefined = this.parent;
    while (ctx) {
      if (ctx.env.display.isBlockLevel() || ctx.env.display.isFlowRoot()) {
        return (ctx as IFlowFormatContext).inlineNodes.length === 0;
      }
      if (ctx.cursorPos.start > 0) {
        return false;
      }
      ctx = ctx.parent;
    }
    throw new Error("inline root not found!");
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

