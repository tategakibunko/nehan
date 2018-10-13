import {
  FlowContext,
  TableContext,
  TableRowRegion,
  TableRowContent,
  TableRowChildGenerators,
  LayoutValue,
  LogicalBox,
  Config,
} from "./public-api";

export class TableRowContext extends FlowContext {
  public parent: FlowContext; // not null
  public region: TableRowRegion;
  public childGens: TableRowChildGenerators;

  // note that all of td styles are already loaded by table-generator.
  protected createChildGenerators(): TableRowChildGenerators {
    return new TableRowChildGenerators(this);
  }

  protected createRegion(): TableRowRegion {
    return new TableRowRegion(this, new TableRowContent());
  }

  public get cellCount(): number {
    return this.childGens.cellCount;
  }

  public isLastRow(): boolean {
    return this.element.isLastElementChild();
  }

  public getNext(): IteratorResult<LayoutValue []> {
    return this.childGens.getNext();
  }

  public hasNext(): boolean {
    if(!this.childGens){
      return true; // before child gens is created.
    }
    return this.childGens.hasNext();
  }

  public rollback(){
    if(Config.debugLayout){
      console.log("[%s] rollback", this.name);
    }
    this.childGens.rollback();
  }

  public shiftTableCell(box: LogicalBox): boolean {
    this.region.addTableCell(box);
    this.counter.incBlockChar(box.charCount);
    this.childGens.commit();
    return this.region.isCellFilled(this.cellCount);
  }

  protected get tableContext(): TableContext {
    let cont: FlowContext | undefined = this.parent;
    while(cont && cont instanceof TableContext === false){
      cont = cont.parent;
    }
    if(!cont){
      throw new Error("table context not found!");
    }
    return cont as TableContext;
  }

  public getCellMeasure(index: number): number {
    return this.tableContext.getCellMeasure(index);
  }

  public createTableRowBox(overflow: boolean): LogicalBox {
    let box = this.region.createTableRowBox(this.env, overflow);
    box.pageIndex = this.bodyPageIndex;
    box.localPageIndex = this.pageIndex;
    box.hasNext = this.hasNext();
    box.charCount = this.counter.blockChar;
    this.region.clearInlines(); // table-cell is stacked to this.inlines.
    this.region.resetInlineCursor();
    this.counter.resetInlineCounter();
    this.childGens.setLeadAsActive(); // restart from first cell.
    if(Config.debugLayout){
      console.log("[%s] createTableRowBox:", this.name, box);
    }
    return box;
  }
}


