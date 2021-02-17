import {
  ILogicalNode,
  IFlowRootFormatContext,
} from './public-api';

export interface DomCallbackContext {
  selector: string;
  name: string; // callback name like '@create'
  box: ILogicalNode;
  dom: HTMLElement;
  flowRoot: IFlowRootFormatContext;
}

