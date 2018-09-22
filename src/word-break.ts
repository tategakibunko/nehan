import {
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
} from "./public-api";

export enum WordBreakValue {
  NORMAL = "normal",
  BREAK_ALL = "break-all",
  KEEP_ALL = "keep-all",
}

export class WordBreak {
  public value: string;
  static values: string [] = Utils.Enum.toValueArray(WordBreakValue);

  constructor(value: WordBreakValue){
    this.value = DefaultCss.selectOrDefault(
      "word-break", value, WordBreak.values
    );
  }

  static load(element: HtmlElement): WordBreak {
    let value = CssCascade.getValue(element, "word-break");
    return new WordBreak(value as WordBreakValue);
  }

  public isNormal(): boolean {
    return this.value === WordBreakValue.NORMAL;
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
    return this.value === WordBreakValue.BREAK_ALL;
  }

  public isKeepAll(): boolean {
    return this.value === WordBreakValue.KEEP_ALL;
  }
}
