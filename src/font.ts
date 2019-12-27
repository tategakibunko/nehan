import {
  Utils,
  DefaultCss,
  Config,
  CssText,
  PropValue,
  HtmlElement,
  CssCascade,
  LayoutParent,
  NativeStyleMap,
  PseudoElement,
  LogicalBox
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

export class Font {
  public style: string;
  public variant: string;
  public weight: string;
  public stretch: string;
  public size: number;
  public lineHeight: string;
  public family: string;

  constructor() {
    this.style = DefaultCss.getInitialValue("font-style");
    this.variant = DefaultCss.getInitialValue("font-variant");
    this.weight = DefaultCss.getInitialValue("font-weight");
    this.stretch = DefaultCss.getInitialValue("font-stretch");
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

  public get lineExtent(): number {
    if (this.lineHeight.indexOf("px") >= 0) {
      return Utils.atoi(this.lineHeight);
    }
    return Math.floor(parseFloat(this.lineHeight) * this.size);
  }

  // infer shorthanded css property by value and defined index.
  static inferProp(value: string, index: number): string {
    if (/^[1-9]00$/.test(value)) {
      return "font-weight";
    }
    if (value.indexOf("condensed") >= 0 || value.indexOf("expanded") >= 0) {
      return "font-stretch";
    }
    let props_of_normal = ["font-style", "font-variant", "font-weight", "font-stretch"];
    switch (value) {
      case "normal": // font-style or font-variant or font-weight
        return props_of_normal[index];
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
    throw new Error("font value (" + value + ") is not available.");
  }

  // <style> <variant> <weight> <stretch> <size>/<line-height> <family>
  // opt     opt       opt      opt       must  / opt          must(and last)
  static parseShorthand(text: CssText): PropValue<string, string>[] {
    let vals = text.split();
    let defaults: FontShorthand = {
      "font-style": "none",
      "font-variant": "normal",
      "font-weight": "normal",
      "font-stretch": "normal",
      "font-size": "",
      "line-height": "none",
      "font-family": ""
    };
    let props = Object.keys(defaults);
    if (vals.length === 1) {
      console.error("syntax error(font shorthand):%s", text.value);
    } else if (vals.length >= 6) {
      props.forEach((prop, i) => {
        defaults[prop as keyof FontShorthand] = vals[i];
      });
    } else {
      for (let i = 0; i < vals.length - 2; i++) {
        let prop = Font.inferProp(vals[i], i);
        defaults[prop as keyof FontShorthand] = vals[i];
      }
      let font_size = vals[vals.length - 2];
      if (font_size && font_size.indexOf("/") > 0) {
        let parts = font_size.split("/");
        defaults["font-size"] = parts[0];
        defaults["line-height"] = parts[1];
      }
      defaults["font-family"] = vals[vals.length - 1];
    }
    return props.map((prop) => {
      let value = defaults[prop as keyof FontShorthand] || "";
      return { prop: prop, value: value };
    });
  }

  static load(element: HtmlElement): Font {
    let font = new Font();
    font.style = CssCascade.getValue(element, "font-style");
    font.variant = CssCascade.getValue(element, "font-variant");
    font.weight = CssCascade.getValue(element, "font-weight");
    font.stretch = CssCascade.getValue(element, "font-stretch");
    font.family = CssCascade.getValue(element, "font-family");
    font.size = Utils.atoi(CssCascade.getValue(element, "font-size"));
    font.lineHeight = CssCascade.getValue(element, "line-height");
    return font;
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
