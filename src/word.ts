import {
  ICharacter,
  LogicalSize,
  Tcy,
  Font,
  TextEmphaData,
  TextMeasure,
} from "./public-api";

export class Word implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public kerning: boolean;
  public spacing: number;

  public constructor(str: string) {
    this.text = str;
    this.size = new LogicalSize({ measure: 0, extent: 0 });
    this.kerning = false;
    this.spacing = 0;
  }

  public get charCount(): number {
    return this.text.length;
  }

  public toString(): string {
    return this.text;
  }

  public setMetrics(opts: {
    font: Font;
    isVertical: boolean;
    empha?: TextEmphaData;
  }) {
    //this.size = Word.getLogicalSize(opts.font, this.text);
    this.size = TextMeasure.getWordSize(opts.font, this.text);
  }

  public convertTcys(): Tcy[] {
    let tcys: Tcy[] = [];
    for (let i = 0; i < this.text.length; i++) {
      tcys.push(new Tcy(this.text.charAt(i)));
    }
    return tcys;
  }

  // overflow-wrap:break-word
  public breakWord(measure: number): Word {
    const head_len = Math.floor(this.text.length * measure / this.size.measure);
    const head_text = this.text.substring(0, head_len);
    const tail_text = this.text.substring(head_len);
    this.text = tail_text;
    return new Word(head_text);
  }

  public restoreBrokenWord(word: Word) {
    //console.log("restore broken word!: [%s]->[%s]", this.text, word.text + this.text);
    this.text = word.text + this.text;
  }
}
