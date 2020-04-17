import {
  ILogicalNode,
  LogicalSize,
  LogicalCursorPos,
  LayoutResult,
  LogicalNodeType,
  FlowFormatContext,
  FlowRootFormatContext,
  TextFormatContext,
  LogicalTextNode,
  LogicalBlockNode,
  LogicalInlineBlockNode,
  LogicalTableCellsNode,
  LogicalInlineNode,
  LogicalLineNode,
  LogicalRubyNode,
  RubyGroup,
  TableCellsFormatContext,
  LogicalBlockReNode,
  LogicalInlineReNode,
  PhysicalSize,
} from './public-api'

export interface ILayoutReducer {
  visit: (...args: any[]) => LayoutResult;
}

export class TextReducer implements ILayoutReducer {
  static instance = new TextReducer();
  private constructor() { }

  visit(context: TextFormatContext, indent = false): LayoutResult {
    const measure = context.cursorPos.start;
    const extent = context.env.font.size;
    const size = new LogicalSize({ measure, extent });
    const text = context.text;
    const children = context.characters;
    const skipBr = !context.lexer.hasNext() && indent;
    const textNode = new LogicalTextNode(context.env, size, text, skipBr, children);
    // console.log("reduceText:%o", textNode);
    context.characters = [];
    context.text = "";
    if (indent) {
      context.cursorPos.start = 0;
    }
    return LayoutResult.logicalNode('text', textNode);
  }
}

export class InlineReducer implements ILayoutReducer {
  static instance = new InlineReducer('inline');
  protected constructor(public type: LogicalNodeType) { }

  visit(context: FlowFormatContext, indent: boolean): LayoutResult {
    const measure = context.cursorPos.start;
    const extent = Math.max(context.env.font.size, ...context.inlineNodes.map(node => node.extent));
    const children = context.inlineNodes;
    const text = context.inlineText;
    const size = new LogicalSize({ measure, extent });
    const edge = context.contextBoxEdge.currentMarginBoxEdge;
    const inlineNode = new LogicalInlineNode(context.env, size, text, edge, children);
    context.contextBoxEdge.clear();
    context.inlineNodes = [];
    context.inlineText = "";
    if (indent) {
      context.cursorPos.start = 0;
    }
    // console.log("reduceInline:%o", inlineNode);
    return LayoutResult.logicalNode(this.type, inlineNode);
  }
}

export class RubyReducer implements ILayoutReducer {
  static instance = new RubyReducer();
  private constructor() { }

  visit(context: FlowFormatContext, rubyGroup: RubyGroup): LayoutResult {
    const rb = rubyGroup.rb;
    const rt = rubyGroup.rt;
    const measure = Math.max(rb.size.measure, rt.size.measure);
    const extent = rb.size.extent + rt.size.extent;
    const size = new LogicalSize({ measure, extent });
    const text = rb.text;
    const rubyNode = new LogicalRubyNode(context.env, size, text, rb, rt);
    return LayoutResult.logicalNode('ruby', rubyNode);
  }
}

export class RubyBaseReducer extends InlineReducer {
  static instance = new RubyBaseReducer('ruby-base');
}

export class RubyTextReducer extends InlineReducer {
  static instance = new RubyTextReducer('ruby-text');
}

export class ListMarkerReducer extends InlineReducer {
  static instance = new ListMarkerReducer('list-marker');
}

export class LineReducer implements ILayoutReducer {
  static instance = new LineReducer();
  private constructor() { }

  private isDecoratedText(node: ILogicalNode): boolean {
    return !node.env.textEmphasis.isNone() || node instanceof LogicalRubyNode;
  }

  private getDecoratedExtent(node: ILogicalNode): number {
    if (!node.env.textEmphasis.isNone()) {
      return node.env.font.size * 2;
    }
    if (node instanceof LogicalRubyNode) {
      return node.extent;
    }
    return 0;
  }

  private isReChild(node: ILogicalNode): boolean {
    if (node instanceof LogicalInlineReNode) {
      return true;
    }
    if (node instanceof LogicalInlineNode) {
      return node.children.some(child => this.isReChild(child));
    }
    return false;
  }

  private isEmptyLine(children: ILogicalNode[], lineText: string): boolean {
    if (children.length === 0) {
      return true;
    }
    // If list-marker(list-style-type !== none) is included, text of first child is not empty.
    // Note that text of list-marker is not included in lineText.
    if (children[0].text.trim() !== "") {
      return false;
    }
    return lineText.trim() === "";
  }

  visit(context: FlowFormatContext, isBr = false): LayoutResult {
    const pos = context.lineHeadPos;
    const measure = context.maxMeasure;
    const children = context.inlineNodes;
    const reChildren = children.filter(node => this.isReChild(node));
    const iblockChildren = children.filter(node => node instanceof LogicalInlineBlockNode);
    const decoratedChildren = children.filter(node => this.isDecoratedText(node));
    const maxFont = children.reduce((acm, node) => node.env.font.size > acm.size ? node.env.font : acm, context.env.font);
    const minChildExtent = Math.min(...children.map(child => child.extent));
    const maxDecoratedExtent = Math.max(...decoratedChildren.map(node => this.getDecoratedExtent(node)));
    const maxReExtent = Math.max(...reChildren.map(node => node.extent));
    const maxIblockExtent = Math.max(...iblockChildren.map(node => node.extent));
    const maxNonTextExtent = Math.max(maxReExtent, maxIblockExtent);
    const baseLineExtent = Math.max(maxFont.size, maxDecoratedExtent, maxNonTextExtent);
    const maxFontLineExtent = maxFont.lineExtent;
    const maxChildExtent = Math.max(maxFontLineExtent, ...children.map(node => node.extent));
    const lineBodyExtent = Math.max(maxFontLineExtent, maxChildExtent); // decorated extent is not included here!
    const textBodyExtent = Math.max(maxFont.size, maxNonTextExtent);
    const baseLineOffset = maxFontLineExtent - maxFont.size;
    const isNonTextLine = children.length === (iblockChildren.length + reChildren.length);
    // If body size of line is created by max non-text element(such as re, iblock),
    // then add some rest space for line(if rest extent is enough).
    let extent = (lineBodyExtent === maxNonTextExtent && context.restExtent >= baseLineOffset) ? lineBodyExtent + baseLineOffset : lineBodyExtent;
    extent = Math.min(extent, context.rootExtent);
    const size = new LogicalSize({ measure, extent });
    const text = context.inlineText;

    // [memo]
    // blockOffset is space size of before/after space between baseline and lineNode.
    // startOffset is space size of (inline) start space
    // Here is [lineNode] structure.
    //
    // --------------------------------------------
    //               blockOffset
    // startOffset  [baselineNode]
    //               blockOffset
    //----------------------------------------------
    const blockOffset = Math.floor(baseLineOffset / 2);
    const baseline = {
      size: new LogicalSize({ measure, extent: baseLineExtent }),
      textBodySize: new LogicalSize({ measure: context.cursorPos.start, extent: textBodyExtent }),
      startOffset: context.lineBoxStartOffset,
      blockOffset,
    };
    const autoMeasure = baseline.startOffset + context.cursorPos.start;
    const autoSize = new LogicalSize({ measure: autoMeasure, extent });
    // if empty line or non-text-line(re or iblock only) and min-child is smaller than fontSize, shrink line-height to fontSize.
    if (children.length === 0 || (minChildExtent < context.env.font.size && isNonTextLine)) {
      size.extent = autoSize.extent = baseline.size.extent = baseline.textBodySize.extent = context.env.font.size;
      baseline.blockOffset = 0;
    }
    const lineNode = new LogicalLineNode(context.env, pos, size, autoSize, text, children, baseline);
    // If Config.ignoreEmptyInline or Config.ignoreZeroRe is enabled, empty line without br would be produced.
    // Or marker only line with 'list-style:none', space only line will be also created in some case.
    // It's not valid layout element, so discard block size of line.
    if (!isBr && this.isEmptyLine(children, text)) {
      // console.log("discard empty line");
      lineNode.size.extent = baseline.size.extent = 0;
    }
    context.cursorPos.start = 0;
    context.inlineNodes = [];
    context.inlineText = "";
    // console.log("[%s] reduceLine:%o(isBr=%o)", context.name, lineNode, isBr);
    return LayoutResult.logicalNode('line', lineNode);
  }
}

export class BlockReducer implements ILayoutReducer {
  static instance = new BlockReducer('block');
  protected constructor(public type: LogicalNodeType) { }

  visit(context: FlowFormatContext): LayoutResult {
    const pos = context.blockPos;
    const size = context.contentBoxSize;
    const autoSize = context.autoContentBoxSize;
    const border = context.contextBoxEdge.currentBorder;
    const text = context.text;
    const children = context.blockNodes;
    if (context.env.borderCollapse.isCollapse()) {
      size.extent -= context.getBorderCollapseAfterSize();
    }
    const blockNode = new LogicalBlockNode(context.env, pos, size, autoSize, text, border, children, context.progress);
    // console.log("[%s] reduceBlock(%s) as %s at %s, %o", context.name, size.toString(), this.type, pos.toString(), blockNode.text);
    context.text = "";
    context.blockNodes = [];
    context.cursorPos = LogicalCursorPos.zero;
    context.contextBoxEdge.clearBlock();
    return LayoutResult.logicalNode(this.type, blockNode);
  }
}

export class RootBlockReducer implements ILayoutReducer {
  static instance = new RootBlockReducer('block');
  protected constructor(public type: LogicalNodeType) { }

  visit(context: FlowRootFormatContext): LayoutResult {
    const pos = context.blockPos;
    const size = context.contentBoxSize;
    const autoSize = context.autoContentBoxSize;
    if (context.floatRegion) {
      const maxFloatedExtent = context.floatRegion.maxRegionExtent;
      size.extent = Math.max(size.extent, maxFloatedExtent);
      autoSize.extent = Math.max(autoSize.extent, maxFloatedExtent);
    }
    const border = context.contextBoxEdge.currentBorder;
    const text = context.text;
    const children = context.floatNodes ? context.blockNodes.concat(context.floatNodes) : context.blockNodes;
    const blockNode = new LogicalBlockNode(context.env, pos, size, autoSize, text, border, children, context.progress);
    // console.log("[%s] reduceRootBlock at %s, %o", context.name, pos.toString(), blockNode.text);
    context.text = "";
    context.blockNodes = [];
    context.floatNodes = [];
    context.cursorPos = LogicalCursorPos.zero;
    context.contextBoxEdge.clearBlock();
    if (context.floatRegion) {
      delete context.floatRegion;
      context.floatRegion = undefined;
    }
    context.pageCount++;
    return LayoutResult.logicalNode(this.type, blockNode);
  }
}

export class InlineBlockReducer implements ILayoutReducer {
  static instance = new InlineBlockReducer();

  visit(context: FlowRootFormatContext): LayoutResult {
    const pos = context.blockPos;
    const size = context.contentBoxSize;
    if (context.floatRegion) {
      size.extent = Math.max(size.extent, context.floatRegion.maxRegionExtent);
    }
    const autoSize = context.autoContentBoxSize;
    const border = context.contextBoxEdge.currentBorder;
    const edge = context.env.edge.clone();
    edge.border = border;
    const text = context.text;
    const children = context.floatNodes ? context.blockNodes.concat(context.floatNodes) : context.blockNodes;
    const iblockNode = new LogicalInlineBlockNode(context.env, pos, size, autoSize, text, edge, children);
    // console.log("[%s] reduceInlineBlock at %s, %o", context.name, pos.toString(), iblockNode);
    context.text = "";
    context.blockNodes = [];
    context.floatNodes = [];
    context.cursorPos = LogicalCursorPos.zero;
    context.contextBoxEdge.clearBlock();
    if (context.floatRegion) {
      delete context.floatRegion;
      context.floatRegion = undefined;
    }
    return LayoutResult.logicalNode("inline-block", iblockNode);
  }
}

export class TableCellReducer extends RootBlockReducer {
  static instance = new TableCellReducer("table-cell");
}

export class TableCellsReducer implements ILayoutReducer {
  static instance = new TableCellsReducer();
  private constructor() { }

  visit(context: TableCellsFormatContext): LayoutResult {
    const measure = context.maxMeasure;
    const extent = Math.max(...context.cells.map(cell => cell.extent));
    const size = new LogicalSize({ measure, extent });
    const pos = LogicalCursorPos.zero;
    const text = context.cells.reduce((acm, cell) => acm + cell.text, "");
    const block = new LogicalTableCellsNode(context.env, size, pos, text, context.cells);
    context.contextBoxEdge.clearBlock();
    context.cursorPos = LogicalCursorPos.zero;
    // console.log("[%s] reduceTableCells:", context.name, block);
    return LayoutResult.logicalNode("table-cells", block);
  }
}

export class TableReducer extends BlockReducer {
  static instance = new TableReducer("table");
}

export class TableRowGroupReducer extends BlockReducer {
  static instance = new TableRowGroupReducer("table-row-group");
}

export class TableRowReducer extends BlockReducer {
  static instance = new TableRowReducer("table-row");
}

export class BlockLinkReducer extends BlockReducer {
  static instance = new BlockReducer("block-link");
}

export class InlineLinkReducer extends InlineReducer {
  static instance = new InlineReducer("inline-link");
}

export class ReReducer implements ILayoutReducer {
  static instance = new ReReducer();
  private constructor() { }

  private visitBlock(context: FlowFormatContext, logicalSize: LogicalSize, physicalSize: PhysicalSize): LayoutResult {
    const edge = context.env.edge;
    const pos = context.parent ? context.parent.localPos : LogicalCursorPos.zero;
    const text = `(${context.env.element.tagName})`;
    const re = new LogicalBlockReNode(context.env, logicalSize, physicalSize, edge, pos, text);
    // console.log("[%s] reduce Re(block):", context.name, re);
    return LayoutResult.logicalNode('re-block', re);
  }

  private visitInline(context: FlowFormatContext, logicalSize: LogicalSize, physicalSize: PhysicalSize): LayoutResult {
    const edge = context.env.edge;
    const text = `(${context.env.element.tagName})`;
    const re = new LogicalInlineReNode(context.env, logicalSize, physicalSize, edge, text);
    // console.log("[%s] reduce Re(inline):", context.name, re);
    return LayoutResult.logicalNode('re-inline', re);
  }

  visit(context: FlowFormatContext, logicalSize: LogicalSize, physicalSize: PhysicalSize): LayoutResult {
    return context.env.display.isBlockLevel() ?
      this.visitBlock(context, logicalSize, physicalSize) :
      this.visitInline(context, logicalSize, physicalSize);
  }
}
