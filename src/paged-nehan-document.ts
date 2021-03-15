import {
  Config,
  Anchor,
  Page,
  LayoutSection,
  NehanDocument,
  NehanDocumentOptions,
  LogicalNodeGenerator,
  ILogicalNode,
  ILogicalNodeGenerator,
  LogicalBlockNode,
  ILogicalNodeEvaluator,
  ILogicalNodeEffector,
  ILayoutOutlineEvaluator,
  LayoutOutlineEvaluator,
  ImageLoader,
  ImageLoaderContext,
  DomCallbackEffector,
} from './public-api';

export interface PagedDocumentRenderOptions {
  onProgressImage?: (ctx: ImageLoaderContext) => void;
  onCompleteImage?: (ctx: ImageLoaderContext) => void;
  onPage?: (context: { caller: PagedNehanDocument, page: Page }) => void;
  onComplete?: (context: { caller: PagedNehanDocument, time: number, pageCount: number }) => void;
}

export class PagedNehanDocument extends NehanDocument {
  private generator: ILogicalNodeGenerator;
  private evaluator: ILogicalNodeEvaluator;
  private effector: ILogicalNodeEffector;
  private pages: Page[];
  private timestamp: number;

  constructor(src: string, options: NehanDocumentOptions = { styleSheets: [] }) {
    super(src, options);
    this.generator = options.generator || LogicalNodeGenerator.createRoot(this.body);
    this.evaluator = options.evaluator || this.generator.context.pageRoot.createLogicalNodeEvaluator();
    this.effector = new DomCallbackEffector(this.generator.context.pageRoot);
    this.pages = [];
    this.timestamp = 0;
  }

  private addPageNode(node: LogicalBlockNode): Page {
    const index = this.pages.length;
    const dom = (index === 0) ? this.evalNode(node, true) as HTMLElement : undefined; // evaluate first page only(lazy evaluation)
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

  public getAnchor(anchorName: string): Anchor | undefined {
    return this.generator.context.pageRoot.getAnchor(anchorName);
  }

  public getAnchorPage(anchorName: string): Page {
    const anchor = this.getAnchor(anchorName);
    if (!anchor) {
      throw new Error(`anchor(${anchorName}) is not found!`);
    }
    return this.getPage(anchor.pageIndex);
  }

  public evalNode(node: ILogicalNode, useEffector = true): HTMLElement | Node {
    const dom = node.acceptEvaluator(this.evaluator);
    if (useEffector) {
      node.acceptEffector(this.effector); // fire dom callbacks.
    }
    return dom;
  }

  public getPage(index: number): Page {
    const page = this.pages[index];
    if (!page) {
      throw new Error(`page ${index} is not found!`);
    }
    if (page.dom) {
      return page;
    }
    page.dom = this.evalNode(page.node, true) as HTMLElement;
    return page;
  }

  public createOutline(outlineEvaluator?: ILayoutOutlineEvaluator): HTMLElement {
    const evaluator = outlineEvaluator || new LayoutOutlineEvaluator();
    return this.generator.context.flowRoot.createOutline(evaluator);
  }

  public getSectionAt(pageIndex: number): LayoutSection {
    return this.generator.context.flowRoot.getSectionAt(pageIndex);
  }

  public render(options: PagedDocumentRenderOptions = {}): PagedNehanDocument {
    const images = this.querySelectorAll("img").concat(this.querySelectorAll("video"));
    const context = new ImageLoaderContext(images.length);
    new ImageLoader(images, context).load(options).then(_ => {
      this.timestamp = performance.now();
      this.renderAsync(options);
    });
    return this;
  }

  private renderAsync(options: PagedDocumentRenderOptions) {
    requestAnimationFrame(() => {
      const result = this.generator.getNext();
      if (!result) {
        const time = performance.now() - this.timestamp;
        const pageCount = this.pages.length;
        // console.log(`finished ${time / 1000}sec, pageCount ${pageCount}`);
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