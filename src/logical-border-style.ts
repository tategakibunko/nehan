import {
  LogicalEdge,
  LogicalEdgeValue,
  LogicalEdgeDirections,
  CssText,
  CssCascade,
  HtmlElement,
  PropValue,
  Utils,
} from "./public-api";

export enum LogicalBorderStyleValue {
  NONE = "none",
  HIDDEN = "hidden",
  DOTTED = "dotted",
  DASHED = "dashed",
  SOLID = "solid",
  DOUBLE = "double",
  GROOVE = "groove",
  RIDGE = "ridge",
  INSET = "inset",
  OUTSET = "outset",
}

export class LogicalBorderStyle extends LogicalEdge<string>{
  static values = Utils.Enum.toValueArray(LogicalBorderStyleValue);

  static parseShorthand(css_text: CssText): PropValue<string, string>[] {
    let vs = CssText.getValue4D(css_text.value);
    return [
      { prop: "border-before-style", value: vs[0] },
      { prop: "border-end-style", value: vs[1] },
      { prop: "border-after-style", value: vs[2] },
      { prop: "border-start-style", value: vs[3] }
    ];
  }

  static load(element: HtmlElement): LogicalBorderStyle {
    return new LogicalBorderStyle(
      LogicalEdgeDirections.reduce((style, direction) => {
        style[direction] = CssCascade.getValue(element, `border-${direction}-style`);
        return style;
      }, {} as any) as LogicalEdgeValue<string>
    );
  }

  static get noneValue(): LogicalEdgeValue<string> {
    return {
      before: "none",
      end: "none",
      after: "none",
      start: "none"
    };
  }

  static get none(): LogicalBorderStyle {
    return new LogicalBorderStyle(LogicalBorderStyle.noneValue);
  }

  public clone(): LogicalBorderStyle {
    return new LogicalBorderStyle(this.values);
  }

  public getPropByLogicalDirection(direction: string): string {
    return `border-${direction}-style`;
  }
}
