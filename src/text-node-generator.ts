import {
  Config,
  ILogicalNodeGenerator,
  LayoutResult,
  ICharacter,
  Word,
  DualChar,
  SpaceChar,
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
      const lineExtent = font.lineExtent;
      const empha = this.context.env.textEmphasis.isNone() ? undefined : this.context.env.textEmphasis.textEmphaData;
      const isPre = this.context.env.whiteSpace.isPre();
      const isVertical = this.context.env.writingMode.isTextVertical();
      // Note that this metricsArgs can be updated if parent is <::first-line>.
      const metricsArgs = { font, isVertical, empha };
      const isLineHead = this.context.isLineHead();

      if (this.context.restExtent < lineExtent) {
        yield LayoutResult.pageBreak(this.context, "lineExtent is not enough for text-fmt-context");
      }
      if (isLineHead) {
        // console.log("lineHead:", this.context);
        if (this.context.maxMeasure < font.size) {
          yield LayoutResult.skip(this.context, "too narrow space");
          break;
        }
      }
      const token: ICharacter = lexer.getNext();
      if (Config.debugCharacter) {
        console.log("restM:%d, token:%o", this.context.restMeasure, token);
      }

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
          // overflow-wrap: break-word
          if (isLineHead && this.context.env.overflowWrap.isBreakWord()) {
            lexer.pushBack();
            this.context.addCharacter(token.breakWord(this.context.restMeasure));
          }
          // word-break: break-all
          else if (this.context.env.wordBreak.isBreakAll()) {
            lexer.pushBack();
            this.context.addCharacter(token.breakWord(this.context.restMeasure));
          }
          // line-head, but too long word.
          else if (isLineHead) {
            this.context.addCharacter(token); // will overflow, but ignore!
          }
          // move this word to head of next line.
          else {
            lexer.pushBack();
            this.hyphenator.hyphenate(this.context);
          }
          yield this.context.acceptLayoutReducer(this.reducer, true);
          yield LayoutResult.lineBreak(this.context, "long word is broken by word-break: break-all");
        } else if (token instanceof SpaceChar) {
          const prevToken = lexer.peek(-2);
          const nextToken = lexer.peek();
          // Omit a space at the beginning of a line surrounded by two words.
          //
          // ...... [word1]
          // [space][word2]
          // =>
          // ...... [word1]
          // [word2]
          if (!(prevToken instanceof Word && nextToken instanceof Word)) {
            // If this space is not between two words, we have to add it at the begining of next line.
            lexer.pushBack();
          }
          /* else {
            console.log("skip heading space token between two words(%s, %s)", prevToken.text, nextToken.text);
          }
          */
          this.hyphenator.hyphenate(this.context);
          yield this.context.acceptLayoutReducer(this.reducer, true);
          yield LayoutResult.lineBreak(this.context, "char token overflows measure(by spaceChar)");
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

