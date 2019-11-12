import {
  LayoutGenerator,
  FlowContext,
  LayoutControl,
  LayoutValue,
  BoxType,
  Config,
  LogicalBox,
  Ruby
} from "./public-api";

export class FlowGenerator extends LayoutGenerator {
  protected context!: FlowContext;

  public updateStyle() {
    this.context.updateStyle();
  }

  public updateLead() {
    this.context.updateLead();
  }

  protected onValue(value: LayoutValue): LayoutValue[] {
    if (value.isRuby()) {
      return this.onRuby(value.getAsRuby());
    }
    if (value.isControl()) {
      return this.onControl(value.getAsControl());
    }
    if (value.isBox()) {
      return this.onBox(value.getAsBox());
    }
    return [];
  }

  protected onControl(control: LayoutControl): LayoutValue[] {
    let yields: LayoutValue[] = [];
    this.context.shiftControl(control);
    if (control.isLineBreak()) {
      yields = this.onLineBreak(control);
    } else if (control.isPageBreak()) {
      yields = this.onPageBreak(control);
    } else if (control.isInlineSplit()) {
      yields = this.onInlineSplit(control);
    } else if (control.isSkip()) {
      yields = this.onSkip(control);
    }
    return yields;
  }

  protected onBox(box: LogicalBox): LayoutValue[] {
    switch (box.boxType) {
      case BoxType.TEXT:
      case BoxType.INLINE:
        return this.onInline(box);
      case BoxType.LINE:
        return this.onLine(box);
      case BoxType.BLOCK:
      case BoxType.LIST_ITEM:
        return this.onBlock(box);
      case BoxType.INLINE_BLOCK:
        return this.onInlineBlock(box);
      case BoxType.TABLE:
        return this.onBlock(box);
      case BoxType.TABLE_ROW_GROUP:
        return this.onTableRowGroup(box);
      case BoxType.TABLE_ROW:
        return this.onTableRow(box);
      case BoxType.TABLE_CELL:
        return this.onTableCell(box);
    }
    return [];
  }

  protected onLineBreak(line_break: LayoutControl): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onLineBreak:", this.context.name, line_break);
    }
    if (this.context.isInlineFlow()) {
      let layout = this.reduceInlineLayout(false);
      return layout.filter(val => !val.isLineBreak()).concat(new LayoutValue(line_break));
    }
    if (this.context.isInlineEmpty() === false) {
      let line = this.context.createLineBox();
      return this.onLine(line);
    }
    return this.onLine(this.context.createEmptyLineBox());
  }

  protected onPageBreak(page_break: LayoutControl): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onPageBreak:", this.context.name, page_break);
    }
    let layout = this.reduceLayout(true).filter(val => val.isPageBreak() === false);
    if (this.context.isBody()) {
      return layout;
    }
    // [layout, page-break]
    return layout.concat(new LayoutValue(page_break));
  }

  protected onInlineSplit(inline_split: LayoutControl): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onInlineSplit:", this.context.name, inline_split);
    }
    let yields: LayoutValue[] = this.reduceInlineLayout(false);
    let line_break = LayoutControl.createLineBreak();
    return yields.concat(new LayoutValue(line_break));
  }

  protected onSkip(skip: LayoutControl): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onSkip:", this.context.name, skip);
    }
    return [];
  }

  protected onInline(box: LogicalBox): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onInline[%s]:", this.context.name, box.text, box);
    }
    if (this.context.shiftInlineLevel(box)) {
      if (this.context.isEmpty()) {
        return this.onEmptyInlineLayout(box.totalMeasure);
      }
      if (this.context.isInlineFlow()) {
        return this.reduceLayout(true);
      }
      let line = this.context.createLineBox();
      return this.onLine(line);
    }
    return [];
  }

  protected onInlineBlock(box: LogicalBox): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onInlineBlock:", this.context.name, box);
    }
    if (this.context.shiftInlineLevel(box)) {
      if (this.context.isEmpty()) {
        return this.onEmptyInlineLayout(box.totalMeasure);
      }
      if (this.context.isInlineFlow()) {
        return this.reduceLayout(true);
      }
      let line = this.context.createLineBox();
      return this.onLine(line);
    }
    return [];
  }

  protected onTableRowGroup(box: LogicalBox): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onTableRowGroup:", this.context.name, box);
    }
    return this.onBlock(box);
  }

  protected onTableRow(box: LogicalBox): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onTableRow:", this.context.name, box);
    }
    return this.onBlock(box);
  }

  protected onTableCell(box: LogicalBox): LayoutValue[] {
    if (Config.debugLayout) {
      console.error("[%s] unexpected table-cell, skip it.", this.context.name);
    }
    return []; // skip if it's not from TableRowGenerator.
  }

  protected onLine(box: LogicalBox): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onLine[%s]:", this.context.name, box.text, box);
    }
    if (this.context.isFloatClient()) {
      return this.onBlockFloatSpace(box);
    }
    if (this.context.shiftBlockLevel(box)) {
      return this.reduceLayout(true);
    }
    return [];
  }

  protected onBlock(box: LogicalBox): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onBlock[%s]:", this.context.name, box.text, box);
    }
    let yields: LayoutValue[] = [];
    // abs-box never cause flow over.
    if (box.isPositionAbsolute()) {
      this.context.shiftAbsBlock(box);
      return [];
    }
    if (this.context.isInlineEmpty() === false) {
      let line = this.context.createLineBox();
      yields = yields.concat(this.onLine(line));
    }
    if (box.isFloat()) {
      return yields.concat(this.onBlockFloat(box));
    }
    if (this.context.isFloatClient()) {
      return yields.concat(this.onBlockFloatSpace(box));
    }
    if (this.context.shiftBlockLevel(box)) {
      return yields.concat(this.reduceLayout(true));
    }
    return yields;
  }

  protected onBlockFloatSpace(box: LogicalBox): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onBlockFloatSpace:", this.context.name, box);
    }
    if (this.context.shiftFloatSpaceBlock(box)) {
      return this.reduceLayout(true);
    }
    return [];
  }

  // block -> float region update
  protected onBlockFloat(box: LogicalBox): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onBlockFloat:%o, float:%o", this.context.name, box, box.float);
    }
    if (this.context.shiftFloatBlock(box)) {
      return this.reduceLayout(true);
    }
    return [];
  }

  protected onRuby(ruby: Ruby): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] onRuby:", this.context.name, ruby);
    }
    if (this.context.shiftInlineLevel(ruby)) {
      if (this.context.isEmpty()) {
        return this.onEmptyInlineLayout(ruby.totalMeasure);
      }
      if (this.context.isInlineFlow()) {
        return this.reduceLayout(true);
      }
      let line = this.context.createLineBox();
      return this.onLine(line);
    }
    return [];
  }

  protected onEmptyInlineLayout(min_size: number): LayoutValue[] {
    let control = this.context.createEmptyInlineControl(true, min_size); // skip or line-break
    return [new LayoutValue(control)];
  }

  protected reduceLayout(overflow: boolean): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] reduceLayout(overflow=%o)", this.context.name, overflow);
    }
    if (this.context.isFinalOutput()) {
      this.context.closeElement();
    }
    if (this.context.isInlineFlow()) {
      return this.reduceInlineLayout(overflow);
    }
    return this.reduceBlockLayout(overflow);
  }

  protected reduceInlineLayout(overflow: boolean): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] reduceInlineLayout(overflow=%o)", this.context.name, overflow);
    }

    let yields: LayoutValue[] = [];

    // sweep remaining block level.
    // for example, if <a>text1<div>..</div>text2</a>,
    // text1 is swept out by div before reduceInlineLayout,
    // and div is swept out first in reduceInlineLayout,
    // and text2 is yielded second in reduceInlineLayout.
    if (this.context.isBlockEmpty() === false) {
      let block = this.context.createBlockBox(false);
      if (Config.debugLayout) {
        console.log("[%s] reduceInlineLayout -> sweep blocks:", this.context.name, block);
      }
      yields.push(new LayoutValue(block));
    }
    // sweep inline level next.
    let inline_box = this.context.createInlineBox(overflow);
    if (Config.debugLayout) {
      console.log("[%s] reduceInlineLayout:", this.context.name, inline_box.text);
    }
    yields.push(new LayoutValue(inline_box));
    return yields;
  }

  protected reduceBlockLayout(overflow: boolean): LayoutValue[] {
    if (Config.debugLayout) {
      console.log("[%s] reduceBlockLayout(overflow=%o)", this.context.name, overflow);
    }

    // if nothing included in this layout, yield page-break to parent layer.
    if (this.context.isEmpty()) {
      if (Config.debugLayout) {
        console.log("[%s] empty block layout -> page-break", this.context.name);
      }
      let page_break = LayoutControl.createPageBreak();
      return [new LayoutValue(page_break)];
    }

    let yields: LayoutValue[] = [];

    // reduce rest inlines to line and push as block.
    if (this.context.isInlineEmpty() === false) {
      let line = this.context.createLineBox();
      if (Config.debugLayout) {
        console.log("[%s] reduceBlockLayout: sweep rest line[%s]", this.context.name, line.text);
      }
      yields = this.onLine(line);
    }
    if (this.context.isBlockEmpty()) {
      return yields;
    }

    // Box has blocks inside but outside flow is inline and not floating = inline-block
    if (!this.context.isBlockLevel() && !this.context.isFloat()) {
      let inline_block_box = this.context.createInlineBlockBox(overflow);
      yields.push(new LayoutValue(inline_block_box));
      return yields;
    }
    // enclose block levels by current context element.
    let block_box = this.context.createBlockBox(overflow);
    yields.push(new LayoutValue(block_box));
    return yields;
  }

  protected onYields(values: LayoutValue[]): LayoutValue[] {
    return values;
  }

  protected * createIterator(): IterableIterator<LayoutValue[]> {
    if (Config.debugLayout) {
      console.log("[%s] start", this.context.name);
    }
    this.context.openElement();

    let loop = 0;
    while (this.context.hasNext()) {
      let next = this.context.getNext();
      if (Config.maxFlowLoopCount > 0 && loop++ >= Config.maxFlowLoopCount) {
        console.warn("[%s] too many loop, break.", this.context.name);
        break;
      }
      if (next.done || !next.value) {
        console.warn("[%s] done(%o, value:%o)", this.context.name, next.done, next.value);
        break;
      }
      let yields = next.value.reduce((acm, value) => {
        return acm.concat(this.onValue(value));
      }, [] as LayoutValue[]);
      yields = this.onYields(yields);
      if (yields.length > 0) {
        yield yields;
      }
      // If no more data, try to close.
      // Because if rollback is occured in 'reduceLayout',
      // this.context.hasNext will return true again!!
      if (!this.context.hasNext()) {
        let yields = this.reduceLayout(false);
        if (yields.length > 0) {
          yield yields;
        }
      }
    }
    if (Config.debugLayout) {
      console.log("[%s] end", this.context.name);
    }
  }
}

