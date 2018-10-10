import {
  FlowRootRegion,
  FlowContext,
  TableRowContext,
  TableContext,
} from "./public-api";

export class TableCellRegion extends FlowRootRegion {
  public cellIndex: number;
  public cellMeasure: number;

  constructor(context: FlowContext){
    super(context);
    this.cellIndex = this.context.element.indexOfType;
    this.cellMeasure = this.getCellMeasure(this.cellIndex);
    if(this.context.parent instanceof TableRowContext){
      this.context.env.measure = this.cellMeasure;
    }
  }

  protected getCellMeasure(index: number): number {
    let parent = this.context.parent as TableRowContext | TableContext;
    if(!parent){
      throw new Error("invalid cell, parent is not defined");
    }
    if(!parent.getCellMeasure){
      console.error("invalid cell parent:", this.context.parent);
      throw new Error("invalid cell parent(row or table required)");
    }
    let size = parent.getCellMeasure(index);
    return size - this.contextEdgeMeasure;
  }

  public get maxContextBoxMeasure(): number {
    return this.cellMeasure;
  }
}
