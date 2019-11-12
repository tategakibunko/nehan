import {
  FlowGenerator,
  TableCellContext,
  LogicalBox,
  LayoutControl,
  LayoutValue
} from "./public-api";

export class TableCellGenerator extends FlowGenerator {
  public context!: TableCellContext;

  public createEmptyCellBox(): LogicalBox {
    return this.context.createInlineBlockBox(false);
  }

  // In table layout, next sibling cell must be displayed,
  // so if page-break come from child layout of cell,
  // it's skipped to continue layouting table-row.
  protected onPageBreak(page_break: LayoutControl): LayoutValue[] {
    return [];
  }
}

