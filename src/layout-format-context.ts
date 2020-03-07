import {
  BoxEnv,
  FloatRegion,
  ILayoutReducer,
  LogicalCursorPos,
  LayoutResult,
  ILogicalNode,
  LogicalBlockNode,
  LogicalInlineNode,
  LogicalFloat,
  LogicalClear,
  PageRootFormatContext,
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
  floatRegion?: FloatRegion;
  floatNodes: ILogicalNode[];
  addFloat: (block: LogicalBlockNode, float: LogicalFloat, contextMeasure: number) => void;
  clearFloat: (clear: LogicalClear) => void;
}