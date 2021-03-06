import {
  NehanElement,
  BoxEnv,
  Anchor,
  LayoutSection,
  FloatRegion,
  ILayoutReducer,
  LogicalCursorPos,
  LayoutResult,
  ILogicalNode,
  ILogicalNodePos,
  LogicalInlineNode,
  LogicalFloat,
  LogicalClear,
  PageRootFormatContext,
  ILogicalFloatableNode,
  ILayoutOutlineEvaluator,
  ILogicalNodeEvaluator,
} from './public-api'

export interface ILayoutFormatContext {
  env: BoxEnv;
  parent?: ILayoutFormatContext;
  listMarker?: LogicalInlineNode;
  boxPos: ILogicalNodePos;
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
  openElement: (element: NehanElement) => void;
  closeElement: (element: NehanElement) => void;
  createElement: (tagName: string, layoutNames: string[], logicalNode: ILogicalNode) => HTMLElement;
  createOutline: (outlineEvaluator: ILayoutOutlineEvaluator) => HTMLElement;
  createLogicalNodeEvaluator: () => ILogicalNodeEvaluator;
  addFloat: (block: ILogicalFloatableNode, float: LogicalFloat, contextMeasure: number, flowRootPos: LogicalCursorPos) => void;
  setAnchor: (name: string, anchor: Anchor) => void;
  getAnchor: (name: string) => Anchor | undefined;
  getHeaderSection: (element: NehanElement) => LayoutSection | undefined;
  clearFloat: (clear: LogicalClear) => number;
  getSectionAt: (pageIndex: number) => LayoutSection;
}