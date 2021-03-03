import {
  Utils,
  NehanElement,
} from "./public-api";

export enum PseudoElementTagName {
  MARKER = "::marker",
  BEFORE = "::before",
  AFTER = "::after",
  FIRST_LINE = "::first-line",
  FIRST_LETTER = "::first-letter"
}

export const PseudoElementTagNames = Utils.Enum.toValueArray(PseudoElementTagName);

export class PseudoElement {
  static isPseudoElement(element: NehanElement): boolean {
    return element.tagName.substring(0, 2) === "::";
  }

  static isFirstLine(element: NehanElement): boolean {
    return element.tagName === PseudoElementTagName.FIRST_LINE;
  }
}
