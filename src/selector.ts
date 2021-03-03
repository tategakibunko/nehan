import {
  Specificity,
  NehanElement,
} from "./public-api";

export class Selector {
  public specificity: Specificity;

  constructor() {
    this.specificity = new Specificity(0, 0, 0);
  }

  public test(_: NehanElement): boolean {
    return false;
  }
}
