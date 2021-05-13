import {
  ICharacter,
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

export interface ILogicalNodeEvaluator {
  visitChar: (char: Char) => HTMLElement | Node;
  visitCharEmpha: (char: ICharacter, emphaData: TextEmphaData) => HTMLElement | Node;
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
  visitInline: (inlineNode: LogicalInlineNode) => HTMLElement;
  visitInlineEmpha: (inlineNode: LogicalInlineNode) => HTMLElement;
  visitLine: (lineNode: LogicalLineNode) => HTMLElement;
  visitBlock: (blockNode: LogicalBlockNode) => HTMLElement;
  visitRootBlock: (blockNode: LogicalBlockNode) => HTMLElement;
  visitInlineBlock: (iblockNode: LogicalInlineBlockNode) => HTMLElement;
  visitTableCells: (tableCellsNode: LogicalTableCellsNode) => HTMLElement;
  visitBlockImage: (imgNode: LogicalBlockReNode) => HTMLElement;
  visitInlineImage: (imgNode: LogicalInlineReNode) => HTMLElement;
  visitBlockVideo: (videoNode: LogicalBlockReNode) => HTMLElement;
  visitInlineVideo: (videoNode: LogicalInlineReNode) => HTMLElement;
  visitInlineLink: (link: LogicalInlineNode) => HTMLElement;
  visitBlockLink: (link: LogicalBlockNode) => HTMLElement;
  visitBlockReFixed: (fixedNode: LogicalBlockReNode, fixedDOM: HTMLElement) => HTMLElement;
  visitInlineReFixed: (fixedNode: LogicalInlineReNode, fixedDOM: HTMLElement) => HTMLElement;
}
