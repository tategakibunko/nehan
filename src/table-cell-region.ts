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

  protected get parentEdgeAfter(): number {
    let size = 0, parent = this.context.parent;
    while(parent){
      size += parent.edge.after;
      parent = parent.parent;
    }
    return size;
  }

  public get maxContextBoxExtent(): number {
    let max = super.maxContextBoxExtent;
    // If last output of last cell of last row, extent size is subtracted by parent edge.
    // So we must add the edge size to last cell to make all cells same region size.
    if(this.context.parent && this.context.parent.hasNext() === false){
      let plus = this.parentEdgeAfter;
      max += plus;
    }
    return max;
  }

  public get maxContextBoxMeasure(): number {
    return this.cellMeasure;
  }
}
