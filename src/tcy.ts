import {
  ICharacter,
  LogicalSize,
  BoxEnv,
  Word,
} from "./public-api";

export class Tcy implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public hasEmphasis: boolean;
  public kerning: boolean;
  public spacing: number;

  public constructor(str: string){
    this.text = str;
    this.size = new LogicalSize({measure:0, extent:0});
    this.hasEmphasis = false;
    this.kerning = false;
    this.spacing = 0;
  }

  public get charCount(): number {
    return this.text.length;
  }

  public setMetrics(env: BoxEnv){
    if(env.isTextVertical()){
      this.size.measure = env.fontSize;
      this.size.extent = env.fontSize;
    } else {
      this.size = Word.getLogicalSize(env.font, this.text);
    }
  }

  public toString(): string {
    return this.text;
  }
}
