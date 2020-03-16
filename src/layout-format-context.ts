import {
  HtmlElement,
  LayoutOutline,
  BoxEnv,
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
  inlineNodes: ILogicalNode[];
  blockNodes: ILogicalNode[];
}

export interface IFlowRootFormatContext extends IFlowFormatContext {
  outline: LayoutOutline;
  floatRegion?: FloatRegion;
  floatNodes: ILogicalNode[];
  pageCount: number;
  openElement: (element: HtmlElement) => void;
  closeElement: (element: HtmlElement) => void;
  addFloat: (block: ILogicalPositionalNode, float: LogicalFloat, contextMeasure: number, flowRootPos: LogicalCursorPos) => void;
  clearFloat: (clear: LogicalClear) => number;
}