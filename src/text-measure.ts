import {
  LogicalSize,
  Font,
} from './public-api';

interface TextMetricsMeasure {
  getMeasure: (text: string, font: Font) => number;
}

function createOffscreenCanvasContext2d(): OffscreenCanvasRenderingContext2D | null {
  if (typeof OffscreenCanvas === "undefined") {
    return null;
  }
  return new OffscreenCanvas(0, 0).getContext("2d");
}

function createCanvasContext2d(): CanvasRenderingContext2D | null {
  const canvas = document.createElement("canvas");
  canvas.style.display = "hidden";
  canvas.style.width = canvas.style.height = "0";
  document.body.appendChild(canvas);
  return canvas.getContext("2d");
}

function createDummyElement(): HTMLElement {
  if (typeof document === "undefined") {
    return { style: {}, innerHTML: "" } as HTMLElement; // for node.js(local stub)
  }
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
};

class OffCanvasTextMetricsMeasure implements TextMetricsMeasure {
  static offCanvasCtx = createOffscreenCanvasContext2d();
  static isEnabled(): boolean {
    return this.offCanvasCtx !== null;
  }
  getMeasure(text: string, font: Font): number {
    const ctx = OffCanvasTextMetricsMeasure.offCanvasCtx;
    if (!ctx) {
      return 0;
    }
    ctx.font = font.css;
    return ctx.measureText(text).width;
  }
}

class CanvasTextMetricsMeasure implements TextMetricsMeasure {
  static canvasCtx = createCanvasContext2d();
  static isEnabled(): boolean {
    return this.canvasCtx !== null;
  }
  getMeasure(text: string, font: Font): number {
    const ctx = CanvasTextMetricsMeasure.canvasCtx;
    if (!ctx) {
      return 0;
    }
    ctx.font = font.css;
    return ctx.measureText(text).width;
  }
}

class DomNodeTextMetricsMeasure implements TextMetricsMeasure {
  static node = createDummyElement();
  static isEnabled(): boolean {
    return typeof document !== "undefined";
  }
  getMeasure(text: string, font: Font): number {
    const node = DomNodeTextMetricsMeasure.node;
    node.style.font = font.css;
    node.innerHTML = text;
    document.body.appendChild(node);
    const rect = node.getBoundingClientRect();
    document.body.removeChild(node);
    return rect.width;
  }
}

class EasyTextMetricsMeasure implements TextMetricsMeasure {
  getMeasure(text: string, font: Font): number {
    return Math.round(text.length * font.size / 2);
  }
}

const textMetricsMeasure: TextMetricsMeasure =
  OffCanvasTextMetricsMeasure.isEnabled() ? new OffCanvasTextMetricsMeasure() :
    CanvasTextMetricsMeasure.isEnabled() ? new CanvasTextMetricsMeasure() :
      DomNodeTextMetricsMeasure.isEnabled() ? new DomNodeTextMetricsMeasure() :
        new EasyTextMetricsMeasure();

export class TextMeasure {
  static getWordSize(font: Font, word: string): LogicalSize {
    const measure = textMetricsMeasure.getMeasure(word, font);
    const extent = font.size;
    return new LogicalSize({ measure, extent });
  }
}