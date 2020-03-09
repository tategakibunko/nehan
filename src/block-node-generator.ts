import {
  Config,
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
// (text | inline-block | block | line-break | page-break)* -> block
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
    if (Config.debugLayout) {
      console.group(`${this.context.name}`);
    }

    const isPageRoot = this.context.env.element.tagName === Config.pageRootTagName;

    if ((this.context.env.measure && this.context.env.measure <= 0) ||
      this.context.env.edge.borderBoxExtent > this.context.restExtent) {
      console.error("This layout can never be included.");
      yield LayoutResult.skip;
      return;
    }
    while (this.context.restExtent < this.context.env.edge.borderBoxBefore) {
      console.info("before border can't be included");
      yield LayoutResult.pageBreak;
    }
    this.context.addBorderBoxEdge("before"); // restExtent shorten
    // Add inline edge, but note that maxMeasure doesn't change
    // because content size of block element is already calculated in css loading.
    this.context.addBorderBoxEdge("start");
    this.context.addBorderBoxEdge("end");
    let childElement: HtmlElement | null = this.context.env.element.firstChild;
    while (childElement !== null) {
      const display = Display.load(childElement);
      if (display.isNone() || WhiteSpace.isWhiteSpaceElement(childElement)) {
        // console.info("skip element:", childElement);
        childElement = childElement.nextSibling;
        continue;
      }
      const float = LogicalFloat.load(childElement);
      // before switching to next block, check there is inlines that are not still wrapped by anon-line-box.
      if ((!float.isNone() || display.isBlockLevel()) && this.context.inlineNodes.length > 0) {
        // console.info("sweep out remaining inlines as line");
        const line = this.context.acceptLayoutReducer(LineReducer.instance);
        this.context.addLine(line.body); // never overflows!
      }
      this.context.inlineMargin = InlineMargin.getMarginFromParentBlock(childElement);
      const childGen = LogicalNodeGenerator.createChild(childElement, this.context);
      this.context.child = childGen.generator;
      const clear = LogicalClear.load(childElement);
      if (!clear.isNone()) {
        this.context.flowRoot.clearFloat(clear);
      }
      const beforeMargin = BlockMargin.getMarginFromLastBlock(childElement);
      if (beforeMargin > 0) {
        this.context.addBlockMarginEdge("before", beforeMargin);
        // console.log(`[${this.context.name}] margin(${beforeMargin}px) is added before ${childElement.tagName}`);
      }
      while (this.context.restExtent < beforeMargin) {
        yield isPageRoot ? this.context.acceptLayoutReducer(this.blockReducer) : LayoutResult.pageBreak;
      }
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
        if (!float.isNone() && value.isFloatable) {
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
          this.context.addLine(line.body);
        } else if (value.type === 'page-break') {
          const block = this.context.acceptLayoutReducer(this.blockReducer);
          if (isPageRoot) {
            yield block;
          } else {
            yield block;
            yield value; // page-break
          }
        } else if (value.type === 'block') {
          this.context.addBlock(value.body);
        } else if (value.type === 'inline-block') {
          this.context.addInlineBlock(value.body);
        } else if (value.type === 'table') {
          this.context.addTable(value.body);
        } else if (value.type === 'table-row-group') {
          this.context.addTableRowGroup(value.body);
        } else if (value.type === 'table-row') {
          this.context.addTableRow(value.body);
        } else if (value.type === 'table-cells') {
          this.context.addTableCells(value.body);
        } else if (value.type === 'inline') {
          this.context.addInline(value.body);
        } else if (value.type === 'list-marker') {
          this.context.addListMarker(value.body);
        } else if (value.type === 'text') {
          this.context.addText(value.body);
        } else if (value.type === 'ruby') {
          this.context.addRuby(value.body);
        } else if (value.type === 're-block') {
          this.context.addBlock(value.body);
        } else if (value.type === 're-inline') {
          this.context.addInlineBlock(value.body);
        } else if (value.type === 'inline-link') {
          this.context.addInlineLink(value.body);
        } else if (value.type === 'block-link') {
          this.context.addBlockLink(value.body);
        }
      } // while(true)
      childElement = childGen.nextElement;
    } // while (childElement !== null)

    if (this.context.inlineNodes.length > 0) {
      const line = this.context.acceptLayoutReducer(this.lineFormatReducer);
      this.context.addLine(line.body);
    }

    while (this.context.restExtent < this.context.contextBoxEdge.getBorderBoxEdgeSize("after")) {
      yield LayoutResult.pageBreak;
    }

    this.context.addBorderBoxEdge("after");
    const marginAfter = this.context.contextBoxEdge.margin.getSize("after");
    if (!this.context.env.float.isNone() && this.context.restExtent >= marginAfter) {
      this.context.addBlockMarginEdge("after", marginAfter);
    }

    yield this.context.acceptLayoutReducer(this.blockReducer);
    if (Config.debugLayout) {
      console.groupEnd();
    }
  }
}

