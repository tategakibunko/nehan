import {
  Selector,
  HtmlElement
} from "./public-api";

export class AttrSelector extends Selector {
  private left: string;
  private operator?: string;
  private right?: string;

  constructor(left: string, operator?: string, right?: string){
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
    this.specificity.b = 1;
  }

  public toString(): string {
    let str = "[" + this.left;
    if(this.operator){
      str += this.operator;
    }
    if(this.right){
      str += this.right;
    }
    str += "]";
    return str;
  }

  public test(element: HtmlElement): boolean {
    if(!this.operator){
      return this.testAttr(element);
    }
    switch(this.operator){
    case "=":
      return this.testEqual(element);
    case "*=":
      return this.testStarEqual(element);
    case "^=":
      return this.testCaretEqual(element);
    case "$=":
      return this.testDollarEqual(element);
    case "~=":
      return this.testTildeEqual(element);
    case "|=":
      return this.testPipeEqual(element);
    }
    throw new Error("invalid operator[" + this.operator + "](attr selector)");
  }

  // a[title] => an element with attribute 'title'
  private testAttr(element: HtmlElement): boolean {
    return element.hasAttribute(this.left);
  }

  // a[title="example"]
  // OK: <a title="example">
  // NG: <a title="example1">
  private testEqual(element: HtmlElement): boolean {
    let attr = element.getAttribute(this.left);
    if(!attr || !this.right){
      return false;
    }
    return attr === this.right;
  }

  // a[title*="example"]
  // OK: <a title="example">
  // OK: <a title="example1">
  private testStarEqual(element: HtmlElement): boolean {
    let attr = element.getAttribute(this.left);
    if(!attr || !this.right){
      return false;
    }
    return attr.indexOf(this.right) >= 0;
  }

  // a[href^="https"] => an element starts with 'https'.
  private testCaretEqual(element: HtmlElement): boolean {
    let attr = element.getAttribute(this.left);
    if(!attr || !this.right){
      return false;
    }
    let rex = new RegExp("^" + this.right);
    return rex.test(attr);
  }

  // a[href$=".org"] => an element ends with '.org'.
  private testDollarEqual(element: HtmlElement): boolean {
    let attr = element.getAttribute(this.left);
    if(!attr || !this.right){
      return false;
    }
    let rex = new RegExp(this.right + "$");
    return rex.test(attr);
  }

  // a[title~="hoge"]
  // OK: <a title='hoge hige hage'>
  // OK: <a title='hoge'>
  private testTildeEqual(element: HtmlElement): boolean {
    let attr = element.getAttribute(this.left);
    if(!attr || !this.right){
      return false;
    }
    let list = attr.trim().replace(/\s+/g, " ").split(" ");
    let right = this.right;
    return list.some(function(value){
      return value === right;
    });
  }

  // a[title|="zn"]
  // OK: <div lang="zh">
  // OK: <div lang="zh-CN">
  // OK: <div lang="zh-TW">
  // NG: <div lang="zhcn">
  private testPipeEqual(element: HtmlElement): boolean {
    let attr = element.getAttribute(this.left);
    if(!attr || !this.right){
      return false;
    }
    return attr === this.right || attr.indexOf(this.right + "-") >= 0;
  }
}
