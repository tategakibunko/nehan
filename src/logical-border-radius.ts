import {
  LogicalBox,
  LogicalCornerMap,
  CssText,
  CssCascade,
  HtmlElement,
  PropValue,
  Utils,
  WritingMode,
  NativeStyleMap,
} from "./public-api";

export enum LogicalBorderRadiusCorner {
  BEFORE_START = "before-start",
  BEFORE_END = "before-end",
  AFTER_END = "after-end",
  AFTER_START = "after-start",
}

export interface LogicalBorderRadiusValue {
  beforeStart: number,
  beforeEnd: number,
  afterEnd: number,
  afterStart: number
}

export interface PhysicalBorderRadiusValue {
  topLeft: number,
  topRight: number,
  bottomRight: number,
  bottomLeft: number
}

export class PhysicalBorderRadius {
  public topLeft: number;
  public topRight: number;
  public bottomRight: number;
  public bottomLeft: number;

  constructor(values: PhysicalBorderRadiusValue) {
    this.topLeft = values.topLeft;
    this.topRight = values.topRight;
    this.bottomRight = values.bottomRight;
    this.bottomLeft = values.bottomLeft;
  }

  public get items(): PropValue<string, number>[] {
    return [
      { prop: "top-left", value: this.topLeft },
      { prop: "top-right", value: this.topRight },
      { prop: "bottom-right", value: this.bottomRight },
      { prop: "bottom-left", value: this.bottomLeft }
    ];
  }
}

export class LogicalBorderRadius {
  public beforeStart: number;
  public beforeEnd: number;
  public afterEnd: number;
  public afterStart: number;
  static corners: string[] = Utils.Enum.toValueArray(LogicalBorderRadiusCorner);

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

  static load(element: HtmlElement): LogicalBorderRadius {
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

  public getPhysicalBorderRadiusValue(writing_mode: WritingMode): PhysicalBorderRadiusValue {
    //let l2p_map: any = LogicalMap.selectCornerMap(writing_mode);
    return this.items.reduce((values, item) => {
      //let phy_prop = l2p_map[item.prop];
      let phy_prop = LogicalCornerMap.mapValue(writing_mode, item.prop);
      values[Utils.String.chainToCamel(phy_prop)] = item.value;
      return values;
    }, {} as any) as PhysicalBorderRadiusValue;
  }

  public getPhysicalBorderRadius(writing_mode: WritingMode): PhysicalBorderRadius {
    let values = this.getPhysicalBorderRadiusValue(writing_mode);
    return new PhysicalBorderRadius(values);
  }

  public get items(): PropValue<string, number>[] {
    return [
      { prop: "before-start", value: this.beforeStart },
      { prop: "before-end", value: this.beforeEnd },
      { prop: "after-end", value: this.afterEnd },
      { prop: "after-start", value: this.afterStart }
    ];
  }

  public getCss(box: LogicalBox): NativeStyleMap {
    return this.getPhysicalBorderRadius(box.writingMode).items.reduce((css, item) => {
      return css.set(`border-${item.prop}-radius`, String(item.value));
    }, new NativeStyleMap());
  }
}
