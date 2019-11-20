import {
  HtmlDocument,
  CssStyleDeclaration,
  DomTokenList,
  SelectorParser,
} from "./public-api";

// For performance reason, we use this [HtmlElement] class for both [Node] and [HTMLElement].
// Note that some properties(like [attributes], [childNodes] etc) are not available
// if [this.$node] is [Node].
export class HtmlElement {
  public $node: Node | HTMLElement;
  public tagName: string;
  public childNodes: HtmlElement[];
  public parent: HtmlElement | null;
  public root: HtmlDocument;
  public style: CssStyleDeclaration;
  public computedStyle: CssStyleDeclaration;
  public classList: DomTokenList;
  public nextSibling: HtmlElement | null;
  public previousSibling: HtmlElement | null;

  constructor(node: Node, root: HtmlDocument) {
    this.$node = node;
    this.tagName = this.getTagName();
    this.childNodes = [];
    this.parent = null;
    this.root = root;
    this.style = new CssStyleDeclaration();
    this.computedStyle = new CssStyleDeclaration();
    this.classList = this.createClassList();
    this.nextSibling = null;
    this.previousSibling = null;
    this.setupChildren(node, root);
  }

  public clone(deep = false): HtmlElement {
    return this.ownerDocument.createElementFromDOM(this.$node.cloneNode(deep));
  }

  protected createClassList(): DomTokenList {
    if (this.$node instanceof HTMLElement) {
      let items: string[] = [];
      // classList.values() is not defined in typescript signature...?
      for (let i = 0; i < this.$node.classList.length; i++) {
        let item = this.$node.classList.item(i);
        if (item !== null) {
          items.push(item);
        }
      }
      return new DomTokenList(items);
    }
    return new DomTokenList([] as string[]);
  }

  protected setupChildren(node: Node, root: HtmlDocument) {
    if (node instanceof HTMLElement) {
      for (let i = 0; i < node.childNodes.length; i++) {
        let child = node.childNodes.item(i);
        let child_element = root.createElementFromDOM(child);
        this.appendChild(child_element);
      }
    }
  }

  public get className(): string {
    return this.classList.values().join(" ");
  }

  public set className(class_names: string) {
    let tokens = class_names.split(" ").filter(cls => cls !== "");
    this.classList = new DomTokenList(tokens);
  }

  // example
  // ::before -> before
  public get pureTagName(): string {
    return this.tagName.replace("::", "");
  }

  public get attributes(): NamedNodeMap | null {
    if (this.$node instanceof HTMLElement) {
      return this.$node.attributes;
    }
    return null;
  }

  public get dataset(): DOMStringMap {
    if (this.$node instanceof HTMLElement) {
      return this.$node.dataset;
    }
    throw new Error("dataset is not defined(not HTMLElement)");
  }

  public get textContent(): string {
    return this.$node.textContent || "";
  }

  public get id(): string {
    if (this.$node instanceof HTMLElement) {
      return this.$node.id;
    }
    return "";
  }

  public set id(str: string) {
    if (this.$node instanceof HTMLElement) {
      this.$node.id = str;
    }
  }

  protected getTagName(): string {
    if (this.$node instanceof Text) {
      return "(text)";
    }
    if (this.$node instanceof HTMLElement ||
      this.$node instanceof SVGSVGElement) {
      return this.$node.tagName.toLowerCase();
    }
    console.warn("unsupported node type:%o", this);
    return "???";
  }

  public getNodeName(): string {
    let str = this.tagName;
    if (this.id) {
      str += "#" + this.id;
    }
    // classList.values is not allowed in typescript, why?
    for (let i = 0; i < this.classList.length; i++) {
      str += "." + this.classList.item(i);
    }
    return str;
  }

  public getPath(with_parent: boolean = false): string {
    let str = this.getNodeName();
    if (!with_parent) {
      return str;
    }
    let parent = this.parent;
    while (parent) {
      str = parent.getNodeName() + ">" + str;
      parent = parent.parent;
    }
    return str;
  }

  public toString(with_index: boolean = false): string {
    let str = this.getPath(true);
    if (!with_index) {
      return str;
    }
    let index = this.indexOfType;
    str += "(" + index + ")";
    return str;
  }

  public querySelectorAll(query: string): HtmlElement[] {
    let selector = SelectorParser.parse(query);
    let elements = selector.querySelectorAll(this);
    return elements;
  }

  public querySelector(query: string): HtmlElement | null {
    let selector = SelectorParser.parse(query);
    let element = selector.querySelector(this);
    return element;
  }

  public queryLeafs(selector: string): HtmlElement[] {
    return this.root.getSelectorCache(selector).filter(leaf => {
      let parent = leaf.parent;
      while (parent) {
        if (parent === this) {
          return true;
        }
        parent = parent.parent;
      }
      return false;
    });
  }

  public appendChild(element: HtmlElement): HtmlElement {
    element.parent = this;
    let prev = this.lastChild;
    if (prev) {
      element.previousSibling = prev;
      prev.nextSibling = element;
    }
    this.childNodes.push(element);
    return this;
  }

  public replaceChild(new_child: HtmlElement, old_child: HtmlElement | null): HtmlElement {
    for (let i = 0; i < this.childNodes.length; i++) {
      if (this.childNodes[i] === old_child) {
        new_child.parent = this;
        this.childNodes[i] = new_child;
        if (i > 0) {
          let prev = this.childNodes[i - 1];
          new_child.previousSibling = prev;
          prev.nextSibling = new_child;
        }
        if (i < this.childNodes.length - 1) {
          let next = this.childNodes[i + 1];
          new_child.nextSibling = next;
          next.previousSibling = new_child;
        }
        break;
      }
    }
    return new_child;
  }

  public removeChild(target_child: HtmlElement): HtmlElement {
    for (let i = 0; i < this.childNodes.length; i++) {
      let child = this.childNodes[i];
      if (child === target_child) {
        if (child.previousSibling) {
          child.previousSibling.nextSibling = child.nextSibling;
        }
        if (child.nextSibling) {
          child.nextSibling.previousSibling = child.previousSibling;
        }
        this.childNodes.splice(i, 1);
        break;
      }
    }
    return target_child;
  }

  public insertBefore(new_node: HtmlElement, ref_node: HtmlElement | null): HtmlElement | null {
    if (!ref_node) {
      this.appendChild(new_node);
      return null;
    }
    if (ref_node.parent !== this) {
      throw new Error("reference node is not included in this element");
    }
    new_node.parent = this;
    for (let i = 0; i < this.childNodes.length; i++) {
      let child = this.childNodes[i];
      if (child === ref_node) {
        if (ref_node.previousSibling) {
          ref_node.previousSibling.nextSibling = new_node;
          new_node.previousSibling = ref_node.previousSibling;
        }
        new_node.nextSibling = ref_node;
        ref_node.previousSibling = new_node;
        this.childNodes.splice(i, 0, new_node);
        break;
      }
    }
    return ref_node.nextSibling ? new_node : null;
  }

  public hasAttribute(name: string): boolean {
    if (this.$node instanceof HTMLElement) {
      return this.$node.hasAttribute(name);
    }
    return false;
  }

  public isOnlyChild(): boolean {
    let siblings = this.siblings;
    return siblings.length === 1;
  }

  public isOnlyOfType(): boolean {
    let siblings = this.siblings.filter(sib => sib.tagName === this.tagName);
    return siblings.length === 1;
  }

  public isFirstChild(): boolean {
    let siblings = this.siblings;
    return (siblings.length > 0) ? siblings[0] === this : false;
  }

  public isLastChild(): boolean {
    let siblings = this.siblings;
    return (siblings.length > 0) ? siblings[siblings.length - 1] === this : false;
  }

  public isFirstElementChild(): boolean {
    if (!this.parent) {
      return true; // if no element owns this, surely this element is first element.
    }
    return this.parent.children[0] === this;
  }

  public isLastElementChild(): boolean {
    let siblings = this.siblings.filter(sib => !sib.isTextElement());
    return (siblings.length > 0) ? siblings[siblings.length - 1] === this : false;
  }

  public isNthChild(nth: number): boolean {
    return this.index === Math.max(nth - 1, 0);
  }

  public isElement(): boolean {
    return this.$node instanceof HTMLElement;
  }

  public isTextElement(): boolean {
    return this.$node instanceof Text;
  }

  public setAttribute(name: string, value: string) {
    if (this.$node instanceof HTMLElement) {
      this.$node.setAttribute(name, value);
    }
  }

  public get ownerDocument(): HtmlDocument {
    return this.root as HtmlDocument;
  }

  public get firstChild(): HtmlElement | null {
    return this.childNodes[0] || null;
  }

  public get firstTextElement(): HtmlElement | null {
    let first_child = this.firstChild;
    if (!first_child) {
      return null;
    }
    if (first_child.isTextElement()) {
      return first_child;
    }
    let next_child = first_child.nextSibling;
    if (!next_child) {
      return null;
    }
    return next_child.firstTextElement;
  }

  public get lastChild(): HtmlElement | null {
    return this.childNodes[this.childNodes.length - 1] || null;
  }

  public get lastElementChild(): HtmlElement | null {
    let children = this.children;
    return children[children.length - 1] || null;
  }

  public get firstElementChild(): HtmlElement | null {
    return this.children[0] || null;
  }

  public get nextElementSibling(): HtmlElement | null {
    let next = this.nextSibling;
    while (next) {
      if (next.isElement()) {
        break;
      }
      next = next.nextSibling;
    }
    return next;
  }

  public get previousElementSibling(): HtmlElement | null {
    let prev = this.previousSibling;
    while (prev) {
      if (prev.isElement()) {
        break;
      }
      prev = prev.previousSibling;
    }
    return prev;
  }

  public get siblings(): HtmlElement[] {
    if (!this.parent) {
      return [];
    }
    return this.parent.childNodes;
  }

  public get index(): number {
    if (!this.parent) {
      return -1;
    }
    return this.parent.childNodes.indexOf(this);
  }

  public get indexOfType(): number {
    if (!this.parent) {
      return -1;
    }
    let siblings = this.parent.childNodes.filter(child => child.tagName === this.tagName);
    return siblings.indexOf(this);
  }

  // HTMLElement only
  public get children(): HtmlElement[] {
    return this.childNodes.filter((element) => {
      return element.isTextElement() === false;
    });
  }

  public getAttribute(name: string): string | null {
    if (this.$node instanceof HTMLElement) {
      return this.$node.getAttribute(name);
    }
    return null;
  }
}
