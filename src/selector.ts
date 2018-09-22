import {
  Specificity,
  HtmlElement,
} from "./public-api";

export class Selector {
  public specificity: Specificity;
  
  constructor(){
    this.specificity = new Specificity(0, 0, 0);
  }
  
  public test(_: HtmlElement): boolean {
    return false;
  }
}
