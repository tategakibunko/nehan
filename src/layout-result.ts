import {
  ILogicalNode,
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
  'list-marker'

export type LayoutResultType =
  'skip' |
  'page-break' |
  'line-break' |
  LogicalNodeType

export class LayoutResult {
  static skip = new LayoutResult('skip');
  static pageBreak = new LayoutResult('page-break');
  static lineBreak = new LayoutResult('line-break');
  static logicalNode(type: LogicalNodeType, node: ILogicalNode): LayoutResult {
    return new LayoutResult(type, node);
  }

  private constructor(public type: LayoutResultType, public body?: any) { }

  get isFloatable(): boolean {
    switch (this.type) {
      case 'block':
      case 'inline-block':
      case 're-block':
        return true;
    }
    return false;
  }
}
