import {
  Utils,
  BasicStyle,
  Config,
  CssText,
  CssLength,
  PropValue,
  HtmlElement,
  CssCascade,
  LayoutParent,
  NativeStyleMap,
  PseudoElement,
  LogicalBox,
  ILogicalCssEvaluator,
  Lexer,
} from "./public-api";

export interface FontShorthand {
  "font-style"?: string,
  "font-variant"?: string,
  "font-weight"?: string,
  "font-stretch"?: string,
  "line-height"?: string, // 'px' format or float format.
  "font-size": string, // mandatory
  "font-family": string // mandatory
};

type FontShorthandKey = keyof FontShorthand

export enum FontSizeKeyword {
  XX_SMALL = "xx-small",
  X_SMALL = "x-small",
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  X_LARGE = "x-large",
  XX_LARGE = "xx-large"
}

export enum FontSizeKeywordRelative {
  SMALLER = "smaller",
  LARGER = "larger"
}

export const FontSizeKeywords = Utils.Enum.toValueArray(FontSizeKeyword)
export const FontSizeKeywordsRelative = Utils.Enum.toValueArray(FontSizeKeywordRelative)

export const FontSizeKeywordSize: { [keyword: string]: number } = {
  "xx-small": 8,
  "x-small": 10,
  "small": 13,
  "medium": 16,
  "large": 18,
  "x-large": 24,
  "xx-large": 33
}

export const FontSizeKeywordRelativeSize: { [keyword: string]: string } = {
  "smaller": "0.8em",
  "larger": "1.2em",
}

class FontShorthandLexer extends Lexer<string> {
  static rexQuotedString = /^'[^']+'/;
  normalize(src: string) {
    return src.trim();
  }

  private peekQuotedString(): string {
    const match = FontShorthandLexer.rexQuotedString.exec(this.buff);
    if (match) {
      const token = match[0];
      this.stepBuff(token.length);
      return token;
    }
    return "";
  }

  private peekUntilSpace(): string {
    const spacePos = this.buff.indexOf(" ");
    if (spacePos < 0) {
      this.stepBuff(this.buff.length);
      return this.buff;
    }
    const token = this.buff.substring(0, spacePos);
    this.stepBuff(spacePos + 1);
    return token;
  }

  createToken(): string {
    return this.peekQuotedString() || this.peekUntilSpace();
  }
}

class FontShorthandParser {
  constructor(private lexer: Lexer<string>) { }

  parseLineHeight(fontSize: string): string {
    if (fontSize.indexOf("/") < 0) {
      return "normal";
    }
    return fontSize.split("/")[1].trim();
  }

  inferOptPropByValue(value: string, optIndex: number, optLength: number): FontShorthandKey {
    if (/^[1-9]00$/.test(value)) {
      return "font-weight";
    }
    if (value.indexOf("condensed") >= 0 || value.indexOf("expanded") >= 0) {
      return "font-stretch";
    }
    // const optProps = ["font-style", "font-variant", "font-weight", "font-stretch"];
    switch (value) {
      // [TODO]: use optIndex, optLength, and find property-name more wisely.
      case "normal": // font-style or font-variant or font-weight
        return "font-style"; // if ambigous, select font-style.
      case "italic":
      case "oblique":
        return "font-style";
      case "none":
      case "small-caps":
        return "font-variant";
      case "bold":
      case "lighter":
      case "bolder":
        return "font-weight";
      default: break;
    }
    console.error(`invalid optinal value for shorthanded font css:${value}`);
    return "font-style";
  }

  // <style> <variant> <weight> <stretch> <size>/<line-height> <family>
  // opt     opt       opt      opt       must  / opt          must(and last)
  parse(): PropValue<FontShorthandKey, string>[] {
    const src = this.lexer.src;
    const tokens = this.lexer.tokens;
    if (tokens.length < 2) {
      console.warn(`invalid font shorthand, both font-size and font-family must be specified: ${src}`);
      return [];
    }
    if (tokens.length === 2) {
      const fontSize = tokens[0];
      const fontFamily = tokens[1];
      const lineHeight = this.parseLineHeight(fontSize);
      return [
        { prop: "font-family", value: fontFamily },
        { prop: "font-size", value: fontSize },
        { prop: "line-height", value: lineHeight }
      ];
    }
    if (2 < tokens.length && tokens.length < 6) {
      const optValues = tokens.slice(0, -2);
      const fontSize = tokens[tokens.length - 2];
      const fontFamily = tokens[tokens.length - 1];
      const lineHeight = this.parseLineHeight(fontSize);
      let propValues: PropValue<FontShorthandKey, string>[] = [
        { prop: "font-family", value: fontFamily },
        { prop: "font-size", value: fontSize },
        { prop: "line-height", value: lineHeight }
      ];
      optValues.forEach((value, index) => {
        const prop = this.inferOptPropByValue(value, index, optValues.length);
        propValues.push({ prop, value });
      });
      return propValues;
    }
    // tokens.length >= 6
    const fontStyle = tokens[0];
    const fontVariant = tokens[1];
    const fontWeight = tokens[2];
    const fontStretch = tokens[3];
    const fontSize = tokens[4];
    const lineHeight = this.parseLineHeight(fontSize);
    const fontFamily = tokens[5];
    return [
      { prop: "font-style", value: fontStyle },
      { prop: "font-variant", value: fontVariant },
      { prop: "font-weight", value: fontWeight },
      { prop: "font-stretch", value: fontStretch },
      { prop: "font-family", value: fontFamily },
      { prop: "font-size", value: fontSize },
      { prop: "line-height", value: lineHeight }
    ];
  }
}

export class Font {
  public style: string;
  public variant: string;
  public weight: string;
  public stretch: string;
  public size: number;
  public lineHeight: string;
  public family: string;

  constructor() {
    this.style = BasicStyle.getInitialValue("font-style");
    this.variant = BasicStyle.getInitialValue("font-variant");
    this.weight = BasicStyle.getInitialValue("font-weight");
    this.stretch = BasicStyle.getInitialValue("font-stretch");
    this.size = Config.defaultFontSize;
    this.lineHeight = String(Config.defaultLineHeight);
    this.family = Config.defaultFontFamily;
  }

  public get css(): string {
    return [
      this.style,
      this.variant,
      this.weight,
      this.stretch,
      [this.size + "px", this.lineHeight].join("/"),
      this.family
    ].join(" ");
  }

  // computed value of line-height is ${float} or ${number}px format.
  // so this getter returns correct px value after css loading of this element.
  public get lineExtent(): number {
    if (this.lineHeight.indexOf("px") >= 0) {
      return Utils.atoi(this.lineHeight);
    }
    return Math.floor(parseFloat(this.lineHeight) * this.size);
  }

  static parseShorthand(text: CssText): PropValue<FontShorthandKey, string>[] {
    const lexer = new FontShorthandLexer(text.value);
    const parser = new FontShorthandParser(lexer);
    const propValue = parser.parse();
    // console.log("shorthanded font:", propValue);
    return propValue;
  }

  static load(element: HtmlElement): Font {
    let font = new Font();
    font.style = CssCascade.getValue(element, "font-style");
    font.variant = CssCascade.getValue(element, "font-variant");
    font.weight = CssCascade.getValue(element, "font-weight");
    font.stretch = CssCascade.getValue(element, "font-stretch");
    font.family = CssCascade.getValue(element, "font-family");
    font.size = Utils.atoi(CssCascade.getValue(element, "font-size"), Config.defaultFontSize);
    font.lineHeight = CssCascade.getValue(element, "line-height");
    return font;
  }

  public acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    return visitor.visitFont(this);
  }

  // [NOTE]
  // line-height is fully managed by nehan.js.
  // so don't set line-height settings here.
  public getCss(parent: LayoutParent, box: LogicalBox): NativeStyleMap {
    let css = new NativeStyleMap();
    let parent_font = parent ? parent.env.font : null;
    let is_first_line = PseudoElement.isFirstLine(box.element);
    // apply style if it is not same as parent one,
    // but note that style of <::first-line> is dynamically changed by line number.
    // so style of it is always applied to.
    if (!parent || parent_font && parent_font.style !== this.style || is_first_line) {
      css.set("font-style", this.style);
    }
    if (!parent || parent_font && parent_font.variant !== this.variant || is_first_line) {
      css.set("font-variant", this.variant);
    }
    if (!parent || parent_font && parent_font.weight !== this.weight || is_first_line) {
      css.set("font-weight", this.weight);
    }
    if (!parent || parent_font && parent_font.stretch !== this.stretch || is_first_line) {
      css.set("font-stretch", this.stretch);
    }
    if (!parent || parent_font && parent_font.size !== this.size || is_first_line) {
      css.set("font-size", this.size + "px");
    }
    if (!parent || parent_font && parent_font.family !== this.family || is_first_line) {
      css.set("font-family", this.family);
    }
    return css;
  }
}
