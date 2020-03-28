import {
  ICharacter,
  LogicalSize,
  Font,
  NativeStyleMap,
  TextEmphaData,
  ILogicalNodeEvaluator,
} from "./public-api";

// HALF-WIDTH LETTERS
export class HalfChar implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public kerning: boolean;
  public spacing: number;
  public charCount: number;
  public empha?: TextEmphaData;

  public constructor(str: string) {
    this.text = str;
    this.size = new LogicalSize({ measure: 0, extent: 0 });
    this.kerning = false;
    this.spacing = 0;
    this.charCount = 1;
  }

  public setMetrics(opts: {
    font: Font;
    isVertical: boolean;
    empha?: TextEmphaData;
  }) {
    this.size.measure = opts.isVertical ? opts.font.size : Math.floor(opts.font.size / 2);
    this.size.extent = opts.font.size;
    this.empha = opts.empha;
    if (opts.empha) {
      this.size.extent = opts.font.size * 2;
    }
  }

  public toString(): string {
    return this.text;
  }

  public acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement | Node {
    return visitor.visitHalfChar(this);
  }
}
