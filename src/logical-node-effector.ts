import {
  LogicalTextNode,
  LogicalRubyNode,
  LogicalInlineNode,
  LogicalLineNode,
  LogicalBlockNode,
  LogicalInlineBlockNode,
  LogicalTableCellsNode,
  LogicalBlockReNode,
  LogicalInlineReNode,
} from './public-api'

export interface ILogicalNodeEffector {
  visitText: (textNode: LogicalTextNode) => void;
  visitRuby: (ruby: LogicalRubyNode) => void;
  visitInline: (inlineNode: LogicalInlineNode) => void;
  visitInlineEmpha: (inlineNode: LogicalInlineNode) => void;
  visitLine: (lineNode: LogicalLineNode) => void;
  visitBlock: (blockNode: LogicalBlockNode) => void;
  visitRootBlock: (blockNode: LogicalBlockNode) => void;
  visitInlineBlock: (iblockNode: LogicalInlineBlockNode) => void;
  visitTableCells: (tableCellsNode: LogicalTableCellsNode) => void;
  visitBlockImage: (imgNode: LogicalBlockReNode) => void;
  visitInlineImage: (imgNode: LogicalInlineReNode) => void;
  visitBlockVideo: (videoNode: LogicalBlockReNode) => void;
  visitInlineVideo: (videoNode: LogicalInlineReNode) => void;
  visitInlineLink: (link: LogicalInlineNode) => void;
  visitBlockLink: (link: LogicalBlockNode) => void;
}
