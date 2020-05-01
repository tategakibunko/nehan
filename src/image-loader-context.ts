export class ImageLoaderCallbacks {
  onProgressImage?: (ctx: ImageLoaderContext) => void
  onCompleteImage?: (ctx: ImageLoaderContext) => void
}

export class ImageLoaderContext {
  public totalItemCount: number;
  public successCount: number;
  public errorCount: number;

  constructor(totalCount: number) {
    this.totalItemCount = totalCount;
    this.successCount = 0;
    this.errorCount = 0;
  }

  public get progress(): number {
    return (this.successCount + this.errorCount) / this.totalItemCount;
  }

  public get percent(): number {
    return Math.floor(100 * this.progress);
  }
}
