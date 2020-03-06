import {
  LogicalSize
} from "./public-api";

export interface LogicalBaseLineMetrics {
  size: LogicalSize;
  textBodySize: LogicalSize;
  startOffset: number;
  blockOffset: number;
}
