import {
  LogicalSize,
  LogicalCursorPos,
  LogicalBaseLineMetrics,
  LayoutResult,
  LogicalNodeType,
  FlowFormatContext,
  FlowRootFormatContext,
  TextFormatContext,
  LogicalTextNode,
  LogicalBlockNode,
  LogicalTableCellsNode,
  LogicalInlineNode,
  LogicalLineNode,
  LogicalRubyNode,
  RubyGroup,
  TableCellsFormatContext,
  LogicalReNode,
  PhysicalSize,
} from './public-api'

export interface ILayoutReducer {
  visit: (...args: any[]) => LayoutResult; // TODO
}

export class TextReducer implements ILayoutReducer {
  static instance = new TextReducer();
  private constructor() { }

  visit(context: TextFormatContext, indent = false): LayoutResult {
    const measure = context.cursorPos.start;
    const extent = context.env.font.lineExtent;
    const size = new LogicalSize({ measure, extent });
    const text = context.text;
    const children = context.characters;
    const textNode = new LogicalTextNode(context.env, size, text, children);
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
    const extent = Math.max(context.env.font.lineExtent, ...context.inlineNodes.map(node => node.extent));
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
    console.log("reduceInline:%o", inlineNode);
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

  visit(context: FlowFormatContext): LayoutResult {
    const pos = context.lineHeadPos;
    const children = context.inlineNodes;
    const decoratedChildren = children.filter(node => !node.env.textEmphasis.isNone() || node instanceof LogicalRubyNode);
    // const measure = context.cursorPos.start;
    const measure = context.maxMeasure;
    const maxFont = children.reduce((acm, node) => {
      return node.env.font.size > acm.size ? node.env.font : acm;
    }, context.env.font);
    const maxDecoratedExtent = Math.max(
      ...decoratedChildren.map(node => {
        if (!node.env.textEmphasis.isNone()) {
          return node.env.font.size * 2;
        }
        if (node instanceof LogicalRubyNode) {
          return node.extent;
        }
        return 0;
      })
    );
    const baseLineExtent = Math.max(maxFont.size, maxDecoratedExtent);
    const maxLineExtent = maxFont.lineExtent;
    const maxChildExtent = Math.max(maxLineExtent, ...children.map(node => node.extent));
    const baseLineOffset = (maxLineExtent - maxFont.size) / 2;
    const lineExtent = Math.max(maxLineExtent, maxChildExtent);
    const size = new LogicalSize({ measure, extent: lineExtent });
    const text = context.inlineText;
    const startOffset = context.lineBoxStartOffset;
    // Adjustment size of sticking out from lineExtent by text-emphasis or ruby.
    const metrics = new LogicalBaseLineMetrics(baseLineExtent, startOffset, baseLineOffset);
    const lastNode = (context.nodeHistory.length > 0) ? context.nodeHistory[context.nodeHistory.length - 1] : null;
    const isContinuousLine = lastNode && lastNode instanceof LogicalLineNode;
    // If it's not continuous line, but it has some decorated text like empha, ruby,
    // set before offset to line to prevent line from overflow of parent block.
    if (maxFont.size < maxDecoratedExtent && !isContinuousLine) {
      pos.before += baseLineOffset;
      context.cursorPos.before += baseLineOffset;
    }
    const lineNode = new LogicalLineNode(context.env, pos, size, text, children, metrics);
    context.cursorPos.start = 0;
    context.inlineNodes = [];
    context.inlineText = "";
    console.log("[%s] reduceLine(%s) at %s(metrics:%o), %o",
      context.name, size.toString(), pos.toString(), metrics, lineNode.text);
    return LayoutResult.logicalNode('line', lineNode);
  }
}

export class BlockReducer implements ILayoutReducer {
  static instance = new BlockReducer('block');
  protected constructor(public type: LogicalNodeType) { }

  visit(context: FlowFormatContext): LayoutResult {
    const pos = context.parent ? context.parent.localPos : LogicalCursorPos.zero;
    const size = context.contentBoxSize;
    const border = context.contextBoxEdge.currentBorder;
    const text = context.text;
    const children = context.blockNodes;
    if (context.env.borderCollapse.isCollapse()) {
      size.extent -= context.getBorderCollapseAfterSize();
    }
    const blockNode = new LogicalBlockNode(context.env, pos, size, text, border, children);
    console.log("[%s] reduceBlock(%s) as %s at %s, global %s, %o", context.name, size.toString(), this.type, pos.toString(), context.globalPos.toString(), blockNode.text);
    context.text = "";
    context.blockNodes = [];
    context.cursorPos = LogicalCursorPos.zero;
    context.contextBoxEdge.clear();
    return LayoutResult.logicalNode(this.type, blockNode);
  }
}

export class RootBlockReducer implements ILayoutReducer {
  static instance = new RootBlockReducer('block');
  protected constructor(public type: LogicalNodeType) { }

  visit(context: FlowRootFormatContext): LayoutResult {
    const pos = context.parent ? context.parent.localPos.clone() : LogicalCursorPos.zero;
    const size = context.contentBoxSize;
    if (context.floatRegion) {
      size.extent = Math.max(size.extent, context.floatRegion.maxRegionExtent);
    }
    const border = context.contextBoxEdge.currentBorder;
    const text = context.text;
    const children = context.floatNodes ? context.blockNodes.concat(context.floatNodes) : context.blockNodes;
    const blockNode = new LogicalBlockNode(context.env, pos, size, text, border, children);
    console.log("[%s] reduceRootBlock at %s, global %s, %o", context.name, pos.toString(), context.globalPos.toString(), blockNode.text);
    context.text = "";
    context.blockNodes = [];
    context.floatNodes = [];
    context.cursorPos = LogicalCursorPos.zero;
    context.contextBoxEdge.clear();
    if (context.floatRegion) {
      delete context.floatRegion;
      context.floatRegion = undefined;
    }
    return LayoutResult.logicalNode(this.type, blockNode);
  }
}

export class InlineBlockReducer extends RootBlockReducer {
  static instance = new InlineBlockReducer("inline-block");
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
    console.log("[%s] reduceTableCells:", context.name, block);
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

export class ReReducer implements ILayoutReducer {
  static instance = new ReReducer();
  private constructor() { }

  visit(context: FlowFormatContext, logicalSize: LogicalSize, physicalSize: PhysicalSize): LayoutResult {
    console.log("ReReducer, logicalSize:%o, physicalSize:%o", logicalSize, physicalSize);
    const type = context.env.display.isBlockLevel() ? 're-block' : 're-inline';
    const edge = context.env.edge;
    const pos = context.parent ? context.parent.localPos : LogicalCursorPos.zero;
    const text = `(${context.env.element.tagName})`;
    const re = new LogicalReNode(context.env, logicalSize, physicalSize, edge, pos, text);
    return LayoutResult.logicalNode(type, re);
  }
}