import {
  LogicalSize,
  Font,
} from './public-api';

function createOffscreenCanvasContext2d(): OffscreenCanvasRenderingContext2D | null {
  if (typeof OffscreenCanvas === "undefined") {
    return null;
  }
  const canvas: OffscreenCanvas = new OffscreenCanvas(0, 0);
  const offCanvasCtx: OffscreenCanvasRenderingContext2D | null = canvas.getContext("2d");
  return offCanvasCtx;
}

const offCanvasCtx: OffscreenCanvasRenderingContext2D | null = createOffscreenCanvasContext2d();

function createDummyElement(): HTMLElement {
  if (typeof document !== "undefined") {
    const dom = document.createElement("span"); // for browser
    const style = dom.style;
    style.display = "inline";
    style.margin = "0";
    style.padding = "0";
    style.borderWidth = "0";
    style.lineHeight = "1";
    style.width = "auto";
    style.height = "auto";
    style.visibility = "hidden";
    return dom;
  }
  return { style: {}, innerHTML: "" } as HTMLElement; // for node.js(local stub)
};

// HTMLElement to get advance size of word.
const offDomNode = createDummyElement();

export class TextMeasure {
  static getWordSize(font: Font, word: string): LogicalSize {
    let measure = 0, extent = font.size;
    if (offCanvasCtx) {
      offCanvasCtx.font = font.css;
      const metrics: TextMetrics = offCanvasCtx.measureText(word);
      measure = Math.round(metrics.width);
    } else if (typeof document !== "undefined") {
      // if offscreen canvas is not supported, use dummy DOM.
      offDomNode.style.font = font.css;
      offDomNode.innerHTML = word;
      document.body.appendChild(offDomNode);
      const rect = offDomNode.getBoundingClientRect();
      document.body.removeChild(offDomNode);
      measure = Math.round(rect.width);
      // rect.height is too large, but I don't know why.
      // extent = Math.round(rect.height);
    } else {
      measure = Math.round(word.length * font.size / 2);
    }
    return new LogicalSize({ measure, extent });
  }
}