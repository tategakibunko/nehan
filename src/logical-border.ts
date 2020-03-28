import {
  CssLength,
  LogicalBorderStyle,
  LogicalBorderWidth,
  LogicalBorderColor,
  LogicalBorderRadius,
  HtmlElement,
  NativeStyleMap,
  PropValue,
  CssText,
  ILogicalCssEvaluator,
} from "./public-api";

export interface LogicalBorderValue {
  style: LogicalBorderStyle,
  width: LogicalBorderWidth,
  color: LogicalBorderColor,
  radius: LogicalBorderRadius
}

export class LogicalBorder {
  public style: LogicalBorderStyle;
  public width: LogicalBorderWidth;
  public color: LogicalBorderColor;
  public radius: LogicalBorderRadius;

  constructor(values: LogicalBorderValue) {
    this.style = values.style;
    this.width = values.width;
    this.color = values.color;
    this.radius = values.radius;
  }

  public clone(): LogicalBorder {
    return new LogicalBorder({
      style: this.style.clone(),
      width: this.width.clone(),
      color: this.color.clone(),
      radius: this.radius.clone()
    });
  }

  static load(element: HtmlElement): LogicalBorder {
    return new LogicalBorder({
      style: LogicalBorderStyle.load(element),
      width: LogicalBorderWidth.load(element),
      color: LogicalBorderColor.load(element),
      radius: LogicalBorderRadius.load(element)
    });
  }

  static get none(): LogicalBorder {
    return new LogicalBorder({
      style: LogicalBorderStyle.none,
      width: LogicalBorderWidth.none,
      color: LogicalBorderColor.none,
      radius: LogicalBorderRadius.none
    });
  }

  public acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    const css = new NativeStyleMap();
    visitor.visitLogicalBorderWidth(this.width).mergeTo(css);
    visitor.visitLogicalBorderStyle(this.style).mergeTo(css);
    visitor.visitLogicalBorderColor(this.color).mergeTo(css);
    visitor.visitLogicalBorderRadius(this.radius).mergeTo(css);
    return css;
  }

  public clearBefore() {
    this.width.clearBefore();
  }

  public clearEnd() {
    this.width.clearEnd();
  }

  public clearAfter() {
    this.width.clearAfter();
  }

  public clearStart() {
    this.width.clearStart();
  }

  public get beforeWidth(): number {
    return this.width.before;
  }

  public get endWidth(): number {
    return this.width.end;
  }

  public get afterWidth(): number {
    return this.width.after;
  }

  public get startWidth(): number {
    return this.width.start;
  }

  static expand(declrs: PropValue<string, string>[]): PropValue<string, string>[] {
    return declrs.reduce((acm, item) => {
      switch (item.prop) {
        case "width":
          return acm.concat(LogicalBorderWidth.parseShorthand(new CssText(item)));
        case "style":
          return acm.concat(LogicalBorderStyle.parseShorthand(new CssText(item)));
        case "color":
          return acm.concat(LogicalBorderColor.parseShorthand(new CssText(item)));
      }
      console.error(`undefined prop for logical-border:${item.prop}`);
      return acm;
    }, [] as PropValue<string, string>[]);
  }

  static inferPropType(value: string): string {
    if (LogicalBorderStyle.values.indexOf(value) >= 0) {
      return "style";
    }
    if (LogicalBorderWidth.keywords.indexOf(value) >= 0) {
      return "width";
    }
    if (CssLength.hasUnit(value)) {
      return "width";
    }
    return "color";
  }

  // shorthand -> width, style, color
  static parseShorthandWidthStyleColor(css_text: CssText): PropValue<string, string>[] {
    let declrs: { [prop: string]: string } = { width: "medium", style: "none", color: "currentcolor" };
    let vals = (css_text.value === "none") ? [] : css_text.split().slice(0, 3);
    vals.forEach(value => {
      let prop = LogicalBorder.inferPropType(value);
      declrs[prop] = value;
    }, declrs);
    return Object.keys(declrs).map(key => {
      return { prop: key, value: declrs[key] };
    }) as PropValue<string, string>[];
  }

  static parseShorthand(css_text: CssText): PropValue<string, string>[] {
    let sh_declrs = LogicalBorder.parseShorthandWidthStyleColor(css_text);
    return LogicalBorder.expand(sh_declrs);
  }

  static parseShorthandEach(css_text: CssText, direction: string): PropValue<string, string>[] {
    // direction = [before, end, after, start]
    // item.prop = [width, style, color]
    return LogicalBorder.parseShorthandWidthStyleColor(css_text).map(item => {
      return { prop: `border-${direction}-${item.prop}`, value: item.value };
    });
  }
}
