import {
  ILogicalNodeGenerator,
  LayoutResult,
  ILayoutReducer,
  ReFormatContext,
  LogicalSize,
  PhysicalSize,
  ReReducer,
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

export class ReNodeGenerator implements ILogicalNodeGenerator {
  private generator: Generator<LayoutResult>;

  constructor(
    public context: ReFormatContext,
    protected reducer: ILayoutReducer = ReReducer.instance,
    protected resizer: IReResizer = ReNormalResizer.instance,
  ) {
    this.generator = this.createGenerator();
  }

  public getNext(): LayoutResult | undefined {
    const next = this.generator.next();
    return next.done ? undefined : next.value;
  }

  protected *createGenerator(): Generator<LayoutResult> {
    console.group(`${this.context.name}`);
    const writingMode = this.context.env.writingMode;
    const maxSize = new LogicalSize({
      measure: this.context.maxMeasure - this.context.env.edge.measure,
      extent: this.context.maxExtent - this.context.env.edge.extent
    });
    let physicalSize = PhysicalSize.load(this.context.env.element);
    let logicalSize = physicalSize.getLogicalSize(writingMode);
    if (logicalSize.extent > maxSize.extent || logicalSize.measure > maxSize.measure) {
      logicalSize = this.resizer.resize(this.context, logicalSize, maxSize);
      physicalSize = logicalSize.getPhysicalSize(writingMode);
    }
    while (this.context.restExtent < logicalSize.extent) {
      yield LayoutResult.pageBreak;
    }
    yield this.context.acceptLayoutReducer(this.reducer, logicalSize, physicalSize);
    console.groupEnd();
  }
}

