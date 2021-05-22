import {
  Font,
  ICharacter,
  BoxEnv,
  LogicalSize,
  DualCharInfo,
  TextEmphaData,
  ILogicalNodeEvaluator,
} from "./public-api";

// characters that depend on writing-mode(vertical or horizontal).
export class DualChar implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public info: DualCharInfo;
  public kerning: boolean;
  public spacing: number;
  public charCount: number;
  public empha?: TextEmphaData;

  public constructor(str: string, info: DualCharInfo) {
    this.text = str;
    this.size = new LogicalSize({ measure: 0, extent: 0 });
    this.info = info;
    this.kerning = false;
    this.spacing = 0;
    this.charCount = 1;
  }

  public isParen(): boolean {
    return this.isOpenParen() || this.isCloseParen();
  }

  public isOpenParen(): boolean {
    return this.info.parenType === "open";
  }

  public isCloseParen(): boolean {
    return this.info.parenType === "close";
  }

  public isTailNg(): boolean {
    return this.info.kinsokuPos === "tail";
  }

  public isHeadNg(): boolean {
    return this.info.kinsokuPos === "head";
  }

  public isKernEnable(): boolean {
    return this.info.kernEnable;
  }

  public isHangEnable(): boolean {
    return this.info.hangEnable;
  }

  public isSmall(): boolean {
    return this.info.isSmall;
  }

  public setMetrics(opts: {
    font: Font,
    isVertical: boolean;
    empha?: TextEmphaData;
  }) {
    this.size.measure = opts.font.size;
    this.size.extent = opts.font.size;
    this.empha = opts.empha;
    if (this.kerning && this.isKernEnable()) {
      this.size.measure = Math.floor(opts.font.size / 2);
    }
  }

  public toString(): string {
    return this.text;
  }

  public acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement | Node {
    // {HIRAGANA, KATAKANA} LETTER SMALL [A-O]
    if (this.empha && this.info.parenType === "none") {
      return visitor.visitCharEmpha(this, this.empha);
    }
    if (this.kerning) {
      return visitor.visitDualCharKern(this);
    }
    return visitor.visitDualChar(this);
  }
}
