import {
  ILogicalNodeGenerator,
  LogicalNodeGenerator,
  LayoutResult,
  HtmlElement,
  Display,
  LogicalClear,
  LogicalFloat,
  InlineMargin,
  BlockMargin,
  ILayoutReducer,
  FlowFormatContext,
  LineReducer,
  BlockReducer,
  WhiteSpace,
} from './public-api';

// ----------------------------------------------------------------------
// (text-box | inline-box | block-box | line-break | page-break)* -> block-box
// ----------------------------------------------------------------------
export class BlockNodeGenerator implements ILogicalNodeGenerator {
  private generator: Generator<LayoutResult>;

  constructor(
    public context: FlowFormatContext,
    protected blockReducer: ILayoutReducer = BlockReducer.instance,
    protected lineFormatReducer: ILayoutReducer = LineReducer.instance,
  ) {
    this.generator = this.createGenerator();
  }

  public getNext(): LayoutResult | undefined {
    const next = this.generator.next();
    return next.done ? undefined : next.value;
  }

  protected *createGenerator(): Generator<LayoutResult> {
    console.group(`${this.context.name}`);

    if ((this.context.env.measure && this.context.env.measure <= 0) ||
      this.context.contextBoxEdge.borderBoxExtent > this.context.restExtent) {
      console.error("This layout can never be included.");
      yield LayoutResult.skip;
      return;
    }
    while (this.context.restExtent < this.context.contextBoxEdge.getBorderBoxEdgeSize("before")) {
      yield LayoutResult.pageBreak;
    }
    this.context.addBorderBoxEdge("before"); // restExtent shorten
    // in block element, content size is already calculated in css loading.
    // this.context.contextBoxEdge.addInlineEdge(); // restMeasure shorten
    let childElement: HtmlElement | null = this.context.env.element.firstChild;
    while (childElement !== null) {
      const display = Display.load(childElement);
      if (display.isNone() || WhiteSpace.isWhiteSpaceElement(childElement)) {
        console.warn("skip element:", childElement);
        childElement = childElement.nextSibling;
        continue;
      }

      // before switching to next block, check there is inlines that are not still wrapped by anon-line-box.
      /*
      if ((!float.isNone() || display.isBlockLevel()) && this.context.inlineNodes.length > 0) {
        console.warn("sweep out remaining inlines as line");
        const line = this.context.acceptLayoutReducer(LineReducer.instance);
        this.context.addBlock(line.body); // never overflows!
      }
      */
      this.context.inlineMargin = InlineMargin.getMarginFromParentBlock(childElement);
      const beforeMargin = BlockMargin.getMarginFromLastBlock(childElement);
      if (beforeMargin > 0) {
        this.context.addMarginEdge("before", beforeMargin);
        console.log(`[${this.context.name}] margin(${beforeMargin}px) is added before ${childElement.tagName}`);
      }
      while (this.context.restExtent < beforeMargin) {
        yield LayoutResult.pageBreak;
      }
      this.context.child = LogicalNodeGenerator.createChild(childElement, this.context);
      const clear = LogicalClear.load(childElement);
      if (!clear.isNone()) {
        this.context.flowRoot.clearFloat(clear);
      }
      const float = LogicalFloat.load(childElement);
      while (true) {
        // Before yielding child generator, resume suspended generators if it exists.
        this.context.suspendedGens = this.context.suspendedGens.filter(generator => {
          const fvalue = generator.getNext();
          if (!fvalue) {
            return false;
          }
          if (fvalue.type === "block") {
            const float = generator.context.env.float;
            this.context.flowRoot.addFloat(fvalue.body, float, this.context.maxMeasure);
          }
          return true;
        });
        const value = this.context.child.getNext();
        if (!value) {
          break;
        }
        if (!float.isNone() && value.type === 'block') {
          this.context.flowRoot.addFloat(value.body, float, this.context.maxMeasure);
          this.context.suspendedGens.push(this.context.child);
          break;
        }
        if (value.type === 'skip') {
          console.warn("finish(%s)", childElement.tagName);
          break;
        }
        if (value.type === 'line-break') {
          const line = this.context.acceptLayoutReducer(this.lineFormatReducer);
          this.context.addBlock(line.body);
        } else if (value.type === 'page-break') {
          const block = this.context.acceptLayoutReducer(this.blockReducer);
          if (this.context.env.element.tagName === "body") {
            yield block;
          } else {
            yield block;
            yield value; // page-break
          }
        } else if (value.type === 'block') {
          this.context.addBlock(value.body);
        } else if (value.type === 'inline') {
          this.context.addInline(value.body);
        } else if (value.type === 'text') {
          this.context.addText(value.body);
        } else if (value.type === 'ruby') {
          this.context.addRuby(value.body);
        } else if (value.type === 'empha') {
          this.context.addEmpha(value.body);
        } else if (value.type === 'request-measure') {
          throw "todo(request-measure)";
        }
      } // while(true)
      childElement = childElement!.nextSibling;
    } // while (childElement !== null)

    if (this.context.inlineNodes.length > 0) {
      const line = this.context.acceptLayoutReducer(LineReducer.instance);
      this.context.addBlock(line.body);
    }

    while (this.context.restExtent < this.context.contextBoxEdge.getBorderBoxEdgeSize("after")) {
      yield LayoutResult.pageBreak;
    }

    this.context.addBorderBoxEdge("after");
    const marginAfter = this.context.contextBoxEdge.margin.getSize("after");
    if (!this.context.env.float.isNone() && this.context.restExtent >= marginAfter) {
      this.context.addMarginEdge("after", marginAfter);
    }

    yield this.context.acceptLayoutReducer(this.blockReducer);
    console.groupEnd();
  }
}

