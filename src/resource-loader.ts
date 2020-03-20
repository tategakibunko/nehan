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
    const context = new ResourceLoaderContext(images.length, callbacks);
    return Promise.all(images.map(image => this.loadImage(image, context)))
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

  static loadImage(element: HtmlElement, context: ResourceLoaderContext): Promise<HtmlElement> {
    const $node = element.$node as HTMLImageElement;
    if ($node.width && $node.height) {
      context.success(element);
      return Promise.resolve(element);
    }
    return Image.load(element, context);
  }
}
