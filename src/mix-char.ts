import {
  ICharacter,
  LogicalSize,
  Font,
} from "./public-api";

// ligature
export class MixChar implements ICharacter {
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
    if (opts.isVertical) {
      this.size.measure = opts.font.size;
    } else {
      this.size.measure = Math.floor(opts.font.size * 1.25);
    }
    this.size.extent = opts.font.size;

  }

  public toString(): string {
    return this.text;
  }
}
