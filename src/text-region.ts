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

  public pushCharacter(char: ICharacter){
    this.content.addInline(char);
  }

  public roundHyphenationPopCount(pop_count: number): number {
    return this.content.roundInlineCount1(pop_count);
  }

  public breakWord(word: Word): Word {
    let rest_measure = this.restContextBoxMeasure;
    let word_head = word.breakWord(rest_measure);
    word_head.setMetrics(this.context.env);
    word_head.size.measure = rest_measure; // force set measure(just size to fit line-max).
    return word_head;
  }

  public createTextBoxSize(overflow: boolean): LogicalSize {
    return new LogicalSize({
      measure: this.cursor.start,
      extent: this.context.env.fontSize
    });
  }

  public createTextBox(env: BoxEnv, overflow: boolean): LogicalBox {
    let size = this.createTextBoxSize(overflow);
    return this.content.createTextBox(env, size);
  }

  public get restContextBoxMeasure(): number {
    return this.maxSpaceMeasure - this.cursor.start;
  }

  // use parent rest measure.
  public get maxSpaceMeasure(): number {
    let float_region = this.getFloatRegion();
    if(float_region){
      return this.context.region.restSpaceMeasure;
    }
    return this.context.region.restContextBoxMeasure;
  }
}
