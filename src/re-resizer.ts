import {
  ReFormatContext,
  LogicalSize,
} from './public-api';

export interface IReResizer {
  resize: (context: ReFormatContext, originalSize: LogicalSize, maxSize: LogicalSize) => LogicalSize;
}

export class ReNormalResizer implements IReResizer {
  static instance = new ReNormalResizer();
  protected constructor() { }

  resize(context: ReFormatContext, originalSize: LogicalSize, maxSize: LogicalSize): LogicalSize {
    return originalSize.resize(maxSize);
  }
}

