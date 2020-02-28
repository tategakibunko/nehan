import {
  ICharacter,
  LogicalSize,
  Font,
  TextEmphaData,
  TextMeasure,
} from "./public-api";

export class Tcy implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public kerning: boolean;
  public spacing: number;
  public charCount: number;

  public constructor(str: string) {
    this.text = str;
    this.size = new LogicalSize({ measure: 0, extent: 0 });
    this.kerning = false;
    this.spacing = 0;
    this.charCount = str.length;
  }

  public setMetrics(opts: {
    font: Font;
    isVertical: boolean;
    empha?: TextEmphaData;
  }) {
    if (opts.isVertical) {
      this.size.measure = opts.font.size;
      this.size.extent = opts.font.size;
    } else {
      this.size = TextMeasure.getWordSize(opts.font, this.text);
    }
  }

  public toString(): string {
    return this.text;
  }
}
