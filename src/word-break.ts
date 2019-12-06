import {
  HtmlElement,
  CssCascade,
} from "./public-api";

export type WordBreakValue = "normal" | "break-all" | "keep-all";

export class WordBreak {
  public value: WordBreakValue;

  constructor(value: WordBreakValue) {
    this.value = value;
  }

  static load(element: HtmlElement): WordBreak {
    let value = CssCascade.getValue(element, "word-break");
    return new WordBreak(value as WordBreakValue);
  }

  public isNormal(): boolean {
    return this.value === 'normal';
  }

  // Note that 'word-break:break-all' get prefference over 'overflow-wrap:break-word'.
  // 'overflow-wrap:break-word' will break word only when it's overflow by single-word.
  // On the other hand, 'word-break:break-all' will always break word if it's over.
  //
  // (1) word-break:break-all
  // [this is loooo]
  // [oong word    ]
  //
  // (2) overflow-wrap:break-word
  // [this is      ]
  // [looooong word]
  public isBreakAll(): boolean {
    return this.value === 'break-all';
  }

  public isKeepAll(): boolean {
    return this.value === 'keep-all';
  }
}
