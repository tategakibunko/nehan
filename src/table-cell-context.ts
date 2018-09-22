import {
  FlowContext,
  FlowRootContext,
  TableCellRegion,
  BoxType,
  LogicalBox,
} from "./public-api";

export class TableCellContext extends FlowRootContext {
  public parent: FlowContext; // not null
  public region: TableCellRegion;

  protected createRegion(): TableCellRegion {
    return new TableCellRegion(this);
  }

  public createInlineBlockBox(overflow: boolean, box_type = BoxType.TABLE_CELL): LogicalBox {
    return super.createInlineBlockBox(overflow, BoxType.TABLE_CELL);
  }
}
