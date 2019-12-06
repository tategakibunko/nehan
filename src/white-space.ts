import {
  HtmlElement,
  CssCascade,
  Config,
} from "./public-api";

export type WhiteSpaceValue = "normal" | "pre" | "nowrap"

export class WhiteSpace {
  public value: WhiteSpaceValue;

  constructor(value: WhiteSpaceValue) {
    this.value = value;
  }

  public isPre(): boolean {
    return this.value === 'pre';
  }

  static load(element: HtmlElement): WhiteSpace {
    let value = CssCascade.getValue(element, "white-space");
    return new WhiteSpace(value as WhiteSpaceValue);
  }

  static isWhiteSpaceElement(element: HtmlElement): boolean {
    if (!element.isTextElement()) {
      return false;
    }
    // check if white-space only except char defined in Config.whiteSpaceExclusions.
    let text = element.textContent;
    if (Config.nonOmitWhiteSpaces.some(chr => text.indexOf(chr) >= 0)) {
      return false;
    }
    return text.replace(/\s/gm, "") === "";
  }
}
