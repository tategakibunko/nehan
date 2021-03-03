import {
  Selector,
  NehanElement,
} from "./public-api";

export class TypeSelector extends Selector {
  public tagName: string;

  constructor(tag_name: string) {
    super();
    this.tagName = tag_name;
    this.specificity.c = 1;
  }

  public toString(): string {
    return this.tagName;
  }

  public test(element: NehanElement): boolean {
    return this.tagName === element.tagName;
  }
}
