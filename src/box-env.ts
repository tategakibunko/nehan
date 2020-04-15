import {
  HtmlElement,
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
  PageBreakAfter,
  BorderCollapse,
  CssLoader,
} from "./public-api";

// In paged media, displayed box of each element is splited by page.
// As a result, actual size, position etc.. are all different.
// But BoxEnv is set of 'constant' styles defined in each css settings.
export class BoxEnv {
  public element: HtmlElement;
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
  public pageBreakAfter: PageBreakAfter;
  public backgroundPos: LogicalBackgroundPos;
  public borderCollapse: BorderCollapse;

  constructor(element: HtmlElement) {
    this.element = element;
    this.measure = LogicalSize.loadMeasure(element);
    this.extent = LogicalSize.loadExtent(element);
    this.float = LogicalFloat.load(element);
    this.display = this.loadDisplay(element);
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
    this.pageBreakAfter = PageBreakAfter.load(element);
    this.backgroundPos = LogicalBackgroundPos.load(element);
    this.borderCollapse = BorderCollapse.load(element);
  }

  protected loadDisplay(element: HtmlElement): Display {
    const display = Display.load(element);
    // display of <a> is dynamically decided by it's first element.
    if (element.tagName === "a" && display.isInlineLevel()) {
      const firstElement = element.firstElementChild;
      if (!firstElement) {
        return display;
      }
      CssLoader.load(firstElement);
      return Display.load(firstElement);
    }
    return display;
  }

  protected loadEdge(element: HtmlElement, display: Display): LogicalBoxEdge {
    return display.isNone() ? LogicalBoxEdge.none : LogicalBoxEdge.load(element);
  }
}
