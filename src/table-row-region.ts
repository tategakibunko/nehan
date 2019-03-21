import {
  FlowRegion,
  TableRowContext,
  TableRowContent,
  LogicalBox,
  LogicalSize,
  LogicalCursorPos,
  BoxEnv,
} from "./public-api";

export class TableRowRegion extends FlowRegion {
  protected context: TableRowContext;
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

  protected get parentEdgeAfter(): number {
    let size = 0, parent = this.context.parent;
    while(parent){
      if(parent.element.tagName === "body"){
	break;
      }
      size += parent.edge.after;
      if(!parent.parent){
	break;
      }
      parent = parent.parent;
    }
    return size;
  }

  // If last row, force enable parent after edge to make all cells having same rest-extent.
  public get maxContextBoxExtent(): number {
    // [workaround]
    // [https://github.com/Microsoft/TypeScript/issues/338]
    // In es5, public property via super isn't supported.
    // Disable this code after googlebot supports es6.
    let max = <FlowRegion['maxContextBoxExtent']>Reflect.get(FlowRegion.prototype, 'maxContextBoxExtent', this);
    // let max = super.maxContextBoxExtent;
    if(!this.context.isLastRow()){
      return max;
    }
    let minus = this.parentEdgeAfter;
    return max - minus;
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
