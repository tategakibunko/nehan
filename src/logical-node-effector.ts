import {
  LogicalLineNode,
  LogicalRubyNode,
  LogicalInlineNode,
  LogicalBlockNode,
  LogicalInlineBlockNode,
  LogicalTableCellsNode,
  LogicalBlockReNode,
  LogicalInlineReNode,
} from './public-api'

export interface ILogicalNodeEffector {
  visitRuby: (ruby: LogicalRubyNode) => void;
  visitLine: (line: LogicalLineNode) => void;
  visitInline: (inlineNode: LogicalInlineNode) => void;
  visitBlock: (blockNode: LogicalBlockNode) => void;
  visitInlineBlock: (iblockNode: LogicalInlineBlockNode) => void;
  visitTableCells: (tableCellsNode: LogicalTableCellsNode) => void;
  visitBlockImage: (imgNode: LogicalBlockReNode) => void;
  visitInlineImage: (imgNode: LogicalInlineReNode) => void;
  visitBlockVideo: (videoNode: LogicalBlockReNode) => void;
  visitInlineVideo: (videoNode: LogicalInlineReNode) => void;
}
