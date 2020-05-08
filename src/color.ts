import {
  HtmlElement,
  NativeStyleMap,
  ILogicalCssEvaluator,
} from './public-api';

export class Color {
  constructor(public value: string) {
  }

  static load(element: HtmlElement): Color {
    const value = element.computedStyle.getPropertyValue("color") || "inherit";
    return new Color(value);
  }

  public acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    return visitor.visitColor(this);
  }
}