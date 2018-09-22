import {
  LogicalEdge,
  LogicalEdgeValue,
  LogicalEdgeDirections,
  CssText,
  CssCascade,
  HtmlElement,
  PropValue,
} from "./public-api";

export class LogicalBorderColor extends LogicalEdge<string>{
  static parseShorthand(css_text: CssText): PropValue<string, string> [] {
    let vs = CssText.getValue4D(css_text.value);
    return [
      {prop:"border-before-color", value:vs[0]},
      {prop:"border-end-color",    value:vs[1]},
      {prop:"border-after-color",  value:vs[2]},
      {prop:"border-start-color",  value:vs[3]}
    ];
  }

  static load(element: HtmlElement): LogicalBorderColor {
    return new LogicalBorderColor(
      LogicalEdgeDirections.reduce((colors, direction) => {
	colors[direction] = CssCascade.getValue(element, `border-${direction}-color`);
	return colors;
      }, {} as any) as LogicalEdgeValue<string>
    );
  }

  static get none(): LogicalBorderColor {
    return new LogicalBorderColor(LogicalBorderColor.noneValue);
  }

  static get noneValue(): LogicalEdgeValue<string> {
    return {
      before: "transparent",
      end: "transparent",
      after: "transparent",
      start: "transparent"
    };
  }

  public clone(): LogicalBorderColor {
    return new LogicalBorderColor(this.values);
  }

  public getPropByLogicalDirection(direction: string): string {
    return `border-${direction}-color`;
  }
}
