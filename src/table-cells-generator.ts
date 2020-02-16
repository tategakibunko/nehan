import {
  ILogicalNodeGenerator,
  ILayoutFormatContext,
  LogicalNodeGenerator,
  LayoutResult,
  HtmlElement,
  BoxEnv,
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

export class TableCellsFormatContext extends FlowFormatContext {
  constructor(
    public env: BoxEnv,
    public cells: HtmlElement[],
    public parent?: ILayoutFormatContext,
  ) {
    super(env, parent);
    this.cells = [];
  }

  addCell(cell: any) {
  }
}

export class TableCellsReducer implements ILayoutReducer {
  static instance = new TableCellsReducer();
  private constructor() { }

  visit(context: TableCellsFormatContext): any {
    throw new Error("todo");
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
    this.context.cells.forEach(cell => {
      const cellGen = LogicalNodeGenerator.createChild(cell, this.context);
      const value = cellGen.getNext();
      if (value) {
        this.context.addCell(value.body);
      }
    });
    yield this.context.acceptLayoutReducer(this.reducer);
  }
}
