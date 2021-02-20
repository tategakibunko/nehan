import {
  HtmlElement,
  BoxEnv,
  Anchor,
  LayoutSection,
  FloatRegion,
  ILayoutReducer,
  LogicalCursorPos,
  LayoutResult,
  ILogicalNode,
  LogicalInlineNode,
  LogicalFloat,
  LogicalClear,
  PageRootFormatContext,
  ILogicalPositionalNode,
  ILayoutOutlineEvaluator,
  ILogicalNodeEvaluator,
} from './public-api'

export interface ILayoutFormatContext {
  env: BoxEnv;
  parent?: ILayoutFormatContext;
  listMarker?: LogicalInlineNode;
  globalPos: LogicalCursorPos;
  flowRootPos: LogicalCursorPos;
  cursorPos: LogicalCursorPos;
  localPos: LogicalCursorPos;
  lineHeadPos: LogicalCursorPos;
  pageRoot: PageRootFormatContext;
  flowRoot: IFlowRootFormatContext;
  inlineRoot: IFlowFormatContext;
  progress: number; // 0.0 ~ 1.0
  rootMeasure: number;
  rootExtent: number;
  restMeasure: number;
  restExtent: number;
  maxMeasure: number;
  maxExtent: number;
  contextRestMeasure: number;
  acceptLayoutReducer: (reducer: ILayoutReducer, ...args: any) => LayoutResult;
}

export interface IFlowFormatContext extends ILayoutFormatContext {
  parentBlock?: ILayoutFormatContext;
  inlineNodes: ILogicalNode[];
  blockNodes: ILogicalNode[];
}

export interface IFlowRootFormatContext extends IFlowFormatContext {
  floatRegion?: FloatRegion;
  floatNodes: ILogicalNode[];
  pageCount: number;
  openElement: (element: HtmlElement) => void;
  closeElement: (element: HtmlElement) => void;
  createElement: (tagName: string, layoutNames: string[], logicalNode: ILogicalNode) => HTMLElement;
  createOutline: (outlineEvaluator: ILayoutOutlineEvaluator) => HTMLElement;
  createLogicalNodeEvaluator: () => ILogicalNodeEvaluator;
  addFloat: (block: ILogicalPositionalNode, float: LogicalFloat, contextMeasure: number, flowRootPos: LogicalCursorPos) => void;
  setAnchor: (name: string, anchor: Anchor) => void;
  getAnchor: (name: string) => Anchor | undefined;
  getHeaderSection: (element: HtmlElement) => LayoutSection | undefined;
  clearFloat: (clear: LogicalClear) => number;
}