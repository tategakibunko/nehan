import {
  ILogicalNode,
} from './public-api'

export type LogicalNodeType =
  'block' |
  'line' |
  'inline' |
  'text' |
  'table-cells' |
  'table-row' |
  'table-row-group' |
  'table' |
  'ruby' |
  'ruby-text' |
  'ruby-base' |
  'list-marker'

type LayoutValueType =
  'skip' |
  'page-break' |
  'line-break' |
  LogicalNodeType

export class LayoutResult {
  static skip = new LayoutResult('skip');
  static pageBreak = new LayoutResult('page-break');
  static lineBreak = new LayoutResult('line-break');

  constructor(public type: LayoutValueType, public body?: any) { }

  static logicalNode(type: LogicalNodeType, node: ILogicalNode): LayoutResult {
    return new LayoutResult(type, node);
  }
}
