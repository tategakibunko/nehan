import {
  FlowChildGenerators,
  FlowContext,
  FlowGenerator,
  TableCellGenerator,
  TableCellContext,
  LayoutValue,
} from "./public-api";

export class TableRowChildGenerators extends FlowChildGenerators {
  protected cellGenerators: FlowGenerator [];
  protected curGeneratorIndex: number;

  constructor(parent: FlowContext){
    super(parent);
    this.cellGenerators = this.parent.element.querySelectorAll("td")
      .concat(this.parent.element.querySelectorAll("th"))
      .filter(cell => cell.parent === parent.element)
      .map(cell => new TableCellGenerator(new TableCellContext(cell, this.parent)));
    this.lead = this.cellGenerators[0];
    this.active = this.lead;
    this.curGeneratorIndex = 0;
  }

  public getNext(): IteratorResult<LayoutValue []> {
    let active_gen = this.cellGenerators[this.curGeneratorIndex] as TableCellGenerator;
    this.updateActive(active_gen);
    let result: IteratorResult<LayoutValue []>;
    if(active_gen.hasNext()){
      result = active_gen.getNext();
      if(!result.value){
	return {done:true, value:[]};
      }
    } else {
      // already finished, create empty box.
      let box = active_gen.createEmptyCellBox();
      result = {done:false, value:[new LayoutValue(box)]};
    }
    // if active cell is broken by page-break, active cell is already rollbacked.
    // but we have to rollback previous ones, and set iterator(curGeneratorIndex) to zero.
    if(result.value[0] && result.value[0].isPageBreak()){
      for(let i = 0; i < this.curGeneratorIndex - 1; i++){
	if(this.cellGenerators[i].hasNext()){
	  this.cellGenerators[i].rollback();
	}
      }
      this.curGeneratorIndex = 0;
      this.active = this.cellGenerators[0];
      this.lead = this.active;
      return result;
    }
    this.curGeneratorIndex = (this.curGeneratorIndex + 1) % this.cellGenerators.length;
    return result;
  }

  public rollback(){
    this.cellGenerators.forEach(gen => gen.rollback());
    this.curGeneratorIndex = 0;
    this.active = this.cellGenerators[0];
    this.lead = this.active;
  }

  public hasNext(): boolean {
    if(!this.cellGenerators){
      return true;
    }
    return this.cellGenerators.some(gen => gen.hasNext());
  }

  public get cellCount(): number {
    return this.cellGenerators.length;
  }
}
