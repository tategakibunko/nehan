import {
  HtmlElement,
  DocumentCallbacks,
  PagedHtmlRenderOptions,
} from "./public-api";

export interface ResourceLoadingContext {
  element: HtmlElement;
  totalItemCount: number;
  successCount: number;
  errorCount: number;
  progress: number;
  percent: number;
}

export class ResourceLoaderCallbacks {
  onProgressImage?: (ctx: ResourceLoadingContext) => void
  onCompleteImage?: (ctx: ResourceLoadingContext) => void
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

  public get progress(): number {
    return this.currentItemCount / this.totalItemCount;
  }

  public get percent(): number {
    return Math.floor(100 * this.progress);
  }

  protected process(element: HtmlElement) {
    if (this.callbacks && this.callbacks.onProgressImage) {
      this.callbacks.onProgressImage({
        element,
        totalItemCount: this.totalItemCount,
        successCount: this.successCount,
        errorCount: this.errorCount,
        progress: this.progress,
        percent: this.percent,
      });
    }
    if (this.isFinish() && this.callbacks && this.callbacks.onCompleteImage) {
      this.callbacks.onCompleteImage({
        element,
        totalItemCount: this.totalItemCount,
        successCount: this.successCount,
        errorCount: this.errorCount,
        progress: this.progress,
        percent: this.percent,
      });
    }
  }

  public fail(element: HtmlElement) {
    this.errorCount++;
    this.process(element);
  }

  public success(element: HtmlElement) {
    this.successCount++;
    this.process(element);
  }

  public isFinish(): boolean {
    return this.currentItemCount >= this.totalItemCount;
  }
}
