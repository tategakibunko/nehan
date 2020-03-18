import {
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
  LogicalNodeType

export class LayoutResult {
  static skip = new LayoutResult('skip');
  static lineBreak = new LayoutResult('line-break');

  static pageBreak(ctx: ILayoutFormatContext, msg = "std"): LayoutResult {
    console.log("created page break(%s):", msg, ctx);
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

  getBodyAsBlockNode(): LogicalBlockNode {
    if (this.body && this.body instanceof LogicalBlockNode) {
      return this.body;
    }
    console.log("Type error: body is not LogicalBlockNode. %o", this);
    throw new Error("Type error: body is not LogicalBlockNode");
  }
}
