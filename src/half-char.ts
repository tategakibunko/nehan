import {
  ICharacter,
  LogicalSize,
  LogicalBox,
  BoxEnv,
  NativeStyleMap
} from "./public-api";

// HALF-WIDTH LETTERS
export class HalfChar implements ICharacter {
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
    this.size.measure = env.isTextVertical()? env.fontSize : Math.floor(env.fontSize / 2);
    this.size.extent = env.fontSize;
    if(env.isTextEmphasized()){
      this.hasEmphasis = true;
      this.size.extent = env.fontSize * 2;
    }
  }

  public getCssVert(box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("text-align", "center");
    if(this.text.length === 2){
      css.set("padding-left", Math.floor(box.fontSize / 4) + "px");
    }
    return css;
  }

  public toString(): string {
    return this.text;
  }
}
