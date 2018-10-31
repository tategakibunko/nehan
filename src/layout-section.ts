import {
  HtmlElement,
  Utils,
} from "./public-api";

export class LayoutSection {
  public parent?: LayoutSection;
  public header?: HtmlElement; // heading of this section
  public children: LayoutSection [];
  public closed: boolean;
  public pageIndex: number;

  constructor(header?: HtmlElement){
    this.header = header;
    this.children = [];
    this.closed = false;
    this.pageIndex = 0;
  }

  public isNode(): boolean {
    return this.children.length > 0;
  }

  public isLeaf(): boolean {
    return this.children.length === 0;
  }

  public setHeader(header: HtmlElement){
    if(!this.header){
      this.header = header;
    }
  }

  public addChild(child: LayoutSection): LayoutSection {
    this.children.push(child);
    child.parent = this;
    return this;
  }

  public get level(): number {
    return this.header? Utils.getHeaderLevel(this.header) : -1;
  }

  public get title(): string {
    if(this.header){
      return this.header.textContent;
    }
    return (!this.parent)? "(root)" : "no title"
  }

  static isHeaderElement(element: HtmlElement): boolean {
    switch(element.tagName){
    case "h1": case "h2": case "h3": case "h4": case "h5": case "h6":
      return true;
    }
    return false;
  }

  static isSectioningElement(element: HtmlElement): boolean {
    switch(element.tagName){
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
    switch(element.tagName){
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

