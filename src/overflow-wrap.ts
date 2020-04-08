import {
  HtmlElement,
  CssCascade,
} from "./public-api";

export type OverflowWrapValue =
  // if single word overflow line-max, just overflow,
  // otherwise start new line.
  // [this is]
  // [toolong]wooooooord <- overflow
  "normal" |

  // if single word overflow line-max, breaks word.
  // [this is]
  // [toolong] <- break word
  // [woooooo] <- break word
  // [ord    ]
  "break-word"

export class OverflowWrap {
  public value: OverflowWrapValue;

  constructor(value: OverflowWrapValue) {
    this.value = value;
  }

  static load(element: HtmlElement): OverflowWrap {
    let value = CssCascade.getValue(element, "overflow-wrap");
    return new OverflowWrap(value as OverflowWrapValue);
  }

  public isNormal(): boolean {
    return this.value === "normal";
  }

  public isBreakWord(): boolean {
    return this.value === "break-word";
  }
}
