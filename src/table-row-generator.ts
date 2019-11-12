import {
  FlowGenerator,
  TableRowContext,
  LogicalBox,
  LayoutValue
} from "./public-api";

export class TableRowGenerator extends FlowGenerator {
  protected context!: TableRowContext;

  protected onTableCell(box: LogicalBox): LayoutValue[] {
    if (this.context.shiftTableCell(box)) {
      return this.reduceBlockLayout(true);
    }
    return [];
  }

  protected reduceBlockLayout(overflow: boolean): LayoutValue[] {
    let row = this.context.createTableRowBox(overflow);
    return [new LayoutValue(row)];
  }
}
