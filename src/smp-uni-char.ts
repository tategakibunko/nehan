import {
  ICharacter,
  LogicalSize,
  Font,
  TextEmphaData,
  ILogicalNodeEvaluator,
} from "./public-api";

// Unicode on Supplementary Multilingual Plane(SMP).
export class SmpUniChar implements ICharacter {
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
    font: Font,
    isVertical: boolean;
    empha?: TextEmphaData;
  }) {
    this.size.measure = opts.font.size;
    this.size.extent = opts.font.size;
    this.empha = opts.empha;
    if (opts.empha) {
      this.size.extent = Math.floor(opts.font.size * 1.5);
    }
  }

  public toString(): string {
    return this.text;
  }

  public acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement | Node {
    if (this.empha) {
      return visitor.visitCharEmpha(this, this.empha);
    }
    return visitor.visitSmpUniChar(this);
  }
}
