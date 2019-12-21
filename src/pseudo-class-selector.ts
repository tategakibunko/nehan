import {
  Utils,
  Selector,
  HtmlElement,
} from "./public-api";

export class PseudoClassSelector extends Selector {
  private src: string;

  constructor(source: string) {
    super();
    this.src = source;
    this.specificity.b = 1;
  }

  public toString(): string {
    return ":" + this.src;
  }

  public testEven(element: HtmlElement): boolean {
    return (element.index + 1) % 2 === 0;
  }

  public testOdd(element: HtmlElement): boolean {
    return this.testEven(element) === false;
  }

  public testFirstChild(element: HtmlElement): boolean {
    return element.index === 0;
  }

  private getNthExpr(src: string): string {
    return src.replace(/\s/g, "").replace(/^nth-child\((.+)\)/, "$1");
  }

  private testNthFuncExpr(index: number, expr: string): boolean {
    // test if index ~= an + b
    let match_a = expr.match(/\d+(?=n)/);
    if (!match_a) {
      console.error("invalid nth-child expr:%s", expr);
      return false;
    }
    let a = Utils.atoi(match_a[0]);
    let match_b = expr.replace(/\d+n/g, "").replace(/[+-]/g, "");
    let b = match_b ? Utils.atoi(match_b[0]) : 0;
    if (a === 0) {
      return index === b;
    }
    // Assume that index ~= '3n + 4'.
    // Then 3*(-1) + 4 = 1, so index = 1 is matched number? No!
    // Because css assume that n >= 0.
    if (index < b) { // or 'index - b < 0'
      return false;
    }
    return (index - b) % a === 0;
  }

  public testNthExpr(index: number): boolean {
    let expr = this.getNthExpr(this.src);
    if (/^\d+$/.test(expr)) {
      let nth = Utils.atoi(expr);
      return index + 1 === nth;
    }
    return this.testNthFuncExpr(index, expr);
  }

  public testNthChild(element: HtmlElement): boolean {
    return this.testNthExpr(element.index);
  }

  // TODO
  public testMatch(element: HtmlElement): boolean {
    throw new Error("pseudo-class 'match' is not implemented yet");
  }

  public test(element: HtmlElement): boolean {
    if (this.src === "first-child") {
      return this.testFirstChild(element);
    }
    if (this.src === "odd") {
      return this.testOdd(element);
    }
    if (this.src === "even") {
      return this.testEven(element);
    }
    if (this.src.indexOf("nth-child(") >= 0) {
      return this.testNthChild(element);
    }
    if (this.src.indexOf("match(") >= 0) {
      return this.testMatch(element);
    }
    return false;
  }
}
