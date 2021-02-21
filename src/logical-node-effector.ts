import {
  Char,
  SpaceChar,
  HalfChar,
  MixChar,
  Tcy,
  Word,
  SmpUniChar,
  RefChar,
  DualChar,
  LogicalTextNode,
  LogicalRubyNode,
  LogicalInlineNode,
  LogicalLineNode,
  LogicalBlockNode,
  LogicalInlineBlockNode,
  LogicalTableCellsNode,
  LogicalBlockReNode,
  LogicalInlineReNode,
  TextEmphaData,
} from './public-api'

export interface ILogicalNodeEffector {
  /*
  visitChar: (char: Char) => HTMLElement | Node;
  visitCharEmpha: (char: Char, emphaData: TextEmphaData) => HTMLElement | Node;
  visitRefChar: (refChar: RefChar) => HTMLElement | Node;
  visitRefCharEmpha: (refChar: RefChar, emphaData: TextEmphaData) => HTMLElement | Node;
  visitSpaceChar: (spaceChar: SpaceChar) => HTMLElement | Node;
  visitHalfChar: (halfChar: HalfChar) => HTMLElement | Node;
  visitMixChar: (mixChar: MixChar) => HTMLElement | Node;
  visitDualChar: (dualChar: DualChar) => HTMLElement | Node;
  visitDualCharKern: (dualChar: DualChar) => HTMLElement | Node;
  visitSmpUniChar: (uniChar: SmpUniChar) => HTMLElement | Node;
  visitTcy: (tcy: Tcy) => HTMLElement | Node;
  visitWord: (word: Word) => HTMLElement | Node;
  visitRuby: (ruby: LogicalRubyNode) => HTMLElement;
  visitText: (textNode: LogicalTextNode) => HTMLElement;
  */
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
  visitBlockRe: (blockReNode: LogicalBlockReNode) => void;
  // visitInlineRe: (inlineReNode: LogicalInlineReNode) => void;
  // visitInlineLink: (link: LogicalInlineNode) => void;
  visitBlockLink: (link: LogicalBlockNode) => void;
}
