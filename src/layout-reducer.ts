import {
  LogicalSize,
  LogicalCursorPos,
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
    const rubyNode = new LogicalRubyNode(size, text, rb, rt);
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
    const measure = context.cursorPos.start;
    const extent = Math.max(context.env.font.lineExtent, ...context.inlineNodes.map(node => node.extent));
    const size = new LogicalSize({ measure, extent });
    const pos = context.lineHeadPos;
    const children = context.inlineNodes;
    const text = context.inlineText;
    const startOffset = context.lineBoxStartOffset;
    const lineNode = new LogicalLineNode(context.env, pos, size, text, children, startOffset);
    context.cursorPos.start = 0;
    context.inlineNodes = [];
    context.inlineText = "";
    console.log("[%s] reduceLine(%s) at %s(startOffset:%d), %o",
      context.name, size.toString(), pos.toString(), startOffset, lineNode.text);
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
    const block = new LogicalTableCellsNode(size, pos, text, context.cells);
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