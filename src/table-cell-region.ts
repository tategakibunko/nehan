import {
  FlowRootRegion,
  TableRowContext,
  TableContext,
} from "./public-api";

export class TableCellRegion extends FlowRootRegion {
  public get cellMeasure(): number {
    let parent = this.context.parent as TableRowContext | TableContext;
    if(!parent){
      throw new Error("invalid cell, parent is not defined");
    }
    if(!parent.getCellMeasure){
      console.error("invalid cell parent:", this.context.parent);
      throw new Error("invalid cell parent(row or table required)");
    }
    let parent_measure = parent.getCellMeasure(this.context.element.indexOfType);
    return parent_measure - this.contextEdgeMeasure;
  }

  public get maxContextBoxMeasure(): number {
    return this.cellMeasure;
  }
}
