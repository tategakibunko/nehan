/*
import {
  BoxEnv,
  BoxType,
  FlowRegion,
  LogicalSize,
  LogicalBox
} from "./public-api";

export class HrRegion extends FlowRegion {
  protected createHrSize(env: BoxEnv): LogicalSize {
    let border_width = env.edge.border.width;
    return new LogicalSize({
      measure:this.maxContextBoxMeasure,
      extent:border_width.extent
    });
  }

  public createHrBox(env: BoxEnv): LogicalBox {
    let size = this.createHrSize(env);
    let box = new LogicalBox(env, BoxType.BLOCK, size);
    box.contextEdge = env.edge;
    return box;
  }
}
*/