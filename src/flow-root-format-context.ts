import {
  Config,
  BoxEnv,
  HtmlElement,
  ILayoutFormatContext,
  LayoutOutline,
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
  public pageCount: number = 0;
  public outline: LayoutOutline;

  constructor(public env: BoxEnv, public parent?: ILayoutFormatContext) {
    super(env, parent);
    this.outline = new LayoutOutline();
  }

  public get flowRoot(): IFlowRootFormatContext {
    return this;
  }

  public openElement(element: HtmlElement) {
    this.outline.openElement(element, this.pageCount);
  }

  public closeElement(element: HtmlElement) {
    this.outline.closeElement(element);
  }

  public clearFloat(clear: LogicalClear): number {
    if (!this.floatRegion) {
      throw new Error("float region is not defined");
    }
    if (clear.isStart()) {
      return this.floatRegion.clearStart();
    }
    if (clear.isEnd()) {
      return this.floatRegion.clearEnd();
    }
    if (clear.isBoth()) {
      return this.floatRegion.clearBoth();
    }
    throw new Error("clear direction is not defined");
  }

  public addFloat(block: ILogicalPositionalNode, float: LogicalFloat, contextMeasure: number, flowRootPos: LogicalCursorPos) {
    if (float.isNone()) {
      console.error("float direction is not set! ignored.");
      return;
    }
    if (!this.floatRegion) {
      const regionSize = new LogicalSize({ measure: this.maxMeasure, extent: this.maxExtent });
      this.floatRegion = new FloatRegion(regionSize, flowRootPos.before);
    }
    try {
      if (Config.debugLayout) {
        console.log("addFloat(%o, %o, ctxM:%d, flowRootPos:%o)", block, float, contextMeasure, flowRootPos);
      }
      const floatSize = new LogicalSize({
        measure: block.size.measure + block.env.edge.measure,
        extent: block.size.extent + block.env.edge.extent
      });
      const rect = float.isStart() ?
        this.floatRegion.pushStart(flowRootPos.before, floatSize, contextMeasure) :
        this.floatRegion.pushEnd(flowRootPos.before, floatSize, contextMeasure);
      const start = float.isStart() ? flowRootPos.start : rect.start + block.env.edge.start;
      block.pos = new LogicalCursorPos({
        start,
        before: rect.before
      });
      this.floatNodes.push(block);
      if (Config.debugLayout) {
        console.log("added float. rect:%o, pos:%o", rect, block.pos);
        console.log("spaceMeasure at %d = %d", block.pos.before, this.floatRegion.getSpaceMeasureAt(block.pos.before));
      }
    } catch (err) {
      console.error(err);
    }
  }
}