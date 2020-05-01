import {
  ResourceLoaderContext,
  HtmlElement,
  Config,
  ResourceLoaderCallbacks,
} from "./public-api";

export class ResourceLoader {
  constructor(private imageElements: HtmlElement[], private context: ResourceLoaderContext) { }

  public async loadImages(callbacks: ResourceLoaderCallbacks): Promise<boolean> {
    try {
      const images = await Promise.all(this.imageElements.map(element => {
        const $node = (element.$node as HTMLImageElement);
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
      if (Config.debugResourceLoader) {
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
  private loadImage(element: HtmlElement, srcAttr: string, callbacks: ResourceLoaderCallbacks): Promise<HtmlElement> {
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
        if (Config.debugResourceLoader) {
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

        if (Config.debugResourceLoader) {
          console.info("%s is successfully loaded(%dx%d)", image.src, image.width, image.height);
        }
        this.context.successCount++;
        if (callbacks.onProgressImage) {
          callbacks.onProgressImage(this.context);
        }
        resolve(element);
      };
      image.onerror = (reason: any) => {
        if (Config.debugResourceLoader) {
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
