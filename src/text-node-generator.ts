import {
  ILogicalNodeGenerator,
  LayoutResult,
  ICharacter,
  Word,
  DualChar,
  ILayoutReducer,
  TextFormatContext,
  TextReducer,
  IHyphenator,
  Hyphenator,
  IKerning,
  Kerning,
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
    private kerning: IKerning = Kerning.instance,
  ) {
    this.generator = this.createGenerator();
  }

  public getNext(): LayoutResult | undefined {
    const next = this.generator.next();
    return next.done ? undefined : next.value;
  }

  private *createGenerator(): Generator<LayoutResult> {
    // console.group("(text)");
    const lexer = this.context.lexer;

    while (this.context.lexer.hasNext()) {
      const font = this.context.env.font;
      const empha = this.context.env.isTextEmphasized() ? this.context.env.textEmphasis.textEmphaData : undefined;
      const isPre = this.context.env.whiteSpace.isPre();
      const isVertical = this.context.env.isTextVertical();
      // Note that metrics can be updated when parent is <::first-line>.
      const metricsArgs = { font, isVertical, empha };

      while (this.context.restExtent < font.lineExtent) {
        yield LayoutResult.pageBreak(this.context, "lineExtent is not enough for text-fmt-context");
      }
      if (this.context.isLineHead()) {
        // console.log("lineHead:", this.context);
        if (this.context.maxMeasure < font.size) {
          yield LayoutResult.skip(this.context, "too narrow space");
          break;
        }
      }
      const token: ICharacter = lexer.getNext();
      // console.log("restM:%d, token:%o", this.context.restMeasure, token);

      // if white-space:pre, yield line-break with current text block.
      if (isPre && token.text === "\n") {
        yield this.context.acceptLayoutReducer(this.reducer, false);
        yield LayoutResult.lineBreak(this.context, "CRLF in white-space:pre");
        continue;
      }

      // We calculate character metrics when
      // 1. metrics is not set yet(token.size.measure === 0)
      // 2. target character is Word(can be divided by word-break).
      if (token.size.measure === 0 || token instanceof Word) {
        token.setMetrics(metricsArgs);
      }
      // try to set kerning
      if (token instanceof DualChar && token.isKernEnable()) {
        const prev = lexer.peek(-2); // lexer pos is already added by getNext, so get prev of prev.
        if (prev instanceof DualChar && this.kerning.set(token, prev)) {
          token.setMetrics(metricsArgs); // calc metrics again
        }
      }
      if (this.context.restMeasure < token.size.measure) {
        if (token instanceof Word) {
          // word-break: break-all
          if (this.context.env.wordBreak.isBreakAll()) {
            lexer.pushBack();
            this.context.addCharacter(token.breakWord(this.context.restMeasure));
          } else if (this.context.isLineHead()) { // line-head, but too long word.
            this.context.addCharacter(token); // will overflow, but ignore!
          } else {
            lexer.pushBack();
          }
          yield this.context.acceptLayoutReducer(this.reducer, true);
          yield LayoutResult.lineBreak(this.context, "long word is broken by word-break: break-all");
        } else {
          lexer.pushBack();
          this.hyphenator.hyphenate(this.context);
          yield this.context.acceptLayoutReducer(this.reducer, true);
          yield LayoutResult.lineBreak(this.context, "char token overflows measure");
        }
      } else {
        this.context.addCharacter(token);
      }
    } // while(lexer.hasNext())

    if (this.context.characters.length > 0) {
      yield this.context.acceptLayoutReducer(this.reducer, false);
    }
    // console.groupEnd();
  }
}

