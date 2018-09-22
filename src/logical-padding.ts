import {
  LogicalEdgeSize,
  LogicalEdgeValue,
  LogicalEdgeDirections,
  CssText,
  PropValue,
  HtmlElement,
} from "./public-api";

export class LogicalPadding extends LogicalEdgeSize {
  static parseShorthand(css_text: CssText): PropValue<string, string> [] {
    let vs = CssText.getValue4D(css_text.value);
    return [
      {prop:"padding-before", value:vs[0]},
      {prop:"padding-end",    value:vs[1]},
      {prop:"padding-after",  value:vs[2]},
      {prop:"padding-start",  value:vs[3]}
    ];
  }

  static load(element: HtmlElement): LogicalPadding {
    return new LogicalPadding(
      LogicalEdgeDirections.reduce((size, direction) => {
	size[direction] = LogicalEdgeSize.loadDirection(element, `padding-${direction}`);
	return size;
      }, {} as any) as LogicalEdgeValue<number>
    );
  }

  static get none(): LogicalPadding {
    return new LogicalPadding(LogicalEdgeSize.zeroValue);
  }

  public clone(): LogicalPadding {
    return new LogicalPadding(this.values);
  }

  public getPropByLogicalDirection(direction: string): string {
    return `padding-${direction}`;
  }
}
