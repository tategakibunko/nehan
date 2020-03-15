import {
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

  public addFloat(block: ILogicalPositionalNode, float: LogicalFloat, contextMeasure: number, flowRootBeforePos: number, hostPaddingStart: number) {
    if (float.isNone()) {
      console.error("float direction is not set! ignored.");
      return;
    }
    if (!this.floatRegion) {
      const regionSize = new LogicalSize({ measure: this.maxMeasure, extent: this.maxExtent });
      this.floatRegion = new FloatRegion(regionSize, flowRootBeforePos);
    }
    try {
      const floatSize = new LogicalSize({
        measure: block.size.measure + block.env.edge.measure,
        extent: block.size.extent + block.env.edge.extent
      });
      const rect = float.isStart() ?
        this.floatRegion.pushStart(flowRootBeforePos, floatSize, contextMeasure) :
        this.floatRegion.pushEnd(flowRootBeforePos, floatSize, contextMeasure);
      block.pos = new LogicalCursorPos({
        start: rect.start + block.env.edge.margin.start + hostPaddingStart,
        before: rect.before
      });
      this.floatNodes.push(block);
      console.log("addFloat(size=%o, flowRootBeforePos=%o, rectPos=%o)", floatSize, flowRootBeforePos, block.pos);
      console.log("spaceMeasure at %d = %d", block.pos.before, this.floatRegion.getSpaceMeasureAt(block.pos.before));
    } catch (err) {
      console.error(err);
    }
  }
}