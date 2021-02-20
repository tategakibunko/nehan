import {
  Config,
  WritingMode,
  BoxEnv,
  Anchor,
  LayoutSection,
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
  ILayoutOutlineEvaluator,
  ILogicalNodeEvaluator,
  HoriLogicalNodeEvaluator,
  VertLogicalNodeEvaluator,
  HoriCssEvaluator,
  VertCssEvaluator,
  LogicalTextJustifier,
} from './public-api';

export class FlowRootFormatContext extends FlowFormatContext implements IFlowRootFormatContext {
  public floatRegion?: FloatRegion;
  public floatNodes: ILogicalNode[] = [];
  public pageCount: number = 0;
  private outline: LayoutOutline;
  private anchors: { [anchor_name: string]: Anchor } = {};

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

  public createOutline(evaluator: ILayoutOutlineEvaluator): HTMLElement {
    return this.outline.acceptEvaluator(evaluator);
  }

  public createElement(tagName: string, layoutNames: string[], logicalNode: ILogicalNode): HTMLElement {
    const node = document.createElement(tagName);
    const element = logicalNode.env.element;
    const originalTagName = element.tagName;
    const id = logicalNode.env.element.id;
    const anchor = this.getAnchor(id);
    if (anchor && !anchor.dom) {
      anchor.box = logicalNode;
      anchor.dom = node;
    }
    switch (originalTagName) {
      case "a":
        const href = element.getAttribute("href");
        if (href) {
          node.setAttribute("href", href);
        }
        const name = element.getAttribute("name");
        if (name) {
          node.setAttribute("name", name);
        }
        break;
    }
    node.className = layoutNames.concat(originalTagName).map(layoutName => `nehan-${layoutName}`).concat(
      element.classList.values().map(klass => `nehan-e-${klass}`)
    ).join(" ");
    return node;
  }

  public createLogicalNodeEvaluator(): ILogicalNodeEvaluator {
    const writingMode = WritingMode.load(this.env.element);
    switch (writingMode.value) {
      case "horizontal-tb":
        return new HoriLogicalNodeEvaluator(
          this,
          new HoriCssEvaluator(writingMode),
          LogicalTextJustifier.instance,
        );
      case "vertical-rl":
        return new VertLogicalNodeEvaluator(
          this,
          new VertCssEvaluator(writingMode),
          LogicalTextJustifier.instance,
        );
      case "vertical-lr":
        return new VertLogicalNodeEvaluator(
          this,
          new VertCssEvaluator(writingMode),
          LogicalTextJustifier.instance,
        );
      default:
        throw new Error(`undefined writing mode: ${writingMode.value}`);
    }
  }

  public setAnchor(name: string, anchor: Anchor) {
    this.anchors[name] = anchor;
  }

  public getAnchor(name: string): Anchor | undefined {
    return this.anchors[name];
  }

  public getHeaderSection(element: HtmlElement): LayoutSection | undefined {
    return this.outline.getHeaderSection(element);
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