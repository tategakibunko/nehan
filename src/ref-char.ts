import {
  ICharacter,
  LogicalSize,
  Font,
} from "./public-api";

export class RefChar implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public hasEmphasis: boolean;
  public kerning: boolean;
  public spacing: number;
  public charCount: number;

  static softHyphen: string = "&shy;";

  public constructor(str: string) {
    this.text = str;
    this.size = new LogicalSize({ measure: 0, extent: 0 });
    this.hasEmphasis = false;
    this.kerning = false;
    this.spacing = 0;
    this.charCount = 1;
  }

  public setMetrics(opts: {
    font: Font,
    isVertical: boolean;
    isEmphasized: boolean;
  }) {
    this.size.measure = opts.font.size;
    this.size.extent = opts.font.size;
  }

  public toString(): string {
    return this.text;
  }
}
