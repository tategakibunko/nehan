import {
  LogicalEdgeSize,
  LogicalEdgeValue,
  LogicalEdgeDirections,
  PropValue,
  CssText,
  HtmlElement,
} from "./public-api";

export class LogicalMargin extends LogicalEdgeSize {
  static parseShorthand(css_text: CssText): PropValue<string, string> [] {
    let vs = CssText.getValue4D(css_text.value);
    return [
      {prop:"margin-before", value:vs[0]},
      {prop:"margin-end",    value:vs[1]},
      {prop:"margin-after",  value:vs[2]},
      {prop:"margin-start",  value:vs[3]}
    ];
  }

  static load(element: HtmlElement): LogicalMargin {
    return new LogicalMargin(
      LogicalEdgeDirections.reduce((size, direction) => {
	size[direction] = LogicalEdgeSize.loadDirection(element, `margin-${direction}`);
	return size;
      }, {} as any) as LogicalEdgeValue<number>
    );
  }

  static get none(): LogicalMargin {
    return new LogicalMargin(LogicalEdgeSize.zeroValue);
  }

  public clone(): LogicalMargin {
    return new LogicalMargin(this.values);
  }

  public getPropByLogicalDirection(direction: string): string {
    return `margin-${direction}`;
  }
}
