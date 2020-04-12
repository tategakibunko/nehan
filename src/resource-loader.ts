import {
  HtmlDocument,
  ResourceLoaderContext,
  HtmlElement,
  Image,
  ResourceLoaderCallbacks,
} from "./public-api";

export class ResourceLoader {
  static loadImageAll(document: HtmlDocument, callbacks?: ResourceLoaderCallbacks): Promise<HtmlDocument> {
    const images = document.querySelectorAll("img");
    const videos = document.querySelectorAll("video");
    const imgElements = images.concat(videos);
    const context = new ResourceLoaderContext(imgElements.length, callbacks);
    return Promise.all(imgElements.map(element => {
      switch (element.tagName) {
        case "img": return this.loadImage(element, "src", context);
        case "video": return this.loadImage(element, "poster", context);
      }
    }))
      .then(images => {
        return new Promise((resolve, reject) => {
          resolve(document);
        });
      })
      .catch(reason => {
        return new Promise((resolve, reject) => {
          resolve(document);
        });
      }) as Promise<HtmlDocument>;
  }

  static loadImage(element: HtmlElement, srcAttr: string, context: ResourceLoaderContext): Promise<HtmlElement> {
    const $node = element.$node as HTMLImageElement;
    if ($node.width && $node.height) {
      context.success(element);
      return Promise.resolve(element);
    }
    return Image.load(element, srcAttr, context);
  }
}
