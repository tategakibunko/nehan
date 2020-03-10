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
  LogicalBlockReNode,
  LogicalInlineReNode,
  TextEmphaData,
  WritingMode,
  VertLogicalNodeEvaluator,
  HoriLogicalNodeEvaluator,
  VertCssEvaluator,
  HoriCssEvaluator,
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
  visitBlockImage: (imgNode: LogicalBlockReNode) => HTMLElement;
  visitInlineImage: (imgNode: LogicalInlineReNode) => HTMLElement;
  visitInlineLink: (link: LogicalInlineNode) => HTMLElement;
  visitBlockLink: (link: LogicalBlockNode) => HTMLElement;
}

export class LogicalNodeEvaluator {
  private currentWritingMode: WritingMode = new WritingMode("horizontal-tb");

  constructor(
    private horiTbEvaluator: ILogicalNodeEvaluator = new HoriLogicalNodeEvaluator(new HoriCssEvaluator(new WritingMode("horizontal-tb"))),
    private vertRlEvaluator: ILogicalNodeEvaluator = new VertLogicalNodeEvaluator(new VertCssEvaluator(new WritingMode("vertical-rl"))),
    private vertLrEvaluator: ILogicalNodeEvaluator = new VertLogicalNodeEvaluator(new VertCssEvaluator(new WritingMode("vertical-lr"))),
  ) { }

  private get currentEvaluator(): ILogicalNodeEvaluator {
    if (this.currentWritingMode.isTextHorizontal()) {
      return this.horiTbEvaluator;
    }
    if (this.currentWritingMode.isVerticalRl()) {
      return this.vertRlEvaluator;
    }
    return this.vertLrEvaluator;
  }

  visitChar(char: Char): HTMLElement | Node {
    return char.acceptEvaluator(this.currentEvaluator);
  }

  visitCharEmpha(char: Char, emphaData: TextEmphaData): HTMLElement | Node {
    return char.acceptEvaluator(this.currentEvaluator);
  }

  visitRefChar(refChar: RefChar): HTMLElement | Node {
    return refChar.acceptEvaluator(this.currentEvaluator);
  }

  visitRefCharEmpha(refChar: RefChar, emphaData: TextEmphaData): HTMLElement | Node {
    return refChar.acceptEvaluator(this.currentEvaluator);
  }

  visitSpaceChar(spaceChar: SpaceChar): HTMLElement | Node {
    return spaceChar.acceptEvaluator(this.currentEvaluator);
  }

  visitHalfChar(halfChar: HalfChar): HTMLElement | Node {
    return halfChar.acceptEvaluator(this.currentEvaluator);
  }

  visitMixChar(mixChar: MixChar): HTMLElement | Node {
    return mixChar.acceptEvaluator(this.currentEvaluator);
  }

  visitDualChar(dualChar: DualChar): HTMLElement | Node {
    return dualChar.acceptEvaluator(this.currentEvaluator);
  }

  visitDualCharKern(dualChar: DualChar): HTMLElement | Node {
    return dualChar.acceptEvaluator(this.currentEvaluator);
  }

  visitSmpUniChar(uniChar: SmpUniChar): HTMLElement | Node {
    return uniChar.acceptEvaluator(this.currentEvaluator);
  }

  visitTcy(tcy: Tcy): HTMLElement | Node {
    return tcy.acceptEvaluator(this.currentEvaluator);
  }

  visitWord(word: Word): HTMLElement | Node {
    return word.acceptEvaluator(this.currentEvaluator);
  }

  visitRuby(ruby: LogicalRubyNode): HTMLElement {
    return ruby.acceptEvaluator(this.currentEvaluator);
  }

  visitText(textNode: LogicalTextNode): HTMLElement {
    this.currentWritingMode = textNode.env.writingMode;
    return textNode.acceptEvaluator(this.currentEvaluator);
  }

  visitInline(inlineNode: LogicalInlineNode): HTMLElement {
    this.currentWritingMode = inlineNode.env.writingMode;
    return inlineNode.acceptEvaluator(this.currentEvaluator);
  }

  visitInlineEmpha(inlineNode: LogicalInlineNode): HTMLElement {
    this.currentWritingMode = inlineNode.env.writingMode;
    return inlineNode.acceptEvaluator(this.currentEvaluator);
  }

  visitLine(lineNode: LogicalLineNode): HTMLElement {
    this.currentWritingMode = lineNode.env.writingMode;
    return lineNode.acceptEvaluator(this.currentEvaluator);
  }

  visitBlock(blockNode: LogicalBlockNode): HTMLElement {
    this.currentWritingMode = blockNode.env.writingMode;
    return blockNode.acceptEvaluator(this.currentEvaluator);
  }

  visitInlineBlock(blockNode: LogicalBlockNode): HTMLElement {
    this.currentWritingMode = blockNode.env.writingMode;
    return blockNode.acceptEvaluator(this.currentEvaluator);
  }

  visitTableCells(tableCellsNode: LogicalTableCellsNode): HTMLElement {
    this.currentWritingMode = tableCellsNode.env.writingMode;
    return tableCellsNode.acceptEvaluator(this.currentEvaluator);
  }

  visitBlockImage(imgNode: LogicalBlockReNode): HTMLElement {
    this.currentWritingMode = imgNode.env.writingMode;
    return imgNode.acceptEvaluator(this.currentEvaluator);
  }

  visitInlineImage(imgNode: LogicalInlineReNode): HTMLElement {
    this.currentWritingMode = imgNode.env.writingMode;
    return imgNode.acceptEvaluator(this.currentEvaluator);
  }

  visitInlineLink(link: LogicalInlineNode): HTMLElement {
    this.currentWritingMode = link.env.writingMode;
    return link.acceptEvaluator(this.currentEvaluator);
  }

  visitBlockLink(link: LogicalBlockNode): HTMLElement {
    this.currentWritingMode = link.env.writingMode;
    return link.acceptEvaluator(this.currentEvaluator);
  }
}
