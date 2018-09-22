import {
  LogicalBox
} from "./public-api";

export interface DomCallbackContext {
  selector: string,
  name: string,
  box: LogicalBox,
  dom: HTMLElement
}

