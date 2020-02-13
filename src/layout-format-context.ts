import {
  BoxEnv,
  FloatRegion,
  ILayoutReducer,
  LogicalCursorPos,
  LayoutResult,
  ILogicalNode,
  LogicalBlockNode,
  LogicalFloat,
  LogicalClear,
} from './public-api'

export interface ILayoutFormatContext {
  env: BoxEnv;
  parent?: ILayoutFormatContext;
  globalPos: LogicalCursorPos;
  flowRootPos: LogicalCursorPos;
  cursorPos: LogicalCursorPos;
  localPos: LogicalCursorPos;
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