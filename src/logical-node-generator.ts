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
} from './public-api'
import { TableCellsGenerator, TableCellsFormatContext } from './table-cells-generator';

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

  static createChild(element: HtmlElement, parentContext: ILayoutFormatContext): ILogicalNodeGenerator {
    if (element.isTextElement()) {
      const lexer = new TextLexer(element.textContent);
      return new TextNodeGenerator(
        new TextFormatContext(parentContext.env, lexer, parentContext)
      );
    }
    const display = Display.load(element);
    CssLoader.loadDynamic(element);
    const env = new BoxEnv(element);

    if (display.isFlowRuby()) {
      // normalize ruby element.
      env.element.acceptEffector(RubyNormalizer.instance);
      return new RubyNodeGenerator(
        new RubyFormatContext(env, parentContext)
      );
    }
    if (display.isRubyBase()) {
      return new InlineNodeGenerator(
        new RubyChildFormatContext(env, parentContext),
        RubyBaseReducer.instance
      );
    }
    if (display.isRubyText()) {
      return new InlineNodeGenerator(
        new RubyChildFormatContext(env, parentContext),
        RubyTextReducer.instance
      );
    }
    if (display.isTableCell()) {
      element.acceptEffector(TableCellInitializer.instance);
      /*
      if (element.parent) {
        const cells = element.parent.children.filter(child => Display.load(child).isTableCell());
        return new TableCellsGenerator(
          new TableCellsFormatContext(env, cells, parentContext)
        );
      }
      */
    }
    if (display.isInlineLevel()) {
      if (element.tagName === "br") {
        return new LineBreakGenerator(
          new FlowFormatContext(env, parentContext)
        );
      }
      return new InlineNodeGenerator(
        new FlowFormatContext(env, parentContext)
      );
    }
    if (display.isFlowRoot()) {
      return new BlockNodeGenerator(
        new FlowRootFormatContext(env, parentContext)
      );
    }
    return new BlockNodeGenerator(
      new FlowFormatContext(env, parentContext)
    );
  }
}

