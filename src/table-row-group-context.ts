import {
  FlowContext,
  LogicalBox,
  BoxType,
} from "./public-api";

export class TableRowGroupContext extends FlowContext {
  public createBlockBox(overflow: boolean, box_type = BoxType.TABLE_ROW_GROUP): LogicalBox {
    return super.createBlockBox(overflow, BoxType.TABLE_ROW_GROUP);
  }
}
