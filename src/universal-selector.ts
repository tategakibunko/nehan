import {
  Selector,
  NehanElement,
} from "./public-api";

export class UniversalSelector extends Selector {
  public toString(): string {
    return "*";
  }

  public test(element: NehanElement): boolean {
    return true; // always true
  }
}
