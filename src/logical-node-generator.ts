import {
  Config,
  Anchor,
  LayoutResult,
  NehanElement,
  Display,
  BoxEnv,
  CssLoader,
  ICharacter,
  ILexer,
  TextLexer,
  ILayoutFormatContext,
  FlowFormatContext,
  TextFormatContext,
  RubyNormalizer,
  RubyFormatContext,
  RubyChildFormatContext,
  RubyNodeGenerator,
  TextNodeGenerator,
  InlineNodeGenerator,
  BlockNodeGenerator,
  LineBreakGenerator,
  RubyBaseReducer,
  RubyTextReducer,
  RootBlockReducer,
  FlowRootFormatContext,
  TableCellInitializer,
  TableCellsGenerator,
  TableCellsFormatContext,
  ListItemInitializer,
  PseudoElementTagName,
  ListMarkerReducer,
  TableReducer,
  TableRowGroupReducer,
  TableRowReducer,
  TableRowGroupInitializer,
  TableRowInitializer,
  InlineBlockReducer,
  ReFormatContext,
  FirstLineFormatContext,
  PageRootFormatContext,
  InlineLinkReducer,
  ReplacedElement,
  BlockLinkReducer,
  TcyLexer,
  ReNodeGenerator,
  ConstantValueGenerator,
  UprightTokenMapper,
  TcyTokenMapper,
  ReShrinkResizer,
  ReIdResizer,
  ReReducer,
} from './public-api'

export interface ChildGenerator {
  generator: ILogicalNodeGenerator;
  nextElement: NehanElement | null;
}

export interface ILogicalNodeGenerator {
  context: ILayoutFormatContext;
  getNext(): LayoutResult | undefined;
}

export class LogicalNodeGenerator {
  static createRoot(element: NehanElement): ILogicalNodeGenerator {
    const rootEnv = new BoxEnv(element);
    const rootContext = new PageRootFormatContext(rootEnv);
    return new BlockNodeGenerator(rootContext, RootBlockReducer.instance);
  }

  static createTextLexer(element: NehanElement, env: BoxEnv): ILexer<ICharacter> {
    // console.log("createTextLexer:", element, env);
    const isPre = env.whiteSpace.isPre();
    const text = element.textContent || element.computedStyle.getPropertyValue("content") || "";
    const lexer = env.textCombineUpright.isNone() ? new TextLexer(text, { isPre }) : new TcyLexer(text);
    if (env.textOrientation.isUpright()) {
      lexer.acceptTokenMapper(new UprightTokenMapper());
    } else if (lexer.hasWord()) {
      lexer.acceptTokenMapper(new TcyTokenMapper());
    }
    return lexer;
  }

  static createChild(element: NehanElement, parentContext: ILayoutFormatContext): ChildGenerator {
    if (element.isTextElement()) {
      const lexer = this.createTextLexer(element, parentContext.env);
      const nextElement = element.nextSibling;
      const generator = new TextNodeGenerator(
        new TextFormatContext(lexer, parentContext)
      );
      return { generator, nextElement };
    }
    if (Config.debugLayout) {
      console.log("createChild, element: %o, parentContext: %o", element, parentContext);
    }
    CssLoader.loadDynamic(element, parentContext);
    const env = new BoxEnv(element);
    const display = env.display;
    if (display.isNone()) {
      const generator = new ConstantValueGenerator(
        new FlowFormatContext(env, parentContext),
        LayoutResult.skip(parentContext, "display:none")
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    // if element has id, register it's position as anchor.
    if (element.id) {
      const flowRoot = parentContext.flowRoot;
      // Note that strict pageIndex is not determined at this point, so we set -1 temporarily.
      const anchor: Anchor = { name: element.id, element, pageIndex: -1 };
      // [FIXME]
      // [Research Needed]
      // Sometimes, IFlowRootFormatContext is not implemented to parentContext.flowRoot.
      if (flowRoot.setAnchor) {
        flowRoot.setAnchor(element.id, anchor);
      }
    }
    if (ReplacedElement.isReplacedElement(element)) {
      const generator = new ReNodeGenerator(
        new ReFormatContext(env, parentContext),
        ReReducer.instance,
        ReShrinkResizer.instance,
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (element.$dom) {
      const generator = new ReNodeGenerator(
        new ReFormatContext(env, parentContext),
        ReReducer.instance,
        ReIdResizer.instance,
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (element.tagName === "a") {
      const context = new FlowFormatContext(env, parentContext);
      const generator = display.isInlineLevel() ?
        new InlineNodeGenerator(context, InlineLinkReducer.instance) :
        new BlockNodeGenerator(context, BlockLinkReducer.instance);
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (element.tagName === "br") {
      const generator = new LineBreakGenerator(
        new FlowFormatContext(env, parentContext)
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (display.isFlowRuby()) {
      // normalize ruby element.
      env.element.acceptEffector(RubyNormalizer.instance);
      const generator = new RubyNodeGenerator(
        new RubyFormatContext(env, parentContext)
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (display.isRubyBase()) {
      const generator = new InlineNodeGenerator(
        new RubyChildFormatContext(env, parentContext),
        RubyBaseReducer.instance
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (display.isRubyText()) {
      const generator = new InlineNodeGenerator(
        new RubyChildFormatContext(env, parentContext),
        RubyTextReducer.instance
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    // ::first-line
    if (element.tagName === PseudoElementTagName.FIRST_LINE) {
      const generator = new BlockNodeGenerator(
        new FirstLineFormatContext(env, parentContext)
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    // ::marker
    if (element.tagName === PseudoElementTagName.MARKER) {
      const generator = new InlineNodeGenerator(
        new FlowFormatContext(env, parentContext),
        ListMarkerReducer.instance
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (display.isTableCell() && element.parent) {
      element.acceptEffector(TableCellInitializer.instance); // set cell partition
      const cells = element.parent.children.filter(child => Display.load(child).isTableCell());
      const generator = new TableCellsGenerator(
        new TableCellsFormatContext(cells, parentContext.env, parentContext) // use parent env
      );
      const nextElement = cells[cells.length - 1].nextSibling;
      return { generator, nextElement };
    }
    if (display.isTable()) {
      const generator = new BlockNodeGenerator(
        new FlowFormatContext(env, parentContext),
        TableReducer.instance
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (display.isTableRowGroup()) {
      element.acceptEffector(TableRowGroupInitializer.instance);
      const generator = new BlockNodeGenerator(
        new FlowFormatContext(env, parentContext),
        TableRowGroupReducer.instance
      );
      const nextElement = element.nextElementSibling;
      return { generator, nextElement };
    }
    if (display.isTableRow()) {
      element.acceptEffector(TableRowInitializer.instance);
      const generator = new BlockNodeGenerator(
        new FlowFormatContext(env, parentContext),
        TableRowReducer.instance
      );
      const nextElement = element.nextElementSibling;
      return { generator, nextElement };
    }
    if (display.isInlineBlockFlow()) {
      const generator = new BlockNodeGenerator(
        new FlowRootFormatContext(env, parentContext),
        InlineBlockReducer.instance
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (display.isInlineLevel()) {
      const generator = new InlineNodeGenerator(
        new FlowFormatContext(env, parentContext)
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (display.isFlowRoot()) {
      const generator = new BlockNodeGenerator(
        new FlowRootFormatContext(env, parentContext)
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (display.isListItem()) {
      element.acceptEffector(ListItemInitializer.instance);
    }
    const generator = new BlockNodeGenerator(
      new FlowFormatContext(env, parentContext)
    );
    const nextElement = element.nextSibling;
    return { generator, nextElement };
  }
}

