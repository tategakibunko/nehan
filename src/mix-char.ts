import {
  ICharacter,
  LogicalSize,
  BoxEnv,
} from "./public-api";

// ligature
export class MixChar implements ICharacter {
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

  public setMetrics(env: BoxEnv){
    if(env.isTextVertical()){
      this.size.measure = env.fontSize;
    } else {
      this.size.measure = Math.floor(env.fontSize * 1.25);
    }
    this.size.extent = env.fontSize;
    
  }

  public toString(): string {
    return this.text;
  }
}
