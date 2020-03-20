import {
  ILogicalNode,
} from './public-api';

export interface Page {
  node: ILogicalNode;
  dom?: HTMLElement | Node;
  index: number;
  progress: number;
  charCount: number;
  acmCharCount: number;
}
