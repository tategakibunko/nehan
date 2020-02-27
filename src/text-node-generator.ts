import {
  ILogicalNodeGenerator,
  LayoutResult,
  ICharacter,
  Word,
  ILayoutReducer,
  TextFormatContext,
  TextReducer,
  IHyphenator,
  Hyphenator,
} from './public-api'


// ----------------------------------------------------------------------
// ICharacter* -> text-box
// ----------------------------------------------------------------------
export class TextNodeGenerator implements ILogicalNodeGenerator {
  private generator: Generator<LayoutResult>;

  constructor(
    public context: TextFormatContext,
    private reducer: ILayoutReducer = TextReducer.instance,
    private hyphenator: IHyphenator = Hyphenator.instance,
  ) {
    this.generator = this.createGenerator();
  }

  public getNext(): LayoutResult | undefined {
    const next = this.generator.next();
    return next.done ? undefined : next.value;
  }

  private *createGenerator(): Generator<LayoutResult> {
    console.group("(text)");
    const env = this.context.env;
    const font = this.context.env.font;
    const empha = env.isTextEmphasized() ? env.textEmphasis.textEmphaData : undefined;
    const lineExtent = this.context.env.font.lineExtent;
    const isVertical = env.isTextVertical();
    const metricsArgs = { font, isVertical, empha };

    while (this.context.lexer.hasNext()) {
      while (this.context.restExtent < lineExtent) {
        yield LayoutResult.pageBreak;
      }
      if (this.context.isLineHead()) {
        if (this.context.maxMeasure < font.size) {
          console.warn("too narrow space, skip:", this.context);
          yield LayoutResult.skip;
          break;
        }
        while (this.context.restMeasure < font.size) {
          yield LayoutResult.lineBreak;
        }
      }
      const token: ICharacter = this.context.lexer.getNext();
      // console.log("restM:%d, token:%o", this.context.restMeasure, token);

      // We calculate character metrics when
      // 1. metrics is not set yet(token.size.measure === 0)
      // 2. target character is Word(can be divided by word-break).
      if (token.size.measure === 0 || token instanceof Word) {
        token.setMetrics(metricsArgs);
      }
      if (this.context.restMeasure < token.size.measure) {
        this.context.lexer.pushBack();
        this.hyphenator.hyphenate(this.context);
        yield this.context.acceptLayoutReducer(this.reducer, true);
        yield LayoutResult.lineBreak;
      } else {
        this.context.addCharacter(token);
      }
    } // while(lexer.hasNext())

    if (this.context.children.length > 0) {
      yield this.context.acceptLayoutReducer(this.reducer, false);
    }
    console.groupEnd();
  }
}

