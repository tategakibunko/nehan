import {
  ICharacter,
  LogicalSize,
  SpaceCharInfo,
  SpaceCharTable,
  NativeStyleMap,
  Font,
  TextEmphaData,
  ILogicalNodeEvaluator,
} from "./public-api";

// more detailed version
// let rexSpace = /^[\u0009-\u000D\u001C-\u/0020\u00A0\u034F\u11A3-\u11A7\u1680\u180E\u2000-\u200F\u2028-\u202E\u2061-\u2063\u3000\u3164\uFEFE]/;

export class SpaceChar implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public info: SpaceCharInfo;
  public kerning: boolean;
  public spacing: number;
  public charCount: number;

  static zeroWidthSpace: string = "\u200B";
  static enSpace: string = "\u2002";
  static emSpace: string = "\u2003";
  static noBreakSpace: string = "\u00A0";
  static ideographicSpace: string = "\u3000";
  static markerSpace: string = SpaceChar.enSpace;

  static charRefToStr(str: string): string {
    switch (str) {
      case "&nbsp;": return "\u00A0";
      case "&thinsp;": return "\u2009";
      case "&ensp;": return "\u2002";
      case "&emsp;": return "\u2003";
    }
    throw new Error("invalid space char ref(" + str + ")");
  }

  public constructor(str: string) {
    this.text = this.normalize(str);
    this.size = new LogicalSize({ measure: 0, extent: 0 });
    this.info = SpaceCharTable.load(str);
    this.kerning = false;
    this.spacing = 0;
    this.charCount = 0; // not count as normal character.
  }

  protected normalize(str: string): string {
    if (str.indexOf("&") === 0) {
      return SpaceChar.charRefToStr(str);
    }
    return str;
  }

  public getCssVert(): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("height", this.size.measure + "px");
    return css;
  }

  public setMetrics(opts: {
    font: Font;
    isVertical: boolean;
    empha?: TextEmphaData;
  }) {
    this.size.measure = Math.floor(this.info.advanceRate * opts.font.size);
    this.size.extent = opts.font.size;
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

  public acceptEvaluator(visitor: ILogicalNodeEvaluator): Node {
    return visitor.visitSpaceChar(this);
  }
}
