import {
  HtmlElement,
  HtmlDocument,
  HtmlDocumentOptions,
  LogicalNodeGenerator,
  ILogicalNode,
  ILogicalNodeGenerator,
  LogicalBlockNode,
  ILogicalNodeEvaluator,
  LogicalNodeEvaluator,
  WritingModeValue,
  ILayoutOutlineEvaluator,
  LayoutOutlineEvaluator,
} from './public-api';

interface PagedNode {
  node: ILogicalNode;
  dom?: HTMLElement | Node;
  index: number;
  progress: number;
  charCount: number;
  acmCharCount: number;
}

interface PagedHtmlRenderOptions {
  onPage?: (context: { caller: PagedHtmlDocument, page: PagedNode }) => void;
  onComplete?: (context: { caller: PagedHtmlDocument, time: number, pageCount: number }) => void;
}

export class PagedHtmlDocument extends HtmlDocument {
  private generator: ILogicalNodeGenerator;
  private evaluator: ILogicalNodeEvaluator;
  private pages: PagedNode[];
  private timestamp: number;

  constructor(src: string, options: HtmlDocumentOptions) {
    super(src, options);
    this.generator = options.generator || LogicalNodeGenerator.createRoot(this.body);
    this.evaluator = options.evaluator || this.createEvaluator(this.body);
    this.pages = [];
    this.timestamp = 0;
  }

  private createEvaluator(body: HtmlElement): ILogicalNodeEvaluator {
    const writingMode = body.computedStyle.getPropertyValue("writing-mode") as WritingModeValue;
    return LogicalNodeEvaluator.selectEvaluator(writingMode);
  }

  private addPageNode(node: LogicalBlockNode): PagedNode {
    const index = this.pages.length;
    const dom = (index === 0) ? node.acceptEvaluator(this.evaluator) : undefined; // evaluate first page only(lazy evaluation)
    const prevPage = this.pages[index - 1];
    const progress = node.progress;
    const charCount = node.text.length;
    const acmCharCount = prevPage ? prevPage.acmCharCount + charCount : charCount;
    const pagedNode = {
      node,
      dom,
      index,
      progress,
      charCount,
      acmCharCount,
    };
    this.pages.push(pagedNode);
    return pagedNode;
  }

  public getPage(index: number): HTMLElement | Node {
    const page = this.pages[index];
    if (!page) {
      throw new Error(`page ${index} is not found!`);
    }
    if (page.dom) {
      return page.dom;
    }
    page.dom = page.node.acceptEvaluator(this.evaluator);
    return page.dom;
  }

  public createOutline(outlineEvaluator?: ILayoutOutlineEvaluator): HTMLElement {
    const evaluator = outlineEvaluator || new LayoutOutlineEvaluator();
    return this.generator.context.flowRoot.outline.acceptEvaluator(evaluator);
  }

  public render(options: PagedHtmlRenderOptions = {}): PagedHtmlDocument {
    this.timestamp = performance.now();
    this.renderAsync(options);
    return this;
  }

  private renderAsync(options: PagedHtmlRenderOptions) {
    requestAnimationFrame(() => {
      const result = this.generator.getNext();
      if (!result) {
        const time = performance.now() - this.timestamp;
        const pageCount = this.pages.length;
        console.log(`finished ${time / 1000}sec, pageCount ${pageCount}`);
        if (options.onComplete) {
          options.onComplete({ caller: this, time, pageCount });
        }
        return;
      }
      const node = result.getBodyAsBlockNode();
      const page = this.addPageNode(node);
      if (options.onPage) {
        options.onPage({ caller: this, page });
      }
      this.renderAsync(options);
    });
    return this;
  }
}