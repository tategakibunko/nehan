import {
  Config
} from "./public-api";

export class LayoutCounter {
  public page: number;
  public yield: number;
  public rollback: number;
  public line: number;
  public inlineChar: number;
  public blockChar: number;
  public emptyBox: number;

  constructor(){
    this.yield = 0;
    this.rollback = 0;
    this.page = 0;
    this.inlineChar = 0;
    this.blockChar = 0;
    this.line = 0;
    this.emptyBox = 0;
  }

  public isTooManyPages(): boolean {
    return this.page >= Config.maxPageCount;
  }

  public isError(): boolean {
    if(this.rollback >= Config.maxFlowRollbackCount){
      console.error("too many rollback");
      return true;
    }
    if(this.emptyBox >= Config.maxEmptyBoxCount){
      console.error("too many empty box");
      return true;
    }
    return false;
  }

  public get pageIndex(): number {
    return this.page;
  }

  public isNotYielded(){
    return this.yield === 0;
  }

  public isYielded(){
    return this.yield > 0;
  }

  public isLineYielded(){
    return this.line > 0;
  }

  public isFirstLine(){
    return this.yield === 0 && this.line === 0;
  }

  public incRollback(){
    this.rollback++;
  }

  public resetRollback(){
    this.rollback = 0;
  }

  public incYield(){
    this.yield++;
  }

  public decYield(){
    this.yield = Math.max(0, this.yield - 1);
  }

  public resetYield(){
    this.yield = 0;
  }

  public incPage(){
    this.page++;
  }

  public incInlineChar(count: number){
    this.inlineChar += count;
  }

  public incBlockChar(count: number){
    this.blockChar += count;
  }

  public incEmptyBox(){
    this.emptyBox++;
  }

  public incLine(){
    this.line++;
  }

  public resetInlineCounter(){
    this.inlineChar = 0;
  }

  public resetBlockCounter(){
    this.inlineChar = 0;
    this.blockChar = 0;
    this.line = 0;
  }
}
