export const enum LayoutControlValue {
  SKIP = "skip",
  LINE_BREAK = "line-break",
  PAGE_BREAK = "page-break",

  // INLINE_SPLIT is used to split inline level into line-box and block.
  // [example]
  // <span>foo<p>bar</p>baz</span>
  // => <span>foo</span>, <span><p>bar</p></span>, <span>baz</span>
  INLINE_SPLIT = "inline-split", 
}

export class LayoutControl {
  public value: LayoutControlValue;
  public isGeneratorValue: boolean;

  constructor(value: LayoutControlValue){
    this.value = value;
    this.isGeneratorValue = false;
  }

  public toString(): string {
    return `${this.value}(from gen:${this.isGeneratorValue})`;
  }

  public isSkip(): boolean {
    return this.value === LayoutControlValue.SKIP;
  }

  public isLineBreak(): boolean {
    return this.value === LayoutControlValue.LINE_BREAK;
  }

  public isPageBreak(): boolean {
    return this.value === LayoutControlValue.PAGE_BREAK;
  }

  public isInlineSplit(): boolean {
    return this.value === LayoutControlValue.INLINE_SPLIT;
  }

  static createSkip(): LayoutControl {
    return new LayoutControl(LayoutControlValue.SKIP);
  }

  static createLineBreak(): LayoutControl {
    return new LayoutControl(LayoutControlValue.LINE_BREAK);
  }

  static createPageBreak(): LayoutControl {
    return new LayoutControl(LayoutControlValue.PAGE_BREAK);
  }

  static createInlineSplit(): LayoutControl {
    return new LayoutControl(LayoutControlValue.INLINE_SPLIT);
  }
}
