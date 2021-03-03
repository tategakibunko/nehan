import {
  CssStyleSheet,
  NehanElement,
  UserAgentStyles,
  SelectorCache,
  CssLoader,
  Config,
  PseudoElementInitializer,
  ILogicalNodeGenerator,
  ILogicalNodeEvaluator,
  ValidBlockSelector,
} from "./public-api";

export interface HtmlDocumentOptions {
  styleSheets?: CssStyleSheet[];
  generator?: ILogicalNodeGenerator;
  evaluator?: ILogicalNodeEvaluator;
}

let defaultOptions: HtmlDocumentOptions = {
  styleSheets: []
};

export class HtmlDocument {
  public source: string;
  public $document: HTMLDocument;
  public documentElement: NehanElement;
  public body: NehanElement;
  public styleSheets: CssStyleSheet[];
  public specStyleSheet: CssStyleSheet; // specificity sorted stylesheet.
  protected selectorCache: SelectorCache;

  constructor(source: string, options: HtmlDocumentOptions = defaultOptions) {
    // console.time("initializeDocument");
    this.source = Config.normalizeHtml(source);
    this.styleSheets = [
      new CssStyleSheet(UserAgentStyles)
    ].concat(options.styleSheets || []);
    this.specStyleSheet = this.styleSheets.reduce((acm, stylesheet) => {
      return acm.mergeStyleSheet(stylesheet);
    }, new CssStyleSheet({}));
    this.selectorCache = new SelectorCache();
    this.selectorCache.clear();

    this.$document = new DOMParser().parseFromString(this.source, "text/html");
    if (Config.debugLayout) {
      console.log(this.$document.body);
    }
    this.documentElement = this.createElementFromDOM(this.$document.documentElement); // <html>, children = [<head>, <body>]
    const body = this.documentElement.querySelector("body"); // <body>
    if (!body) {
      throw new Error("body not found");
    }
    this.body = body;
    this.body.parent = this.documentElement;

    // before css loading, initialize pseudo elements and set spec-styles to them.
    this.body.acceptEffectorAll(new PseudoElementInitializer(this.specStyleSheet.getPseudoRules()));

    // console.time("cssLoading");
    CssLoader.loadAll(this.body);

    // after css loading, remove empty block node from element tree.
    this.body.acceptChildFilter(ValidBlockSelector.instance);
    // console.timeEnd("cssLoading");
    // console.timeEnd("initializeDocument");
  }

  public querySelectorAll(query: string): NehanElement[] {
    return this.documentElement.querySelectorAll(query);
  }

  public querySelector(query: string): NehanElement | null {
    return this.documentElement.querySelector(query);
  }

  public getElementById(id: string): NehanElement | null {
    return this.querySelector("#" + id);
  }

  public getSelectorCache(selector: string): NehanElement[] {
    return this.selectorCache.getCache(selector);
  }

  public addStyleSheet(stylesheet: CssStyleSheet): HtmlDocument {
    this.styleSheets.push(stylesheet);
    return this;
  }

  public addSelectorCache(tag_name: string, element: NehanElement) {
    this.selectorCache.addCache(tag_name, element);
  }

  public createElement(tag_name: string): NehanElement {
    let element = this.createNativeElement(tag_name);
    return this.createElementFromDOM(element);
  }

  public createNativeElement(tag_name: string): HTMLElement {
    return this.$document.createElement(tag_name);
  }

  public createElementFromDOM(node: HTMLElement | Node): NehanElement {
    const tagName = ((node instanceof Element) ? node.tagName : (node instanceof Text) ? "(text)" : "??").toLowerCase();
    if ((tagName === "body" || tagName === "html") && this.selectorCache.hasCache(tagName)) {
      return this.selectorCache.getCache(tagName)[0];
    }
    const element = new NehanElement(node, this);
    if (element.tagName === "body") {
      this.body = element;
    }
    element.root = this;
    this.selectorCache.addCache(tagName, element);
    this.selectorCache.addCache("*", element);
    return element;
  }

  public createTextNode(text: string): NehanElement {
    const element = this.$document.createTextNode(text);
    return this.createElementFromDOM(element);
  }
}

