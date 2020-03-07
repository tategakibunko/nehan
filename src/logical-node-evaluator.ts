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
  LogicalTableCellsNode,
  LogicalReNode,
  TextEmphaData,
} from './public-api'

export interface ILogicalNodeEvaluator {
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
  visitInline: (inlineNode: LogicalInlineNode) => HTMLElement;
  visitInlineEmpha: (inlineNode: LogicalInlineNode) => HTMLElement;
  visitLine: (lineNode: LogicalLineNode) => HTMLElement;
  visitBlock: (blockNode: LogicalBlockNode) => HTMLElement;
  visitInlineBlock: (blockNode: LogicalBlockNode) => HTMLElement;
  visitTableCells: (tableCellsNode: LogicalTableCellsNode) => HTMLElement;
  visitBlockImage: (imgNode: LogicalReNode) => HTMLElement;
  visitInlineImage: (imgNode: LogicalReNode) => HTMLElement;
  visitInlineLink: (link: LogicalInlineNode) => HTMLElement;
  visitBlockLink: (link: LogicalBlockNode) => HTMLElement;
}

