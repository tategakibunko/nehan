import {
  ICharacter,
  LogicalSize,
  Tcy,
  Font,
  TextEmphaData,
  TextMeasure,
  ILogicalNodeEvaluator,
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
    const headLen = Math.floor(this.text.length * measure / this.size.measure);
    const headText = this.text.substring(0, headLen);
    const tailText = this.text.substring(headLen);
    this.text = tailText;
    return new Word(headText);
  }

  // [Deprecated]
  public restoreBrokenWord(word: Word) {
    //console.log("restore broken word!: [%s]->[%s]", this.text, word.text + this.text);
    this.text = word.text + this.text;
  }

  public acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement | Node {
    return visitor.visitWord(this);
  }
}
