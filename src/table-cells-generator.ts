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

/*
export class TableCellsGenerator implements ILogicalNodeGenerator {
  private generator: Generator<LayoutResult>;

  constructor(
    public context: TableCellsFormatContext
  ) {
    this.generator = this.createGenerator();
  }
  getNext(): LayoutResult | undefined {
    throw new Error("todo");
  }

  *createGenerator(): Generator<LayoutResult> {
  }
}
*/
