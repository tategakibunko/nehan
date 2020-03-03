import {
  ILogicalCssEvaluator,
  NativeStyleMap,
} from "./public-api"

export class LogicalBaseLineMetrics {
  constructor(
    public extent: number,
    public startOffset: number,
    public blockOffset: number,
  ) { }

  acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    return visitor.visitLineMetrics(this);
  }
}
