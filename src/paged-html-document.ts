import {
  Config,
  Page,
  HtmlElement,
  HtmlDocument,
  HtmlDocumentOptions,
  LogicalNodeGenerator,
  ILogicalNodeGenerator,
  LogicalBlockNode,
  ILogicalNodeEvaluator,
  WritingModeValue,
  ILayoutOutlineEvaluator,
  LayoutOutlineEvaluator,
  ResourceLoadingContext,
  ResourceLoader,
  WritingMode,
  HoriCssEvaluator,
  HoriLogicalNodeEvaluator,
  VertCssEvaluator,
  VertLogicalNodeEvaluator,
  LogicalTextJustifier,
} from './public-api';

export interface PagedHtmlRenderOptions {
  onProgressImage?: (ctx: ResourceLoadingContext) => void
  onCompleteImage?: (ctx: ResourceLoadingContext) => void
  onPage?: (context: { caller: PagedHtmlDocument, page: Page }) => void;
  onComplete?: (context: { caller: PagedHtmlDocument, time: number, pageCount: number }) => void;
}

export class PagedHtmlDocument extends HtmlDocument {
  private generator: ILogicalNodeGenerator;
  private evaluator: ILogicalNodeEvaluator;
  private pages: Page[];
  private timestamp: number;

  constructor(src: string, options: HtmlDocumentOptions) {
    super(src, options);
    this.generator = options.generator || LogicalNodeGenerator.createRoot(this.body);
    this.evaluator = options.evaluator || this.createEvaluator(WritingMode.load(this.body));
    this.pages = [];
    this.timestamp = 0;
  }

  private createEvaluator(writingMode: WritingMode): ILogicalNodeEvaluator {
    switch (writingMode.value) {
      case "horizontal-tb":
        return new HoriLogicalNodeEvaluator(
          writingMode,
          new HoriCssEvaluator(writingMode),
          LogicalTextJustifier.instance,
        );
      case "vertical-rl":
        return new VertLogicalNodeEvaluator(
          writingMode,
          new VertCssEvaluator(writingMode),
          LogicalTextJustifier.instance,
        );
      case "vertical-lr":
        return new VertLogicalNodeEvaluator(
          writingMode,
          new VertCssEvaluator(writingMode),
          LogicalTextJustifier.instance,
        );
      default:
        throw new Error(`undefined writing mode: ${writingMode.value}`);
    }
  }

  private addPageNode(node: LogicalBlockNode): Page {
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

  public get pageCount(): number {
    return this.pages.length;
  }

  public getAnchorPage(anchorName: string): Page {
    const anchor = this.generator.context.pageRoot.outline.getAnchor(anchorName);
    if (!anchor) {
      throw new Error(`anchor(${anchorName}) is not found!`);
    }
    return this.getPage(anchor.pageIndex);
  }

  public getPage(index: number): Page {
    const page = this.pages[index];
    if (!page) {
      throw new Error(`page ${index} is not found!`);
    }
    if (page.dom) {
      return page;
    }
    page.dom = page.node.acceptEvaluator(this.evaluator) as HTMLElement;
    return page;
  }

  public createOutline(outlineEvaluator?: ILayoutOutlineEvaluator): HTMLElement {
    const evaluator = outlineEvaluator || new LayoutOutlineEvaluator();
    return this.generator.context.flowRoot.outline.acceptEvaluator(evaluator);
  }

  public render(options: PagedHtmlRenderOptions = {}): PagedHtmlDocument {
    ResourceLoader.loadImageAll(this, options).then(doc => {
      this.timestamp = performance.now();
      this.renderAsync(options);
    });
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
      if (node.children.some(child => child.extent > 0)) {
        const page = this.addPageNode(node);
        if (options.onPage) {
          options.onPage({ caller: this, page });
        }
      }
      if (this.pages.length > Config.maxPageCount) {
        console.error("too many pages, abort.");
        return;
      }
      this.renderAsync(options);
    });
    return this;
  }
}