import {
  Selector,
  HtmlElement,
} from "./public-api";

export class UniversalSelector extends Selector {
  public toString(): string {
    return "*";
  }

  public test(element: HtmlElement): boolean {
    return true; // always true
  }
}
