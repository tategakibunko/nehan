import {
  ICharacter,
  LogicalSize,
  Tcy,
  Font,
} from "./public-api";

const createDummyElement = (): HTMLElement => {
  if (typeof document !== "undefined") {
    return document.createElement("span"); // for browser
  }
  return { style: {}, innerHTML: "" } as HTMLElement; // for node.js(local stub)
};

// HTMLElement to get advance size of word.
const __word_span = createDummyElement();
const __word_style = __word_span.style;
__word_style.display = "inline";
__word_style.margin = "0";
__word_style.padding = "0";
__word_style.borderWidth = "0";
__word_style.lineHeight = "1";
__word_style.width = "auto";
__word_style.height = "auto";
__word_style.visibility = "hidden";

const createOffscreenCanvasContext2d = (): OffscreenCanvasRenderingContext2D | null => {
  if (typeof OffscreenCanvas === "undefined") {
    return null;
  }
  const canvas: OffscreenCanvas = new OffscreenCanvas(0, 0);
  const offCanvasCtx: OffscreenCanvasRenderingContext2D | null = canvas.getContext("2d");
  return offCanvasCtx;
}

const offCanvasCtx: OffscreenCanvasRenderingContext2D | null = createOffscreenCanvasContext2d();

export class Word implements ICharacter {
  public text: string;
  public size: LogicalSize;
  public hasEmphasis: boolean;
  public kerning: boolean;
  public spacing: number;

  public constructor(str: string) {
    this.text = str;
    this.size = new LogicalSize({ measure: 0, extent: 0 });
    this.hasEmphasis = false;
    this.kerning = false;
    this.spacing = 0;
  }

  public get charCount(): number {
    return this.text.length;
  }

  public toString(): string {
    return this.text;
  }

  public setMetrics(opts: {
    font: Font,
    isVertical: boolean,
    isEmphasized: boolean
  }) {
    this.size = Word.getLogicalSize(opts.font, this.text);
  }

  public convertTcys(): Tcy[] {
    let tcys: Tcy[] = [];
    for (let i = 0; i < this.text.length; i++) {
      tcys.push(new Tcy(this.text.charAt(i)));
    }
    return tcys;
  }

  // overflow-wrap:break-word
  public breakWord(measure: number): Word {
    let head_len = Math.floor(this.text.length * measure / this.size.measure);
    let head_text = this.text.substring(0, head_len);
    let tail_text = this.text.substring(head_len);
    this.text = tail_text;
    return new Word(head_text);
  }

  public restoreBrokenWord(word: Word) {
    //console.log("restore broken word!: [%s]->[%s]", this.text, word.text + this.text);
    this.text = word.text + this.text;
  }

  static getLogicalSize(font: Font, word: string): LogicalSize {
    if (offCanvasCtx) {
      offCanvasCtx.font = font.css;
      const metrics: TextMetrics = offCanvasCtx.measureText(word);
      return new LogicalSize({
        measure: Math.round(metrics.width),
        extent: font.size
      });
    }
    // if offscreen canvas is not supported, use dummy DOM.
    __word_style.font = font.css;
    __word_span.innerHTML = word;
    document.body.appendChild(__word_span);
    let rect = __word_span.getBoundingClientRect();
    document.body.removeChild(__word_span);
    return new LogicalSize({
      measure: Math.round(rect.width),
      extent: font.size // rect.height is too large, but I don't know why.
      //extent: Math.round(rect.height)
    });
  }
}
