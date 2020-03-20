import {
  DocumentCallbacks,
  PagedHtmlRenderOptions,
} from "./public-api";

export class ResourceLoaderCallbacks {
  onProgressImage?: (ctx: ResourceLoaderContext) => void
  onCompleteImage?: (ctx: ResourceLoaderContext) => void
}

export class ResourceLoaderContext {
  public totalItemCount: number;
  public successCount: number;
  public errorCount: number;
  protected callbacks?: DocumentCallbacks | PagedHtmlRenderOptions;

  constructor(totalCount: number, callbacks?: ResourceLoaderCallbacks) {
    this.totalItemCount = totalCount;
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

  protected process() {
    if (this.callbacks && this.callbacks.onProgressImage) {
      this.callbacks.onProgressImage(this);
    }
    if (this.isFinish() && this.callbacks && this.callbacks.onCompleteImage) {
      this.callbacks.onCompleteImage(this);
    }
  }

  public fail() {
    this.errorCount++;
    this.process();
  }

  public success() {
    this.successCount++;
    this.process();
  }

  public isFinish(): boolean {
    return this.currentItemCount >= this.totalItemCount;
  }
}
