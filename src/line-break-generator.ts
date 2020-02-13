import {
  InlineNodeGenerator,
  LayoutResult,
} from './public-api';

// ----------------------------------------------------------------------
// () -> line-break
// ----------------------------------------------------------------------
export class LineBreakGenerator extends InlineNodeGenerator {
  protected *createGenerator(): Generator<LayoutResult> {
    while (this.context.restExtent < this.context.env.font.lineExtent) {
      yield LayoutResult.pageBreak;
    }
    yield LayoutResult.lineBreak;
  }
}
