import {
  ILogicalNode,
} from './public-api';

export interface Page {
  node: ILogicalNode;
  dom?: HTMLElement;
  index: number;
  progress: number;
  charCount: number;
  acmCharCount: number;
}
