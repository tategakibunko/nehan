import {
  Utils
} from "./public-api";

export class SelectorText {
  public value: string;

  constructor(str: string){
    this.value = this.normalize(str);
  }

  public toString(): string {
    return this.value;
  }

  public split(): string []{
    return this.value.split(",");
  }

  private normalize(str: string): string {
    let norm = str.trim();
    norm = norm.replace(/\s*,\s*/g, ",");
    norm = Utils.String.multiSpaceToSingle(norm);
    return norm;
  }
}
