import {
  LogicalBox,
} from "./public-api";

export interface LogicalPage {
  index: number;
  progress: number;
  charCount: number;
  box: LogicalBox;
  dom: HTMLElement | null;
}
