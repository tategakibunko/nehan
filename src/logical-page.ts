import {
  LogicalBox,
} from "./public-api";

export interface LogicalPage {
  index: number,
  charCount: number,
  box: LogicalBox,
  dom: HTMLElement | null,
}
