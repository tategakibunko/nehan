import {
  Config,
  LayoutResult,
  LogicalNodeGenerator,
  LogicalTextNode,
  HtmlElement,
  ILogicalNodeGenerator,
  BlockMargin,
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

    let prevChildGen: ILogicalNodeGenerator | undefined = undefined;

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
      if (this.context.child.context.env.display.isBlockLevel()) {
        if (this.context.inlineNodes.length > 0) {
          yield this.context.acceptLayoutReducer(this.reducer, true);
          yield LayoutResult.lineBreak(this.context, "sweep out inlines for next block(inside inline)");
        }
      }
      // If cur child has some margin between latest flow block, add it before yielding it's content.
      const beforeMargin = BlockMargin.getFlowMarginFromLastElement(this.context.env, this.context.child, prevChildGen);
      const parentBlockCtx = this.context.parentBlock;
      if (parentBlockCtx && beforeMargin > 0) {
        if (parentBlockCtx.restExtent < beforeMargin) {
          yield LayoutResult.pageBreak(this.context, `block-fmt-context: before-margin(${beforeMargin}) is not enough.`);
        }
        if (parentBlockCtx instanceof FlowFormatContext) {
          parentBlockCtx.addBlockMarginEdge("before", beforeMargin);
          // console.log(`[${this.context.name}] margin(${beforeMargin}px) is added before ${childElement.tagName}`);
        }
      }
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
          const textNode = value.body as LogicalTextNode;
          // Prevent double line-break by <br> that follows overflow-indent of text-node.
          if (textNode.skipBr && childGen.nextElement && childGen.nextElement.tagName === "br") {
            childGen.nextElement = childGen.nextElement.nextSibling;
          }
          this.context.addText(textNode);
        } else if (value.type === 'ruby') {
          this.context.addInline(value.body);
        } else if (value.type === 'inline-link') {
          this.context.addInlineLink(value.body);
        } else if (value.type === 're-inline') {
          this.context.addInlineRe(value.body);
        } else if (value.type === 'inline-block') {
          this.context.addInlineBlock(value.body);
        } else if (value.isBlockLevel()) {
          yield value; // delegate to parent.
        }
      }
      prevChildGen = childGen.generator;
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

