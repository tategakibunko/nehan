import {
  DocumentCallbacks
} from "./public-api";

export class ResourceLoaderContext {
  public totalItemCount: number;
  public successCount: number;
  public errorCount: number;
  protected callbacks?: DocumentCallbacks;

  constructor(total_count: number, callbacks?: DocumentCallbacks){
    this.totalItemCount = total_count;
    this.successCount = 0;
    this.errorCount = 0;
    this.callbacks = callbacks || {};
  }

  public get currentItemCount(): number {
    return this.successCount + this.errorCount;
  }

  public get percent(): number {
    return Math.floor(100 * this.currentItemCount / this.totalItemCount);
  }

  protected process(){
    if(this.callbacks && this.callbacks.onProgressImage){
      this.callbacks.onProgressImage(this);
    }
    if(this.isFinish() && this.callbacks && this.callbacks.onCompleteImage){
      this.callbacks.onCompleteImage(this);
    }
  }

  public fail(){
    this.errorCount++;
    this.process();
  }

  public success(){
    this.successCount++;
    this.process();
  }

  public isFinish(): boolean {
    return this.currentItemCount >= this.totalItemCount;
  }
}
