import {
  FlowRegion,
  Word,
} from "./public-api";

export class TextRegion extends FlowRegion {
  public addOverflowWord(word: Word): boolean {
    let delta = this.restContextBoxMeasure; // use rest measure inside.
    return this.addInline(word, delta);
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
