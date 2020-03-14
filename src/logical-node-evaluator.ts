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
  WritingMode,
  VertLogicalNodeEvaluator,
  HoriLogicalNodeEvaluator,
  VertCssEvaluator,
  HoriCssEvaluator,
  WritingModeValue,
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
  visitRootBlock: (blockNode: LogicalBlockNode) => HTMLElement;
  visitInlineBlock: (iblockNode: LogicalInlineBlockNode) => HTMLElement;
  visitTableCells: (tableCellsNode: LogicalTableCellsNode) => HTMLElement;
  visitBlockImage: (imgNode: LogicalBlockReNode) => HTMLElement;
  visitInlineImage: (imgNode: LogicalInlineReNode) => HTMLElement;
  visitInlineLink: (link: LogicalInlineNode) => HTMLElement;
  visitBlockLink: (link: LogicalBlockNode) => HTMLElement;
}

export class LogicalNodeEvaluator {
  static horiTbEvaluator: ILogicalNodeEvaluator = new HoriLogicalNodeEvaluator(new HoriCssEvaluator(new WritingMode("horizontal-tb")));
  static vertRlEvaluator: ILogicalNodeEvaluator = new VertLogicalNodeEvaluator(new VertCssEvaluator(new WritingMode("vertical-rl")));
  static vertLrEvaluator: ILogicalNodeEvaluator = new VertLogicalNodeEvaluator(new VertCssEvaluator(new WritingMode("vertical-lr")));

  static selectEvaluator(writingMode: WritingMode | WritingModeValue): ILogicalNodeEvaluator {
    const value = writingMode instanceof WritingMode ? writingMode.value : writingMode;
    switch (value) {
      case "horizontal-tb":
        return this.horiTbEvaluator;
      case "vertical-rl":
        return this.vertRlEvaluator;
      case "vertical-lr":
        return this.vertLrEvaluator;
    }
  }
}
