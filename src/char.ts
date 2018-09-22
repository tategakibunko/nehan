import {
  ICharacter,
  LogicalSize,
  BoxEnv
} from "./public-api";

export class Char implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public pos: number;
  public hasEmphasis: boolean;
  public kerning: boolean;
  public spacing: number;

  public constructor(str: string){
    this.text = str;
    this.pos = -1;
    this.size = new LogicalSize({measure:0, extent:0});
    this.hasEmphasis = false;
    this.kerning = false;
    this.spacing = 0;
  }

  public get charCount(): number {
    return 1;
  }

  public setMetrics(env: BoxEnv) {
    this.size.measure = env.fontSize;
    this.size.extent = env.fontSize;
    if(env.isTextEmphasized()){
      this.hasEmphasis = true;
      this.size.extent = env.fontSize * 2;
    }
  }

  public toString(): string {
    return this.text;
  }
}
