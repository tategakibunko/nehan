import {
  Utils,
  HtmlElement,
  BoxType,
  LogicalPos,
  LogicalSize,
  Display,
  Position,
  WritingMode,
  Font,
  LogicalBoxEdge,
  LogicalFloat,
  LogicalTextAlign,
  LogicalVerticalAlign,
  LogicalBackgroundPos,
  TextCombineUpright,
  TextOrientation,
  TextEmphasis,
  OverflowWrap,
  WordBreak,
  Content,
  ListStyle,
  WhiteSpace,
  PageBreakBefore,
} from "./public-api";

// In paged media, displayed box of each element is splited by page.
// As a result, actual size, position etc.. are all different.
// But BoxEnv is set of 'constant' styles defined in each css settings.
export class BoxEnv {
  public element: HtmlElement;
  public parent?: BoxEnv;
  public measure: number | null;
  public extent: number | null;
  public absPos: LogicalPos;
  public display: Display;
  public position: Position;
  public writingMode: WritingMode;
  public font: Font;
  public edge: LogicalBoxEdge;  // constant edge defined in css.
  public float: LogicalFloat;
  public verticalAlign: LogicalVerticalAlign;
  public textAlign: LogicalTextAlign;
  public textCombineUpright: TextCombineUpright;
  public textOrientation: TextOrientation;
  public textEmphasis: TextEmphasis;
  public overflowWrap: OverflowWrap;
  public wordBreak: WordBreak;
  public content: Content;
  public listStyle: ListStyle;
  public whiteSpace: WhiteSpace;
  public pageBreakBefore: PageBreakBefore;
  public backgroundPos: LogicalBackgroundPos;

  constructor(element: HtmlElement, parent?: BoxEnv){
    this.element = element;
    this.parent = parent;
    this.measure = LogicalSize.loadMeasure(element);
    this.extent = LogicalSize.loadExtent(element);
    this.float = LogicalFloat.load(element);
    this.display = this.loadDisplay(element, this.float);
    this.position = Position.load(element);
    this.absPos = LogicalPos.load(element);
    this.writingMode = WritingMode.load(element);
    this.font = Font.load(element);
    this.edge = this.loadEdge(element, this.display);
    this.verticalAlign = LogicalVerticalAlign.load(element);
    this.textAlign = LogicalTextAlign.load(element);
    this.textCombineUpright = TextCombineUpright.load(element);
    this.textOrientation = TextOrientation.load(element);
    this.textEmphasis = TextEmphasis.load(element);
    this.overflowWrap = OverflowWrap.load(element);
    this.wordBreak = WordBreak.load(element);
    this.content = Content.load(element);
    this.listStyle = ListStyle.load(element);
    this.whiteSpace = WhiteSpace.load(element);
    this.pageBreakBefore = PageBreakBefore.load(element);
    this.backgroundPos = LogicalBackgroundPos.load(element);
  }

  protected loadDisplay(element: HtmlElement, float: LogicalFloat): Display {
    let display = Display.load(element);
    if(display.isInlineLevel() && float.isFloat()){
      display.setBlockLevel();
    }
    return display;
  }

  protected loadEdge(element: HtmlElement, display: Display): LogicalBoxEdge {
    return display.isNone()? LogicalBoxEdge.none : LogicalBoxEdge.load(element);
  }

  public isTextVertical(): boolean {
    return this.writingMode.isTextVertical();
  }

  public isTextEmphasized(): boolean {
    return this.textEmphasis.isNone() === false;
  }

  public isTextJustify(): boolean {
    return this.textAlign.isJustify();
  }

  public isWordBreakAll(): boolean {
    return this.wordBreak.isBreakAll();
  }

  public isOverflowBreakWord(): boolean {
    return this.overflowWrap.isBreakWord();
  }

  public isPositionAbsolute(): boolean {
    return this.position.isAbsolute();
  }

  public isFloat(): boolean {
    return this.float.isFloat();
  }

  public isBlockLevel(): boolean {
    return this.display.isBlockLevel();
  }

  public isLineRoot(): boolean {
    return this.display.isBlockLevel() || this.display.isFlowRoot();
  }

  public get contentValue(): string {
    return this.content.value;
  }

  public get fontSize(): number {
    return this.font.size;
  }

  public get boxType(): BoxType {
    return this.display.boxType;
  }

  public getLineExtent(max_inline_extent: number): number {
    if(this.font.lineHeight.indexOf("px") < 0){
      return Math.floor(max_inline_extent * parseFloat(this.font.lineHeight));
    }
    return Utils.atoi(this.font.lineHeight, 10);
  }
}
