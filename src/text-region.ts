import {
  ICharacter,
  FlowRegion,
  Word,
  BoxEnv,
  LogicalSize,
  LogicalBox
} from "./public-api";

export class TextRegion extends FlowRegion {
  public addOverflowWord(word: Word): boolean {
    let delta = this.restContextBoxMeasure; // use rest measure inside.
    return this.addInline(word, delta);
  }

  public popCharacter(): ICharacter | undefined {
    return this.content.popInline() as ICharacter;
  }

  public pushCharacter(char: ICharacter) {
    this.content.addInline(char);
  }

  public roundHyphenationPopCount(pop_count: number): number {
    return this.content.roundInlineCount1(pop_count);
  }

  public breakWord(word: Word): Word {
    let rest_measure = this.restContextBoxMeasure;
    let word_head = word.breakWord(rest_measure);
    word_head.setMetrics({
      font: this.context.env.font,
      isVertical: this.context.env.isTextVertical(),
    });
    word_head.size.measure = rest_measure; // force set measure(just size to fit line-max).
    return word_head;
  }

  // If brasagari is set by hyphenation, force use parent max measure
  // and enable skipping of continuous <br> to avoid double line-break.
  // See 'FlowContext::removeBrAfterLine'.
  public createTextBoxSize(overflow: boolean, brasagari: boolean): LogicalSize {
    const measure = brasagari ? this.maxSpaceMeasure : this.cursor.start;
    const extent = this.context.env.fontSize;
    return new LogicalSize({ measure, extent });
  }

  public createTextBox(env: BoxEnv, overflow: boolean, brasagari: boolean): LogicalBox {
    let size = this.createTextBoxSize(overflow, brasagari);
    return this.content.createTextBox(env, size);
  }

  public get restContextBoxMeasure(): number {
    return this.maxSpaceMeasure - this.cursor.start;
  }

  // use parent rest measure.
  public get maxSpaceMeasure(): number {
    let float_region = this.getFloatRegion();
    if (float_region) {
      return this.context.region.restSpaceMeasure;
    }
    return this.context.region.restContextBoxMeasure;
  }
}
