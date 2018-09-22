import {
  Selector,
  HtmlElement
} from "./public-api";

export class IdSelector extends Selector {
  public idName: string;

  constructor(id_name: string){
    super();
    this.idName = id_name;
    this.specificity.a = 1;
  }

  public toString(): string {
    return "#" + this.idName;
  }

  public test(element: HtmlElement): boolean {
    return element.id === this.idName;
  }
}
