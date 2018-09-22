import {
  LogicalEdgeSize,
  LogicalEdgeValue,
  LogicalEdgeDirections,
  Utils,
  CssText,
  PropValue,
  HtmlElement,
} from "./public-api";

export enum LogicalBorderWidthKeyword {
  THIN = "thin",
  MEDIUM = "medium",
  THICK = "thick",
}

export let LogicalBorderWidthKeywordSize: {[keyword: string]: number} = {
  thin:2,
  medium:4,
  thick:6
}

export class LogicalBorderWidth extends LogicalEdgeSize {
  static keywords: string [] = Utils.Enum.toValueArray(LogicalBorderWidthKeyword);

  static parseShorthand(css_text: CssText): PropValue<string, string> [] {
    let vs = CssText.getValue4D(css_text.value);
    return [
      {prop:"border-before-width", value:vs[0]},
      {prop:"border-end-width",    value:vs[1]},
      {prop:"border-after-width",  value:vs[2]},
      {prop:"border-start-width",  value:vs[3]}
    ];
  }

  static load(element: HtmlElement): LogicalBorderWidth {
    return new LogicalBorderWidth(
      LogicalEdgeDirections.reduce((size, direction) => {
	size[direction] = LogicalEdgeSize.loadDirection(element, `border-${direction}-width`);
	return size;
      }, {} as any) as LogicalEdgeValue<number>
    );
  }

  static get none(): LogicalBorderWidth {
    return new LogicalBorderWidth(LogicalEdgeSize.zeroValue);
  }

  public clone(): LogicalBorderWidth {
    return new LogicalBorderWidth(this.values);
  }

  public clearBefore(){
    this.before = 0;
  }

  public clearEnd(){
    this.end = 0;
  }

  public clearAfter(){
    this.after = 0;
  }

  public clearStart(){
    this.start = 0;
  }

  public getPropByLogicalDirection(direction: string): string {
    return `border-${direction}-width`;
  }
}
