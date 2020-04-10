import {
  Config,
  ILogicalNodeGenerator,
  LogicalNodeGenerator,
  LayoutResult,
  HtmlElement,
  Display,
  LogicalClear,
  LogicalFloat,
  LogicalBlockNode,
  InlineMargin,
  BlockMargin,
  ILayoutReducer,
  FlowFormatContext,
  PageRootFormatContext,
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
      console.group(`block: ${this.context.name}`);
    }
    this.context.flowRoot.openElement(this.context.env.element);

    const progressDelta = 1 / this.context.env.element.childNodes.length;
    const isPageRoot = this.context instanceof PageRootFormatContext;
    let prevChildGen: ILogicalNodeGenerator | undefined = undefined;

    if (this.context.env.pageBreakBefore.isAlways()) {
      yield LayoutResult.pageBreak(this.context, "block-fmt-context: page-break-before");
    }
    if (this.context.env.measure && this.context.env.measure <= 0) {
      yield LayoutResult.skip(this.context, "Minus size measure");
      return;
    }
    if (!isPageRoot && this.context.restExtent < this.context.env.edge.borderBoxBefore) {
      // console.info("[%s] before border can't be included", this.context.name);
      yield LayoutResult.pageBreak(this.context, "block-fmt-context: before border can't be included");
    }
    this.context.addBorderBoxEdge("before"); // restExtent shorten
    // Add inline edge, but note that maxMeasure doesn't change
    // because content size of block element is already calculated in css loading.
    this.context.addBorderBoxEdge("start");
    this.context.addBorderBoxEdge("end");
    let childElement: HtmlElement | null = this.context.env.element.firstChild;
    while (childElement !== null) {
      const display = Display.load(childElement);
      const whiteSpace = WhiteSpace.load(childElement);
      if (display.isNone() || (!whiteSpace.isPre() && WhiteSpace.isWhiteSpaceElement(childElement))) {
        // console.log("skip element:", childElement);
        childElement = childElement.nextSibling;
        continue;
      }
      const float = LogicalFloat.load(childElement);

      // before switching to next block, check there is inlines that are not still wrapped by anon-line-box.
      if ((!float.isNone() || display.isBlockLevel()) && this.context.inlineNodes.length > 0) {
        // console.info("sweep out remaining inlines as line");
        const line = this.context.acceptLayoutReducer(this.lineFormatReducer);
        this.context.addLine(line.body); // never overflows!
      }
      this.context.curChildStartMargin = InlineMargin.getMarginFromParentBlock(childElement);
      const childGen = LogicalNodeGenerator.createChild(childElement, this.context);
      this.context.child = childGen.generator;

      // If cur child has some clear value, add some clearance before yielding it's content.
      const clear = LogicalClear.load(childElement);
      if (!clear.isNone() && this.context.flowRoot.floatRegion) {
        const clearedExtent = this.context.flowRoot.clearFloat(clear);
        if (Config.debugLayout) {
          console.log("float clearance:%d (cur before = %d)", clearedExtent, this.context.cursorPos.before);
        }
        // [TODO] floatRootPos.before -> localPos.before
        this.context.cursorPos.before = Math.max(this.context.cursorPos.before, clearedExtent);
      }
      // If cur child has some margin between latest flow block, add it before yielding it's content.
      const beforeMargin = BlockMargin.getFlowMarginFromLastElement(this.context.env, this.context.child, prevChildGen);
      if (this.context.restExtent < beforeMargin) {
        yield this.context.acceptLayoutReducer(this.blockReducer);
        if (!isPageRoot) {
          yield LayoutResult.pageBreak(this.context, `block-fmt-context: before-margin(${beforeMargin}) overflow.`);
        }
      }
      if (beforeMargin > 0) {
        this.context.addBlockMarginEdge("before", beforeMargin);
        // console.log(`[${this.context.name}] margin(${beforeMargin}px) is added before ${childElement.tagName}`);
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
            this.context.setFloat(fvalue.body, float);
          }
          return true;
        });
        const value = this.context.child.getNext();
        if (!value) {
          break;
        }
        if (!float.isNone() && value.isFloatable()) {
          this.context.setFloat(value.body, float);
          this.context.suspendedGens.push(this.context.child);
          break;
        }
        if (value.type === 'skip') {
          console.warn(`${childElement.tagName} is skipped.`);
          break;
        }
        if (value.type === 'line-break') {
          const isBr = value.body.env.element.tagName === "br";
          const line = this.context.acceptLayoutReducer(this.lineFormatReducer, isBr);
          this.context.addLine(line.body);
        } else if (value.type === 'page-break') {
          // sweep out rest inline
          if (this.context.inlineNodes.length > 0) {
            const line = this.context.acceptLayoutReducer(this.lineFormatReducer, false);
            this.context.addLine(line.body);
          }
          const block = this.context.acceptLayoutReducer(this.blockReducer);
          if (isPageRoot) {
            // Ignore empty text page block.
            // This could often happen following pattern.
            //
            // [some-large-img][br][br][some-large-img2]
            //
            // which is parsed like following.
            //
            // [some-large-img1]
            // [br]
            // [page-break]     <-- page-break-after(restExtent is not left by large extent of line containing some-large-img1)
            // [br]             <-- empty-line generated by [br](at the head of page).
            // [page-break]     <-- page-break-before(extent of some-large-img2 is too large for restExtent)
            // [some-large-img2]
            //
            // In this pattern, empty-line is generated by [br] before [some-large-img2]
            // and [page-break] is also generated before [some-large-img2].
            // As a result, a page containing only a single line will be created.
            if (block.body.text.trim() !== "") {
              yield block;
            }
          } else {
            yield block;
            yield value; // propagate 'page-break' until page-root.
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
          this.context.addBlockRe(value.body);
        } else if (value.type === 're-inline') {
          this.context.addInlineRe(value.body);
        } else if (value.type === 'inline-link') {
          this.context.addInlineLink(value.body);
        } else if (value.type === 'block-link') {
          this.context.addBlockLink(value.body);
        }
      } // while(true)
      this.context.progress = (childElement.index + 1) * progressDelta; // force update progress
      // console.log("[%s] force update progress: %f", this.context.name, this.context.progress);
      prevChildGen = childGen.generator;
      childElement = childGen.nextElement;
    } // while (childElement !== null)

    if (this.context.inlineNodes.length > 0) {
      const line = this.context.acceptLayoutReducer(this.lineFormatReducer, false);
      this.context.addLine(line.body);
    }

    // while (!isPageRoot && this.context.restExtent < this.context.contextBoxEdge.getBorderBoxEdgeSize("after")) {
    if (!isPageRoot && this.context.restExtent < this.context.contextBoxEdge.getBorderBoxEdgeSize("after")) {
      yield LayoutResult.pageBreak(this.context, "block-fmt-context: after border can't be included");
    }

    this.context.addBorderBoxEdge("after");
    const marginAfter = this.context.contextBoxEdge.margin.getSize("after");
    if (!this.context.env.float.isNone() && this.context.restExtent >= marginAfter) {
      this.context.addBlockMarginEdge("after", marginAfter);
    }

    this.context.flowRoot.closeElement(this.context.env.element);
    yield this.context.acceptLayoutReducer(this.blockReducer);
    if (!isPageRoot && this.context.env.pageBreakAfter.isAlways()) {
      yield LayoutResult.pageBreak(this.context, "block-fmt-context: page-break-after");
    }
    if (Config.debugLayout) {
      console.groupEnd();
    }
  }
}

