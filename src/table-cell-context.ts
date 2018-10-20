import {
  FlowContext,
  FlowRootContext,
  TableRowContext,
  TableCellRegion,
  BoxType,
  LogicalBox,
} from "./public-api";

export class TableCellContext extends FlowRootContext {
  public parent: FlowContext; // not null
  public region: TableCellRegion;

  protected createRegion(): TableCellRegion {
    let region = new TableCellRegion(this);
    if(this.parent instanceof TableRowContext){
      this.env.measure = region.cellMeasure;
    }
    return region;
  }

  public createInlineBlockBox(overflow: boolean, box_type = BoxType.TABLE_CELL): LogicalBox {
    return super.createInlineBlockBox(overflow, BoxType.TABLE_CELL);
  }
}
