import {
  ILogicalNodeGenerator,
  ILayoutFormatContext,
  LogicalSize,
  LogicalBlockNode,
  LogicalTableCellsNode,
  LayoutResult,
  HtmlElement,
  BoxEnv,
  BlockNodeGenerator,
  FlowRootFormatContext,
  ILayoutReducer,
  FlowFormatContext,
  RootBlockReducer,
  LogicalCursorPos,
} from './public-api';

export class TableCellsFormatContext extends FlowFormatContext {
  public cells: LogicalBlockNode[];

  constructor(
    public elements: HtmlElement[],
    public env: BoxEnv,
    public parent?: ILayoutFormatContext,
  ) {
    super(env, parent);
    this.cells = [];
  }

  acceptLayoutReducer(reducer: TableCellsReducer, isFirstRow: boolean, isLastRow: boolean): LayoutResult {
    return reducer.visit(this, isFirstRow, isLastRow);
  }

  setCells(cells: LogicalBlockNode[]) {
    const isCollapse = this.env.borderCollapse.isCollapse();
    this.cells = cells;
    const maxContentExtent = Math.max(...cells.map(cell => cell.size.extent));
    const maxTotalExtent = Math.max(...cells.map(cell => cell.extent));
    this.cells.forEach((cell, index) => {
      cell.size.extent = maxContentExtent;
      cell.size.extent += maxTotalExtent - cell.extent;
      cell.pos.start = this.cursorPos.start;
      this.cursorPos.start += cell.measure;
      // Collapse border of inline level.
      // Note that block level collapsing is done by reducer.
      if (isCollapse) {
        const prevBorderSize = (index === 0) ? this.env.edge.border.width.start : this.cells[index - 1].border.width.end;
        const inlineCollapseSize = Math.min(prevBorderSize, cell.border.width.start);
        // console.log("inline collapse size:%d", inlineCollapseSize);
        cell.pos.start -= inlineCollapseSize;
        this.cursorPos.start -= inlineCollapseSize;
      }
    });
  }
}

export class TableCellsReducer implements ILayoutReducer {
  static instance = new TableCellsReducer();
  private constructor() { }

  visit(context: TableCellsFormatContext, isFirstRow: boolean, isLastRow: boolean): any {
    // const measure = context.parent ? context.parent.maxMeasure : context.paddingBoxSize.measure;
    const measure = 0;
    const extent = Math.max(...context.cells.map(cell => cell.extent));
    const size = new LogicalSize({ measure, extent });
    const pos = LogicalCursorPos.zero;
    const text = context.cells.reduce((acm, cell) => acm + cell.text, "");
    const block = new LogicalTableCellsNode(size, pos, text, context.cells, isFirstRow, isLastRow);
    return LayoutResult.logicalNode("table-cells", block);
  }
}

export class TableCellsGenerator implements ILogicalNodeGenerator {
  private generator: Generator<LayoutResult>;

  constructor(
    public context: TableCellsFormatContext,
    public reducer = TableCellsReducer.instance,
  ) {
    this.generator = this.createGenerator();
  }

  getNext(): LayoutResult | undefined {
    const next = this.generator.next();
    return next.done ? undefined : next.value;
  }

  *createGenerator(): Generator<LayoutResult> {
    const cellGenerators = this.context.elements.map(cellElement => {
      const env = new BoxEnv(cellElement);
      const context = new FlowRootFormatContext(env, this.context);
      return new BlockNodeGenerator(context);
    });
    let loopCount = 0;
    while (true) {
      const values = cellGenerators.map(cellGen => cellGen.getNext());
      if (values.every(value => value === undefined)) {
        break;
      }
      if (loopCount % 2 === 0) {
        const cellBlocks = values.map((value, index) => {
          if (value && value.type === "block") {
            return value.body;
          }
          return cellGenerators[index].context.acceptLayoutReducer(RootBlockReducer.instance).body;
        });
        this.context.setCells(cellBlocks);
      } else {
        yield this.context.acceptLayoutReducer(this.reducer, loopCount === 1, false);
        yield LayoutResult.pageBreak;
      }
      loopCount++;
    } // for(loopCount)
    yield this.context.acceptLayoutReducer(this.reducer, loopCount === 1, true);
  }
}
