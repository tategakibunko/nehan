import {
  FloatRegion,
  LogicalCursorPos,
  LogicalSize,
  LogicalFloat,
  LogicalClear,
  FlowFormatContext,
  IFlowRootFormatContext,
  ILogicalNode,
  ILogicalPositionalNode,
} from './public-api';

export class FlowRootFormatContext extends FlowFormatContext implements IFlowRootFormatContext {
  public floatRegion?: FloatRegion;
  public floatNodes: ILogicalNode[] = [];

  public get flowRoot(): IFlowRootFormatContext {
    return this;
  }

  public clearFloat(clear: LogicalClear) {
    if (!this.floatRegion) {
      return;
    }
    if (clear.isStart()) {
      this.floatRegion.clearStart();
    } else if (clear.isEnd()) {
      this.floatRegion.clearEnd();
    } else if (clear.isBoth()) {
      this.floatRegion.clearBoth();
    }
  }

  public addFloat(block: ILogicalPositionalNode, float: LogicalFloat, contextMeasure: number) {
    if (float.isNone()) {
      console.error("float direction is not set! ignored.");
      return;
    }
    if (!this.floatRegion) {
      const regionSize = new LogicalSize({ measure: this.maxMeasure, extent: this.maxExtent });
      this.floatRegion = new FloatRegion(regionSize, this.cursorPos.before);
    }
    try {
      const floatSize = new LogicalSize({
        measure: block.size.measure + block.env.edge.measure,
        extent: block.size.extent + block.env.edge.extent
      });
      const rect = float.isStart() ?
        this.floatRegion.pushStart(this.cursorPos.before, floatSize, contextMeasure) :
        this.floatRegion.pushEnd(this.cursorPos.before, floatSize, contextMeasure);
      block.pos = new LogicalCursorPos({
        start: rect.start + block.env.edge.margin.start,
        before: rect.before
      });
      this.floatNodes.push(block);
      console.log("addFloat(size=%o, pos=%o)", floatSize, block.pos);
      console.log("spaceMeasure at %d = %d", block.pos.before, this.floatRegion.getSpaceMeasureAt(block.pos.before));
    } catch (err) {
      console.error(err);
    }
  }
}