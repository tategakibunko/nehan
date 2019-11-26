import {
  ICharacter,
  LogicalSize,
  Font,
} from "./public-api";

export class Char implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public hasEmphasis: boolean;
  public kerning: boolean;
  public spacing: number;
  public charCount: number;

  public constructor(str: string) {
    this.text = str;
    this.size = new LogicalSize({ measure: 0, extent: 0 });
    this.hasEmphasis = false;
    this.kerning = false;
    this.spacing = 0;
    this.charCount = 1;
  }

  public setMetrics(opts: {
    font: Font;
    isVertical: boolean;
    isEmphasized: boolean;
  }) {
    this.size.measure = opts.font.size;
    this.size.extent = opts.font.size;
    if (opts.isEmphasized) {
      this.hasEmphasis = true;
      this.size.extent = opts.font.size * 2;
    }
  }

  public toString(): string {
    return this.text;
  }
}
