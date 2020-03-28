/*
import {
  FlowContent,
  LogicalBox,
  LogicalSize,
  BoxEnv,
  BoxType,
} from "./public-api";

export class TableRowContent extends FlowContent {
  public inlineCountGte(count: number): boolean {
    return this.inlines.length >= count;
  }

  protected isBlockBreak(): boolean {
    return this.inlines.some(box => (box as LogicalBox).blockBreak);
  }

  protected getMaxCellTotalExtent(): number {
    return this.inlines.reduce((max, cell) => {
      return Math.max(max, (cell as LogicalBox).totalExtent);
    }, 0);
  }

  protected getMaxCellExtent(): number {
    return this.inlines.reduce((max, cell) => {
      return Math.max(max, (cell as LogicalBox).size.extent);
    }, 0);
  }

  protected alignCellExtent(){
    let extent = this.getMaxCellExtent();
    this.inlines.forEach(cell => (cell as LogicalBox).size.extent = extent);
  }

  protected createTableRowBoxSize(overflow: boolean, rest_size: LogicalSize): LogicalSize {
    let max_extent = this.getMaxCellTotalExtent();
    // if empty row, that page-break from cell. so fill the rest extent.
    if(max_extent === 0){
      max_extent = rest_size.extent;
    }
    return new LogicalSize({
      measure:rest_size.measure,
      extent:max_extent
    });
  }

  public createTableRowBox(env: BoxEnv, overflow: boolean, rest_size: LogicalSize): LogicalBox {
    this.alignCellExtent();
    let size = this.createTableRowBoxSize(overflow, rest_size);
    let box = new LogicalBox(env, BoxType.TABLE_ROW, size);
    box.addChildren(this.inlines);
    box.blockBreak = this.isBlockBreak();
    return box;
  }
}
*/