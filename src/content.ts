import {
  CssCascade,
  NehanElement
} from "./public-api";

export class Content {
  public value: string;

  constructor(value: string) {
    this.value = this.normalize(value);
  }

  public isEmpty(): boolean {
    return this.value === "";
  }

  protected normalize(value: string): string {
    return value; // TODO
  }

  static load(element: NehanElement): Content {
    let value = CssCascade.getValue(element, "content");
    return new Content(value);
  }
}
