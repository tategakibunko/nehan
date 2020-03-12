import {
  HtmlElement,
} from "./public-api";

export class LayoutSection {
  public parent?: LayoutSection;
  public header?: HtmlElement; // heading of this section
  public children: LayoutSection[];
  public closed: boolean;
  public pageIndex: number;

  constructor(header?: HtmlElement) {
    this.header = header;
    this.children = [];
    this.closed = false;
    this.pageIndex = 0;
  }

  public isRoot(): boolean {
    return !!!this.parent;
  }

  public isNode(): boolean {
    return this.children.length > 0;
  }

  public isLeaf(): boolean {
    return this.children.length === 0;
  }

  public setHeader(header: HtmlElement) {
    if (!this.header) {
      this.header = header;
    }
  }

  public addChild(child: LayoutSection): LayoutSection {
    this.children.push(child);
    child.parent = this;
    return this;
  }

  public get level(): number {
    return this.header ? LayoutSection.getHeaderLevel(this.header) : -1;
  }

  public get title(): string {
    if (this.header) {
      return this.header.textContent;
    }
    return (!this.parent) ? "(root)" : "no title"
  }

  static isHeaderElement(element: HtmlElement): boolean {
    switch (element.tagName) {
      case "h1": case "h2": case "h3": case "h4": case "h5": case "h6":
        return true;
    }
    return false;
  }

  static getHeaderLevel(element: HtmlElement): number {
    switch (element.tagName) {
      case "h1": return 1;
      case "h2": return 2;
      case "h3": return 3;
      case "h4": return 4;
      case "h5": return 5;
      case "h6": return 6;
    }
    throw new Error(`Invalid header:${element.tagName}`);
  }

  static isSectioningElement(element: HtmlElement): boolean {
    switch (element.tagName) {
      case "body":
      case "section":
      case "nav":
      case "article":
      case "aside":
        return true;
    }
    return false;
  }

  static isSectioningRootElement(element: HtmlElement): boolean {
    switch (element.tagName) {
      case "body":
      case "blockquote":
      case "fieldset":
      case "figure":
      case "td":
        return true;
    }
    return false;
  }
}

