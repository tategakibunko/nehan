import {
  ICharacter,
  BoxEnv,
  LogicalSize,
  DualCharTable,
  DualCharInfo,
  KinsokuPos
} from "./public-api";

// characters that depend on writing-mode(vertical or horizontal).
export class DualChar implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public pos: number;
  public hasEmphasis: boolean;
  public info: DualCharInfo;
  public kerning: boolean;
  public spacing: number;

  public constructor(str: string){
    this.text = str;
    this.pos = -1;
    this.size = new LogicalSize({measure:0, extent:0});
    this.hasEmphasis = false;
    this.info = DualCharTable.load(str);
    this.kerning = false;
    this.spacing = 0;
  }

  public get charCount(): number {
    return 1;
  }

  public isTailNg(): boolean {
    return this.info.kinsokuPos === KinsokuPos.TAIL;
  }

  public isHeadNg(): boolean {
    return this.info.kinsokuPos === KinsokuPos.HEAD;
  }

  public isKernEnable(): boolean {
    return this.info.kernEnable;
  }

  public isHangEnable(): boolean {
    return this.info.hangEnable;
  }

  public setMetrics(env: BoxEnv){
    this.size.measure = env.fontSize;
    this.size.extent = env.fontSize;
    if(this.kerning && this.isKernEnable()){
      this.size.measure = Math.floor(env.fontSize / 2);
    }
  }

  public setKerning(env:BoxEnv, enable: boolean){
    if(this.info.kernEnable){
      this.kerning = enable;
      return;
    }
    console.warn("kerning is not allowed for this character:", this);
  }

  public toString(): string {
    return this.text;
  }
}
