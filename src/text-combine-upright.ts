import {
  HtmlElement,
  CssCascade,
} from "./public-api";

export class TextCombineUpright {
  public value: string;

  static load(element: HtmlElement): TextCombineUpright {
    let value = CssCascade.getValue(element, "text-combine-upright");
    return new TextCombineUpright(value);
  }

  constructor(value: string){
    this.value = value;
  }

  public isNone(): boolean {
    return this.value === "none";
  }
}
