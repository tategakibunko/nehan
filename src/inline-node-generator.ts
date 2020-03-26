import {
  Config,
  LayoutResult,
  LogicalNodeGenerator,
  HtmlElement,
  ILogicalNodeGenerator,
  InlineMargin,
  ILayoutReducer,
  FlowFormatContext,
  InlineReducer,
} from './public-api';

// ----------------------------------------------------------------------
// (text-box | inline-box)* -> inline-box
// ----------------------------------------------------------------------
export class InlineNodeGenerator implements ILogicalNodeGenerator {
  private generator: Generator<LayoutResult>;

  constructor(
    public context: FlowFormatContext,
    protected reducer: ILayoutReducer = InlineReducer.instance
  ) {
    this.generator = this.createGenerator();
  }

  public getNext(): LayoutResult | undefined {
    const next = this.generator.next();
    return next.done ? undefined : next.value;
  }

  protected *createGenerator(): Generator<LayoutResult> {
    if (Config.debugLayout) {
      console.group(`inline: ${this.context.name}`);
    }

    if (this.context.rootExtent < this.context.contextBoxEdge.borderBoxExtent ||
      this.context.rootMeasure < this.context.contextBoxEdge.borderBoxMeasure) {
      yield LayoutResult.skip(this.context, "Too large edge size: this layout can't be included!");
      return;
    }

    if (this.context.restExtent < this.context.contextBoxEdge.borderBoxExtent) {
      yield LayoutResult.pageBreak(this.context, "inline rest extent not enough for border size");
    }

    this.context.addBorderBoxEdge("before");
    this.context.addBorderBoxEdge("after");

    const startEdgeSize = this.context.contextBoxEdge.getBorderBoxEdgeSize("start");
    if (this.context.restMeasure < startEdgeSize) {
      yield LayoutResult.lineBreak(this.context, "Start edge is not enough for restMeasure");
    }

    this.context.addBorderBoxEdge("start"); // context.cursorPos.start += startEdgeSize

    let childElement: HtmlElement | null = this.context.env.element.firstChild;

    while (childElement !== null) {
      const inlineMarginSize = InlineMargin.getMarginFromLastInline(childElement);
      if (inlineMarginSize > 0 && this.context.restMeasure > inlineMarginSize) {
        this.context.addInlineMarginEdge("start", inlineMarginSize);
      }
      const childGen = LogicalNodeGenerator.createChild(childElement, this.context);
      this.context.child = childGen.generator;
      while (true) {
        const value = this.context.child.getNext();
        if (!value) {
          break;
        }
        if (value.type === 'skip') {
          break;
        }
        if (value.type === 'line-break') {
          yield this.context.acceptLayoutReducer(this.reducer, true);
          yield value; // line-break
        } else if (value.type === 'page-break') {
          if (this.context.inlineNodes.length > 0) {
            yield this.context.acceptLayoutReducer(this.reducer, true);
            yield value; // page-break
          } else {
            yield value; // page-break
          }
        } else if (value.type === 'inline') {
          this.context.addInline(value.body);
        } else if (value.type === 'text') {
          this.context.addText(value.body);
        } else if (value.type === 'ruby') {
          this.context.addInline(value.body);
        } else if (value.type === 'inline-link') {
          this.context.addInlineLink(value.body);
        } else if (value.type === 're-inline') {
          this.context.addInlineRe(value.body);
        }
      }
      childElement = childGen.nextElement;
    }

    const endEdgeSize = this.context.contextBoxEdge.getBorderBoxEdgeSize("end");
    if (endEdgeSize < this.context.restMeasure) {
      this.context.addBorderBoxEdge("end"); // cursorPos.start += endEdgeSize
    }
    const endMarginSize = this.context.contextBoxEdge.margin.getSize("end");
    if (endMarginSize < this.context.restMeasure) {
      this.context.addInlineMarginEdge("end", endMarginSize);
    }
    yield this.context.acceptLayoutReducer(this.reducer, false);
    if (Config.debugLayout) {
      console.groupEnd();
    }
  }
}

