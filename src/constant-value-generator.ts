import {
  InlineNodeGenerator,
  LayoutResult,
  FlowFormatContext,
} from './public-api';

export class ConstantValueGenerator extends InlineNodeGenerator {
  constructor(context: FlowFormatContext, private value: LayoutResult) {
    super(context);
  }

  protected *createGenerator(): Generator<LayoutResult> {
    yield this.value;
  }
}
