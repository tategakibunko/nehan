import {
  Config,
  ILogicalNode,
  LogicalBlockNode,
  ILayoutFormatContext,
} from './public-api'

export type LogicalNodeType =
  'block' |
  'line' |
  'inline' |
  'text' |
  'inline-block' |
  're-block' |
  're-inline' |
  'table-cell' |
  'table-cells' |
  'table-row' |
  'table-row-group' |
  'table' |
  'ruby' |
  'ruby-text' |
  'ruby-base' |
  'list-marker' |
  'inline-link' |
  'block-link'

export type LayoutResultType =
  'skip' |
  'page-break' |
  'line-break' |
  'iblock-inline-break' |
  LogicalNodeType

export class LayoutResult {
  static skip(ctx: ILayoutFormatContext, msg = ""): LayoutResult {
    if (Config.debugLayout) {
      console.log("created skip(%s):", msg, ctx);
    }
    return new LayoutResult('skip', ctx);
  }

  static lineBreak(ctx: ILayoutFormatContext, msg = ""): LayoutResult {
    if (Config.debugLayout) {
      console.log("created line-break(%s):", msg, ctx);
    }
    return new LayoutResult('line-break', ctx);
  }

  // This command is output from text-gen when the inline-block starts where the remaining size of the inline is too small.
  static iblockInlineBreak(ctx: ILayoutFormatContext, msg = ""): LayoutResult {
    if (Config.debugLayout) {
      console.log("created iblock-inline-break(%s):", msg, ctx);
    }
    return new LayoutResult('iblock-inline-break', ctx);
  }

  static pageBreak(ctx: ILayoutFormatContext, msg = ""): LayoutResult {
    if (Config.debugLayout) {
      console.log("created page break(%s):", msg, ctx);
    }
    return new LayoutResult('page-break', ctx);
  }

  static logicalNode(type: LogicalNodeType, node: ILogicalNode): LayoutResult {
    return new LayoutResult(type, node);
  }

  private constructor(public type: LayoutResultType, public body?: any) { }

  isFloatable(): boolean {
    switch (this.type) {
      case 'block':
      case 'inline-block':
      case 're-block':
        return true;
    }
    return false;
  }

  isBlockLevel(): boolean {
    switch (this.type) {
      case 'block':
      case 'block-link':
      case 're-block':
      case 'table':
      case 'table-cells':
      case 'table-row-group':
      case 'table-row':
        return true;
    }
    return false;
  }

  getBodyAsBlockNode(): LogicalBlockNode {
    if (this.body && this.body instanceof LogicalBlockNode) {
      return this.body;
    }
    console.log("Type error: body is not LogicalBlockNode. %o", this);
    throw new Error("Type error: body is not LogicalBlockNode");
  }
}
