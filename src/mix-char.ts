import {
  ICharacter,
  LogicalSize,
  Font,
  TextEmphaData,
  ILogicalNodeEvaluator,
} from "./public-api";

// ligature
export class MixChar implements ICharacter {
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
    this.charCount = 1;
  }

  public setMetrics(opts: {
    font: Font;
    isVertical: boolean;
    empha?: TextEmphaData;
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

  public acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement | Node {
    return visitor.visitMixChar(this);
  }
}
