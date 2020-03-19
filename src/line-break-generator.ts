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
      yield LayoutResult.pageBreak(this.context, "line break, lineExtent not enough");
    }
    yield LayoutResult.lineBreak(this.context, "<br>");
  }
}
