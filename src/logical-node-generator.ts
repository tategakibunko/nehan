import {
  LayoutResult,
  HtmlElement,
  Display,
  BoxEnv,
  CssLoader,
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
} from './public-api'
import { TcyLexer } from './text-lexer';

export interface ChildGenerator {
  generator: ILogicalNodeGenerator;
  nextElement: HtmlElement | null;
}

export interface ILogicalNodeGenerator {
  context: ILayoutFormatContext;
  getNext(): LayoutResult | undefined;
}

export class LogicalNodeGenerator {
  static createRoot(element: HtmlElement): ILogicalNodeGenerator {
    const rootEnv = new BoxEnv(element);
    const rootContext = new FlowRootFormatContext(rootEnv);
    return new BlockNodeGenerator(rootContext, RootBlockReducer.instance);
  }

  static createChild(element: HtmlElement, parentContext: ILayoutFormatContext): ChildGenerator {
    if (element.isTextElement()) {
      const text = element.textContent;
      const lexer = parentContext.env.textCombineUpright.isNone() ? new TextLexer(text) : new TcyLexer(text);
      const nextElement = element.nextSibling;
      const generator = new TextNodeGenerator(
        new TextFormatContext(parentContext.env, lexer, parentContext)
      );
      return { generator, nextElement };
    }
    const display = Display.load(element);
    CssLoader.loadDynamic(element);
    const env = new BoxEnv(element);

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
        new FlowFormatContext(env, parentContext),
        InlineBlockReducer.instance
      );
      const nextElement = element.nextSibling;
      return { generator, nextElement };
    }
    if (display.isInlineLevel()) {
      if (element.tagName === "br") {
        const generator = new LineBreakGenerator(
          new FlowFormatContext(env, parentContext)
        );
        const nextElement = element.nextSibling;
        return { generator, nextElement };
      }
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

