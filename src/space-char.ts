import {
  ICharacter,
  LogicalSize,
  SpaceCharInfo,
  SpaceCharTable,
  NativeStyleMap,
  BoxEnv,
} from "./public-api";

// more detailed version
// let rexSpace = /^[\u0009-\u000D\u001C-\u/0020\u00A0\u034F\u11A3-\u11A7\u1680\u180E\u2000-\u200F\u2028-\u202E\u2061-\u2063\u3000\u3164\uFEFE]/;

export class SpaceChar implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public pos: number;
  public hasEmphasis: boolean;
  public info: SpaceCharInfo;
  public kerning: boolean;
  public spacing: number;

  static zeroWidthSpace: string = "\u200B";
  static enSpace: string = "\u2002";
  static emSpace: string = "\u2003";
  static noBreakSpace: string = "\u00A0";
  static ideographicSpace: string = "\u3000";
  static markerSpace: string = SpaceChar.enSpace;

  static charRefToStr(str: string): string {
    switch(str){
    case "&nbsp;": return "\u00A0";
    case "&thinsp;": return "\u2009";
    case "&ensp;": return "\u2002";
    case "&emsp;": return "\u2003";
    }
    throw new Error("invalid space char ref(" + str + ")");
  }
  
  public constructor(str: string){
    this.text = this.normalize(str);
    this.pos = -1;
    this.size = new LogicalSize({measure:0, extent:0});
    this.hasEmphasis = false;
    this.info = SpaceCharTable.load(str);
    this.kerning = false;
    this.spacing = 0;
  }

  protected normalize(str: string): string {
    if(str.indexOf("&") === 0){
      return SpaceChar.charRefToStr(str);
    }
    return str;
  }

  // not count as normal character.
  public get charCount(): number {
    return 0;
  }

  public getCssVert(): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("height", this.size.measure + "px");
    return css;
  }

  public setMetrics(env: BoxEnv){
    this.size.measure = Math.floor(this.info.advanceRate * env.fontSize);
    this.size.extent = env.fontSize;
  }

  public toString(): string {
    return this.text;
  }

  public isNoBreak(): boolean {
    return this.info.isNoBreak;
  }

  public isZeroWidth(): boolean {
    return this.info.advanceRate === 0;
  }

  public isCarriageReturn(): boolean {
    return this.text === "\u000D"; // CR
  }

  public isLineFeed(): boolean {
    return this.text === "\u000A"; // LF
  }
}
