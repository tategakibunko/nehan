import {
  FlowRegion,
  HtmlElement,
  TableContext,
  LogicalSize,
  Config,
} from "./public-api";

export class TableRegion extends FlowRegion {
  public cellMeasures: number [];
  public matrix: HtmlElement [][]; // row(= col list) list
  public maxColCount: number;
  protected context: TableContext;

  constructor(context: TableContext){
    super(context);
    this.matrix = this.createMatrix();
    this.maxColCount = this.getMaxColCount();
    this.cellMeasures = this.separateCell();
    if(Config.debugLayout){
      console.log("[%s] table cell measures:", this.context.name, this.cellMeasures);
    }
  }

  public isBadSeparation(): boolean {
    return this.cellMeasures.some(size => size <= 0);
  }

  public createBlockSize(overflow: boolean): LogicalSize {
    return super.createBlockSize(false);
  }

  // TODO: search by 'display:table-row', 'display:table-cell'.
  protected createMatrix(): HtmlElement [][] {
    let rows = this.context.element.querySelectorAll("tr").filter(row => {
      return row.parent === this.context.element || // table > tr
	row.parent && row.parent.parent === this.context.element // table > table-group > tr
    });
    return rows.map(row => {
      return row.querySelectorAll("td")
	.concat(row.querySelectorAll("th"))
	.filter(cell => cell.parent === row);
    });
  }

  protected getMaxColCount(): number {
    return this.matrix.reduce((max, cols) => Math.max(max, cols.length), 0);
  }

  public getCellMeasure(index: number): number {
    return this.cellMeasures[index] || 0;
  }

  protected getFixedCellMeasure(cell: HtmlElement): number {
    return LogicalSize.loadMeasure(cell) || 0;
  }

  public separateCell(): number [] {
    let sizes: number [] = [];
    let mean_size = Math.floor(this.maxContextBoxMeasure / this.maxColCount);
    for(let col = 0; col < this.maxColCount; col++){
      for(let row = 0; row < this.matrix.length; row++){
	let cell = this.matrix[row][col];
	if(!cell){
	  continue;
	}
	if(sizes[col] && sizes[col] !== mean_size){
	  continue; // fixed size is already set.
	}
	let fixed_size = this.getFixedCellMeasure(cell);
	sizes[col] = (fixed_size > 0)? fixed_size : mean_size;
      }
    }
    let mean_cols = sizes.filter(size => size === mean_size);
    if(mean_cols.length === this.maxColCount){
      return sizes;
    }
    let fixed_sizes = sizes.filter(size => size !== mean_size);
    let fixed_total = fixed_sizes.reduce((acm,x) => acm + x, 0);
    let new_mean = Math.floor((this.maxContextBoxMeasure - fixed_total) / mean_cols.length);
    this.cellMeasures = sizes.map(size => size === mean_size? new_mean : size);
    return this.cellMeasures;
  }
}
