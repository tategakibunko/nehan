import {
  FlowRegion,
  TableRowContent,
  LogicalBox,
  LogicalSize,
  LogicalCursorPos,
  BoxEnv,
} from "./public-api";

export class TableRowRegion extends FlowRegion {
  protected content: TableRowContent;

  public isCellFilled(cell_count: number): boolean {
    return this.content.inlineCountGte(cell_count);
  }

  public addTableCell(cell: LogicalBox){
    let delta = cell.totalMeasure;
    cell.blockPos = new LogicalCursorPos({before:0, start:this.cursor.start});
    this.content.addInline(cell);
    this.cursor.start += delta;
  }

  public createTableRowBox(env: BoxEnv, overflow: boolean): LogicalBox {
    let rest_size = new LogicalSize({
      measure:this.maxContextBoxMeasure,
      extent:this.restContextBoxExtent
    });
    let box = this.content.createTableRowBox(env, overflow, rest_size);
    box.contextEdge = this.createBlockEdge();
    return box;
  }
}
