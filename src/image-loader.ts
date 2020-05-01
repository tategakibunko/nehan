import {
  Config,
  HtmlElement,
} from "./public-api";

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

export class ImageLoader {
  constructor(private imageElements: HtmlElement[], private context: ImageLoaderContext) { }

  public async load(callbacks: ImageLoaderCallbacks): Promise<boolean> {
    try {
      const images = await Promise.all(this.imageElements.map(element => {
        const $node = element.$node as HTMLImageElement;
        if ($node.width && $node.height) {
          this.context.successCount++;
          if (callbacks.onProgressImage) {
            callbacks.onProgressImage(this.context);
          }
          return Promise.resolve(element);
        }
        const imageAttr = this.getImageAttr(element.tagName);
        return this.loadImage(element, imageAttr, callbacks);
      }));
      if (callbacks.onCompleteImage) {
        callbacks.onCompleteImage(this.context);
      }
      return true;
    }
    catch (reason) {
      if (Config.debugImageLoader) {
        console.error(reason);
      }
      return false;
    }
  }

  private getImageAttr(tagName: string): string {
    switch (tagName) {
      case "video": return "poster";
      default: return "src";
    }
  }

  // 1. load image data from [srcAttr].
  // 2. get image width/height.
  // 3. set width/height to attribute.
  private loadImage(element: HtmlElement, srcAttr: string, callbacks: ImageLoaderCallbacks): Promise<HtmlElement> {
    return new Promise<HtmlElement>((resolve, reject) => {
      const $node = element.$node as HTMLElement;
      const image = document.createElement("img") as HTMLImageElement;
      const src = $node.getAttribute(srcAttr);
      if (src) {
        image.setAttribute("src", src);
      }
      const dataSrc = $node.getAttribute("data-src");
      if (dataSrc) {
        image.setAttribute("data-src", dataSrc);
      }
      if (!src && !dataSrc) {
        if (Config.debugImageLoader) {
          console.error("Invalid resource. Both src and data-src are not defined:", element);
        }
        this.context.errorCount++;
        if (callbacks.onProgressImage) {
          callbacks.onProgressImage(this.context);
        }
        resolve(element);
        return;
      }
      image.onload = (evt: Event) => {
        // console.log("image.onload:width=%d, height=%d", image.width, image.height);
        $node.setAttribute("width", String(image.width));
        $node.setAttribute("height", String(image.height));

        if (Config.debugImageLoader) {
          console.info("%s is successfully loaded(%dx%d)", image.src, image.width, image.height);
        }
        this.context.successCount++;
        if (callbacks.onProgressImage) {
          callbacks.onProgressImage(this.context);
        }
        resolve(element);
      };
      image.onerror = (reason: any) => {
        if (Config.debugImageLoader) {
          console.error(reason);
        }
        this.context.errorCount++;
        if (callbacks.onProgressImage) {
          callbacks.onProgressImage(this.context);
        }
        if (!element.getAttribute("alt")) {
          $node.setAttribute("style", "display:none");
        }
        resolve(element);
      }
    });
  }
}
