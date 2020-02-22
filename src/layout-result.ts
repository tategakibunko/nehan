import {
  ILogicalNode,
} from './public-api'

export type LogicalNodeType =
  'block' |
  'line' |
  'inline' |
  'text' |
  'table-cell' |
  'table-cells' |
  'empha' |
  'ruby' |
  'ruby-text' |
  'ruby-base' |
  'list-marker' |
  'tcy'

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
