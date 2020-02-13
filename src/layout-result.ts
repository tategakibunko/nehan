import {
  ILogicalNode,
} from './public-api'

type LogicalNodeType =
  'block' |
  'line' |
  'inline' |
  'text' |
  'table-cell' |
  'empha' |
  'ruby' |
  'ruby-text' |
  'ruby-base' |
  'tcy'

type LayoutValueType =
  'skip' |
  'request-measure' |
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

  static requestMeasure(measure: number): LayoutResult {
    return new LayoutResult('request-measure', measure);
  }
}
