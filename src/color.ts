import {
  NehanElement,
  NativeStyleMap,
  ILogicalCssEvaluator,
} from './public-api';

/*
  To treat following case correctly, we must control 'color' property in nehan layer.

  <div class="parent">
    <b style="color:red">red text1
      <p>this is also red</p>
      red text2
    </b>
  </div>

  In nehan, block element(<p>) inside inline(<b>) is propagated to parent block(div.parent) like this.

  <div class="parent">
    <b style="color:red">red text1</b>
    <p>this is also red</p>
    <b style="color:red">red text2</b>
  </div>

  Then DOM of <p> is placed under div.parent(not <b>!).
  As a result, <b>.color is not inherited to <p> in output form of DOM collectly.
  Because parent of <p> is no longer <b>(but div.parent) in output form of DOM!

  This is why we have to treat 'color' inside nehan.
*/
export class Color {
  private constructor(public value: string) { }

  static load(element: NehanElement): Color {
    const value = element.computedStyle.getPropertyValue("color") || "inherit";
    return new Color(value);
  }

  public acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    return visitor.visitColor(this);
  }
}