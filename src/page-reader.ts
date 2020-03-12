import {
  LogicalPage,
  HtmlDocument,
  PageGenerator,
  DocumentCallbacks,
  ResourceLoader,
  ILayoutOutlineCallbacks,
} from "./public-api";

export class PageReader {
  protected pages: LogicalPage[];
  protected document: HtmlDocument;
  protected generator: PageGenerator | null;
  protected timestamp: number;

  constructor(document: HtmlDocument) {
    this.pages = [];
    this.document = document;
    this.generator = null;
    this.timestamp = 0;
  }

  public render(callbacks: DocumentCallbacks): PageReader {
    this.pages = [];
    ResourceLoader.loadImageAll(this.document, callbacks).then(doc => {
      this.generator = this.document.createPageGenerator();
      this.timestamp = performance.now();
      this.renderPage(callbacks);
    });
    return this;
  }

  public get pageCount(): number {
    return this.pages.length;
  }

  public get maxPageIndex(): number {
    return Math.max(0, this.pageCount - 1);
  }

  public getPage(index: number): LogicalPage {
    if (!this.generator) {
      throw new Error("generator is not created yet");
    }
    let page = this.pages[index];
    if (!page) {
      throw new Error("page[" + index + "] not found");
    }
    if (page.dom !== null) {
      return page;
    }
    page.dom = this.generator.evalPageBox(page.box);
    return page;
  }

  public getAnchorPage(anchor_name: string): LogicalPage | null {
    if (!this.generator) {
      return null;
    }
    let anchor = this.generator.getAnchor(anchor_name);
    if (!anchor) {
      return null;
    }
    return this.getPage(anchor.pageIndex);
  }

  public createOutlineElement(callbacks: ILayoutOutlineCallbacks): HTMLElement {
    if (!this.generator) {
      throw new Error("generator is not created yet");
    }
    return this.generator.createOutlineElement(callbacks);
  }

  protected getTime(): number {
    let time = performance.now() - this.timestamp;
    this.timestamp = 0;
    return time;
  }

  protected renderPage(callbacks: DocumentCallbacks) {
    if (!this.generator) {
      throw new Error("generator is not created yet");
    }
    let next = this.generator.getNext();
    if (next.done || !next.value) {
      if (callbacks.onCompletePage) {
        let time = this.getTime();
        callbacks.onCompletePage(this, time);
      }
      return;
    }
    let page = next.value;
    this.pages[page.index] = page;
    if (callbacks.onProgressPage) {
      callbacks.onProgressPage(this, page);
    }
    if (callbacks.onPage) {
      page.dom = this.generator.evalPageBox(page.box);
      callbacks.onPage(this, page);
    }
    requestAnimationFrame(() => {
      this.renderPage(callbacks);
    });
  }
}
