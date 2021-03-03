import {
  CssText,
  CssCascade,
  NehanElement,
  PropValue,
  Utils,
} from "./public-api";

export type LogicalBorderRadiusCorner = "before-start" | "before-end" | "after-end" | "after-start"

export interface LogicalBorderRadiusValue {
  beforeStart: number,
  beforeEnd: number,
  afterEnd: number,
  afterStart: number
}

export class LogicalBorderRadius {
  public beforeStart: number;
  public beforeEnd: number;
  public afterEnd: number;
  public afterStart: number;
  static corners: LogicalBorderRadiusCorner[] = ["before-start", "before-end", "after-end", "after-start"];

  // Is it simpler if values are 'number []'?
  constructor(values: LogicalBorderRadiusValue) {
    this.beforeStart = values.beforeStart;
    this.beforeEnd = values.beforeEnd;
    this.afterEnd = values.afterEnd;
    this.afterStart = values.afterStart;
  }

  public clone(): LogicalBorderRadius {
    return new LogicalBorderRadius({
      beforeStart: this.beforeStart,
      beforeEnd: this.beforeEnd,
      afterEnd: this.afterEnd,
      afterStart: this.afterStart
    });
  }

  static get none(): LogicalBorderRadius {
    return new LogicalBorderRadius(LogicalBorderRadius.noneValue);
  }

  static get noneValue(): LogicalBorderRadiusValue {
    return {
      beforeStart: 0,
      beforeEnd: 0,
      afterEnd: 0,
      afterStart: 0
    };
  }

  static load(element: NehanElement): LogicalBorderRadius {
    let values = LogicalBorderRadius.corners.reduce((values, corner) => {
      let prop = `border-${corner}-radius`;
      let value = CssCascade.getValue(element, prop);
      values[Utils.String.chainToCamel(corner)] = value;
      return values;
    }, {} as any) as LogicalBorderRadiusValue;
    return new LogicalBorderRadius(values);
  }

  static parseShorthand(css_text: CssText): PropValue<string, string>[] {
    let hvs = CssText.getValue4D2(css_text.value);
    let h4 = hvs[0], v4 = hvs[1];
    return [
      { prop: "border-before-start-radius", value: [h4[0], v4[0]].join(" ") },
      { prop: "border-before-end-radius", value: [h4[1], v4[1]].join(" ") },
      { prop: "border-after-end-radius", value: [h4[2], v4[2]].join(" ") },
      { prop: "border-after-start-radius", value: [h4[3], v4[3]].join(" ") }
    ];
  }

  public get items(): PropValue<LogicalBorderRadiusCorner, number>[] {
    return [
      { prop: "before-start", value: this.beforeStart },
      { prop: "before-end", value: this.beforeEnd },
      { prop: "after-end", value: this.afterEnd },
      { prop: "after-start", value: this.afterStart }
    ];
  }
}
