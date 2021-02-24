import {
  ReFormatContext,
  LogicalSize,
} from './public-api';

export interface IReResizer {
  resize: (context: ReFormatContext, originalSize: LogicalSize, maxSize: LogicalSize) => LogicalSize;
}

export class ReShrinkResizer implements IReResizer {
  static instance = new ReShrinkResizer();
  protected constructor() { }

  resize(context: ReFormatContext, originalSize: LogicalSize, maxSize: LogicalSize): LogicalSize {
    return originalSize.resize(maxSize);
  }
}

// Resizer that doesn't change original size.
export class ReIdResizer implements IReResizer {
  static instance = new ReIdResizer();
  protected constructor() { }

  resize(_context: ReFormatContext, originalSize: LogicalSize, _maxSize: LogicalSize): LogicalSize {
    return originalSize;
  }
}
