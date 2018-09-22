import {
  ReplacedElementContext,
  LogicalSize,
  LogicalBox,
  Config
} from "./public-api";

export class ImageContext extends ReplacedElementContext {
  public createReplacedElementBox(size: LogicalSize): LogicalBox {
    let box = new LogicalBox(this.env, this.env.boxType, size);

    // Replaced element can't be splited, so edge value is not contextual but constant.
    box.contextEdge = this.env.edge;
    box.pageIndex = this.parent.bodyPageIndex;
    box.localPageIndex = 0; // always zero.
    box.autoSize = size;
    if(Config.debugLayout){
      console.log("[%s] createReplacedElementBox:", this.name, box);
    }
    return box;
  }
}
