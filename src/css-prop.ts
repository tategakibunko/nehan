import {
  Utils
} from "./public-api";

export class CssProp {
  public value: string;

  constructor(str: string){
    this.value = this.normalize(str);
  }

  public toString(): string {
    return this.value;
  }

  private normalize(str: string): string{
    let norm = str.replace(/\s/g, "");
    norm = Utils.String.camelToChain(norm);
    return norm;
  }

  public replace(target: string, dst: string): string {
    return this.value.replace(target, dst);
  }

  public join(tokens: string [], separator = "-"): string {
    return [this.value].concat(tokens).join(separator);
  }

  // !<callback-name>
  public isDynamicStyleProp(): boolean {
    return this.value.charAt(0) === "!";
  }

  public getDynamicStylePropName(): string {
    return this.isDynamicStyleProp()? this.value.substring(1) : "";
  }

  // @<callback-name>
  public isDomCallback(): boolean {
    return this.value.charAt(0) === "@";
  }

  public getDomCallbackName(): string {
    return this.isDomCallback()? this.value.substring(1) : "";
  }
}
