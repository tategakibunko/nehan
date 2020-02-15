import {
  LogicalSize,
  LogicalCursorPos,
  ILogicalNode,
  LayoutResult,
  FlowFormatContext,
  FlowRootFormatContext,
  TextFormatContext,
  LogicalTextNode,
  LogicalBlockNode,
  LogicalInlineNode,
  LogicalLineNode,
  LogicalRubyNode,
  RubyGroup,
} from './public-api'

export interface ILayoutReducer {
  visit: (...args: any) => LayoutResult; // TODO
}

export class TextReducer implements ILayoutReducer {
  static instance = new TextReducer();
  private constructor() { }

  visit(context: TextFormatContext, indent = false): LayoutResult {
    const measure = context.cursorPos.start;
    const extent = context.env.font.lineExtent;
    const size = new LogicalSize({ measure, extent });
    const text = context.text;
    const children = context.children;
    const textNode = new LogicalTextNode(size, text, children);
    // console.log("reduceText:%o", textNode);
    context.children = [];
    context.text = "";
    if (indent) {
      context.cursorPos.start = 0;
    }
    return LayoutResult.logicalNode('text', textNode);
  }
}

export class InlineReducer implements ILayoutReducer {
  static instance = new InlineReducer();
  protected constructor() { }

  visit(context: FlowFormatContext, indent: boolean): LayoutResult {
    const measure = context.cursorPos.start;
    const extent = context.inlineNodes.reduce((acm, e: ILogicalNode) => {
      return (e.size.extent > acm) ? e.size.extent : acm;
    }, context.env.font.lineExtent);
    const children = context.inlineNodes;
    const text = context.inlineText;
    const size = new LogicalSize({ measure, extent });
    const edge = context.contextBoxEdge.currentBorderBoxEdge;
    const inlineNode = new LogicalInlineNode(size, text, edge, children);
    context.inlineNodes = [];
    context.inlineText = "";
    if (indent) {
      context.cursorPos.start = 0;
    }
    // console.log("reduceInline:%o", inline);
    return LayoutResult.logicalNode('inline', inlineNode); // TODO
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
  static instance = new RubyBaseReducer();

  visit(context: FlowFormatContext, indent: boolean): LayoutResult {
    const result = super.visit(context, indent);
    result.type = 'ruby-base'; // inline-box -> ruby-base
    return result;
  }
}

export class RubyTextReducer extends InlineReducer {
  static instance = new RubyTextReducer();

  visit(context: FlowFormatContext, indent: boolean): LayoutResult {
    const result = super.visit(context, indent);
    result.type = 'ruby-text'; // inline-box -> ruby-text
    return result;
  }
}

export class LineReducer implements ILayoutReducer {
  static instance = new LineReducer();
  private constructor() { }

  visit(context: FlowFormatContext): LayoutResult {
    const measure = context.cursorPos.start;
    const extent = context.inlineNodes.reduce((acm, e: ILogicalNode) => {
      return (e.size.extent > acm) ? e.size.extent : acm;
    }, context.env.font.lineExtent);
    const size = new LogicalSize({ measure, extent });
    const pos = context.parent ? context.lineHeadPos : LogicalCursorPos.zero;
    const children = context.inlineNodes;
    const text = context.inlineText;
    const floatOffset = context.floatOffset;
    const lineNode = new LogicalLineNode(pos, size, text, children, floatOffset);
    context.cursorPos.start = 0;
    context.inlineNodes = [];
    context.inlineText = "";
    console.log("[%s] reduceLine(%s) at %s(float offset:%d), %o",
      context.name, size.toString(), pos.toString(), floatOffset, lineNode.text);
    return LayoutResult.logicalNode('line', lineNode);
  }
}

export class BlockReducer implements ILayoutReducer {
  static instance = new BlockReducer();
  private constructor() { }

  visit(context: FlowFormatContext): LayoutResult {
    const pos = context.parent ? context.parent.localPos : LogicalCursorPos.zero;
    const measure = context.maxMeasure;
    const extent = context.env.extent || context.cursorPos.before;
    // const size = new LogicalSize({ measure, extent });
    const size = context.paddingBoxSize;
    // const edge = context.contextBoxEdge.currentBorderBoxEdge;
    const edge = context.contextBoxEdge.currentBorder;
    const text = context.text;
    const children = context.blockNodes;
    const blockNode = new LogicalBlockNode(context.env, pos, size, text, edge, children);
    console.log("[%s] reduceBlock(%s) at %s, global %s, %o", context.name, size.toString(), pos.toString(), context.globalPos.toString(), blockNode.text);
    context.text = "";
    context.blockNodes = [];
    context.cursorPos = LogicalCursorPos.zero;
    context.contextBoxEdge.clear();
    return LayoutResult.logicalNode('block', blockNode);
  }
}

export class RootBlockReducer implements ILayoutReducer {
  static instance = new RootBlockReducer();
  private constructor() { }

  visit(context: FlowRootFormatContext): LayoutResult {
    const pos = context.parent ? context.parent.localPos.clone() : LogicalCursorPos.zero;
    const measure = context.maxMeasure;
    let extent = context.env.extent || context.cursorPos.before;
    // this block must wrap whole elements(even if some child is floated).
    if (context.floatRegion) {
      extent = Math.max(extent, context.floatRegion.maxRegionExtent);
    }
    const size = new LogicalSize({ measure, extent });
    // const edge = context.contextBoxEdge.currentBorderBoxEdge;
    const edge = context.contextBoxEdge.currentBorder;
    const text = context.text;
    const children = context.blockNodes.concat(context.floatNodes);
    const blockNode = new LogicalBlockNode(context.env, pos, size, text, edge, children);
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
    return LayoutResult.logicalNode('block', blockNode);
  }
}

export class TableCellReducer implements ILayoutReducer {
  visit(context: FlowRootFormatContext): LayoutResult {
    throw new Error("todo");
  }
}
