import {
  HtmlElement,
  ResourceLoaderContext,
  Config,
} from "./public-api";

export class Image {
  // 1. load image data from [srcAttr].
  // 2. get image width/height.
  // 3. set width/height to attribute.
  static load(element: HtmlElement, srcAttr: string, context?: ResourceLoaderContext): Promise<HtmlElement> {
    return new Promise<HtmlElement>((resolve, reject) => {
      const $node = element.$node as HTMLElement;
      const image = document.createElement("img") as HTMLImageElement;
      image.setAttribute("src", $node.getAttribute(srcAttr) || "");
      image.onload = (evt: Event) => {
        // console.log("image.onload:width=%d, height=%d", image.width, image.height);
        $node.setAttribute("width", String(image.width));
        $node.setAttribute("height", String(image.height));
        if (context) {
          if (Config.debugResourceLoader) {
            console.info("%s is successfully loaded(%dx%d)", image.src, image.width, image.height);
          }
          context.success(element);
        }
        resolve(element);
      };
      image.onerror = (reason: any) => {
        if (Config.debugResourceLoader) {
          console.error(reason);
        }
        if (context) {
          context.fail(element);
        }
        if (!element.getAttribute("alt")) {
          $node.setAttribute("style", "display:none");
        }
        resolve(element);
      }
    });
  }
}
