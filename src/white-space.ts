import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
  Config,
} from "./public-api";

export enum WhiteSpaceValue {
  NORMAL = "normal",
  PRE = "pre",
  NOWRAP = "nowrap",
}

export class WhiteSpace {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(WhiteSpaceValue);

  constructor(value: WhiteSpaceValue){
    this.value = DefaultCss.selectOrDefault("white-space", value, WhiteSpace.values);
  }

  public isPre(): boolean {
    return this.value === WhiteSpaceValue.PRE;
  }
  
  static load(element: HtmlElement): WhiteSpace {
    let value = CssCascade.getValue(element, "white-space");
    return new WhiteSpace(value as WhiteSpaceValue);
  }

  static isWhiteSpaceElement(element: HtmlElement): boolean {
    if(!element.isTextElement()){
      return false;
    }
    // check if white-space only except char defined in Config.whiteSpaceExclusions.
    let text = element.textContent;
    if(Config.nonOmitWhiteSpaces.some(chr => text.indexOf(chr) >= 0)){
      return false;
    }
    return text.replace(/\s/gm, "") === "";
  }
}
