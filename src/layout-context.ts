/*
import {
  HtmlElement,
  LayoutValue,
} from "./public-api";

export let getContextName = (element: HtmlElement, title = ""): string => {
  let path = element.toString(true).replace("html>", "");
  let postfix = title? `(${title})` : "";
  return path + postfix;
}

export interface ILayoutContext {
  // context name
  name: string;

  // html element of context
  element: HtmlElement;

  // local progress(0.0 to 1.0)
  progress: number;

  // called by 'parent' generator if yielded layout is accepted by parent generator.
  commit: () => void;

  // rollback context to the state when 'save' method was called.
  // this is called from 'parent' generator when yielded layout is rejected by parent generator.
  rollback: () => void;

  // return true if more layout is rest.
  hasNext: () => boolean;

  // get next layout from geneartor.
  getNext: () => IteratorResult<LayoutValue []>;

  // called to pause generator for next page resume.
  pause: () => void;

  // called to abort generator when something fatal happen.
  abort: () => void;

  // called to resume paused generator.
  resume: () => void;

  // called when body create next page and required to reload dynamic css.
  updateStyle: () => void;

  // called from parent gen to notify lead generator changes.
  updateLead: () => void;

  // if context is control-context(like br), it's false.
  isLayout: () => boolean;

  // is float(start or end)?
  isFloat: () => boolean;

  // is 'outside flow of context' block-level?
  isBlockLevel: () => boolean;

  // is position:absolute?
  isPositionAbsolute: () => boolean;

  // is generator running normally?
  isStatusNormal: () => boolean;
}
*/
