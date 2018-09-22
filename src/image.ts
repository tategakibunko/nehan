import {
  Utils,
  HtmlElement,
  ResourceLoaderContext,
  Config,
} from "./public-api";

export class Image {
  static exists(element: HtmlElement): boolean {
    let width = Utils.atoi(element.getAttribute("width") || "0", 10);
    let height = Utils.atoi(element.getAttribute("height") || "0", 10);
    return width > 0 && height > 0;
  }

  static load(element: HtmlElement, context?: ResourceLoaderContext): Promise<HtmlElement> {
    return new Promise<HtmlElement>((resolve, reject) => {
      let $node = element.$node as HTMLImageElement;
      let image = document.createElement("img") as HTMLImageElement;
      image.src = $node.src;
      image.onload = (evt:Event) => {
	//console.log("image.onload:width=%d, height=%d", image.width, image.height);
	$node.setAttribute("width", String(image.width));
	$node.setAttribute("height", String(image.height));
	if(context){
	  context.success();
	}
	resolve(element);
      };
      image.onerror = (reason: any) => {
	if(Config.debugResourceLoader){
	  console.error(reason);
	}
	if(context){
	  context.fail();
	}
	if(!element.getAttribute("alt")){
	  $node.setAttribute("style", "display:none");
	}
	resolve(element);
      }
    });
  }
}
