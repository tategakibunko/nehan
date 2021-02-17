import {
  HtmlDocument,
  CssStyleDeclaration,
  DomTokenList,
  SelectorLexer,
  SelectorParser,
  ChildNodeFilter,
  NodeEffector,
  WhiteSpace,
  ReplacedElement,
  PhysicalSize,
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
  public id: string;
  public classList: DomTokenList;

  constructor(node: Node, root: HtmlDocument) {
    this.$node = node;
    this.tagName = this.getTagName();
    this.childNodes = [];
    this.parent = null;
    this.root = root;
    this.style = new CssStyleDeclaration();
    this.computedStyle = new CssStyleDeclaration();
    this.id = this.$node instanceof HTMLElement ? this.$node.id : "";
    this.classList = this.createClassList();
    this.setupChildren(node, root);
  }

  public acceptChildFilter(visitor: ChildNodeFilter): HtmlElement {
    this.childNodes = this.childNodes.filter(node => visitor.visit(node));
    return this;
  }

  public acceptEffector(visitor: NodeEffector): HtmlElement {
    visitor.visit(this);
    return this;
  }

  public acceptEffectorAll(visitor: NodeEffector): HtmlElement {
    visitor.visit(this);
    this.childNodes.forEach(node => node.acceptEffectorAll(visitor));
    return this;
  }

  public get nextSibling(): HtmlElement | null {
    if (!this.parent) {
      return null;
    }
    const index = this.parent.childNodes.indexOf(this);
    return (index < 0 || index + 1 >= this.parent.childNodes.length) ? null : this.parent.childNodes[index + 1];
  }

  public get previousSibling(): HtmlElement | null {
    if (!this.parent) {
      return null;
    }
    const index = this.parent.childNodes.indexOf(this);
    return (index > 0) ? this.parent.childNodes[index - 1] : null;
  }

  public clone(deep = false): HtmlElement {
    const element = this.ownerDocument.createElementFromDOM(this.$node.cloneNode(deep));
    element.style = this.style;
    element.computedStyle = this.computedStyle;
    return element;
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

  /*
  public get id(): string {
    if (this.$node instanceof HTMLElement) {
      return this.$node.id;
    }
    return "";
  }
  */

  /*
  public set id(str: string) {
    if (this.$node instanceof HTMLElement) {
      this.$node.id = str;
    }
  }
  */

  protected getTagName(): string {
    if (this.$node instanceof Text) {
      return "(text)";
    }
    if (this.$node instanceof HTMLElement ||
      this.$node instanceof SVGSVGElement) {
      return this.$node.tagName.toLowerCase();
    }
    console.info("unsupported node type:%o", this);
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
    const lexer = new SelectorLexer(query);
    const selector = new SelectorParser(lexer).parse();
    const elements = selector.querySelectorAll(this);
    return elements;
  }

  public querySelector(query: string): HtmlElement | null {
    const lexer = new SelectorLexer(query);
    const selector = new SelectorParser(lexer).parse();
    const element = selector.querySelector(this);
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
    this.childNodes.push(element);
    return this;
  }

  public replaceChild(new_child: HtmlElement, old_child: HtmlElement | null): HtmlElement {
    if (old_child) {
      const index = this.childNodes.indexOf(old_child);
      if (index >= 0) {
        new_child.parent = this;
        this.childNodes[index] = new_child;
      }
    }
    return new_child;
  }

  public removeChild(target_child: HtmlElement): HtmlElement {
    const index = this.childNodes.indexOf(target_child);
    if (index >= 0) {
      this.childNodes.splice(index, 1);
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
    const index = this.childNodes.indexOf(ref_node);
    if (index >= 0) {
      this.childNodes.splice(index, 0, new_node);
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
    return this.siblings.length === 1;
  }

  public isOnlyOfType(): boolean {
    const siblings = this.siblings.filter(sib => sib.tagName === this.tagName);
    return siblings.length === 1;
  }

  public isFirstChild(): boolean {
    if (!this.parent) {
      return true;
    }
    return this.parent.childNodes.indexOf(this) === 0;
  }

  public isLastChild(): boolean {
    if (!this.parent) {
      return true;
    }
    const children = this.parent.childNodes;
    return children[children.length - 1] === this;
  }

  public isFirstElementChild(): boolean {
    if (!this.parent) {
      return true; // if no element owns this, surely this element is first element.
    }
    return this.parent.children[0] === this;
  }

  public isLastElementChild(): boolean {
    if (!this.parent) {
      return true;
    }
    const children = this.parent.children;
    return children[children.length - 1] === this;
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
    const firstChild = this.firstChild;
    if (!firstChild) {
      return null;
    }
    if (firstChild.isTextElement()) {
      return firstChild;
    }
    const nextChild = firstChild.nextSibling;
    if (!nextChild) {
      return null;
    }
    return nextChild.firstTextElement;
  }

  public get lastChild(): HtmlElement | null {
    return this.childNodes[this.childNodes.length - 1] || null;
  }

  public get lastElementChild(): HtmlElement | null {
    const children = this.children;
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

  // atomChild is
  // 1. text-element consists of non-whitespace content 
  // 2. replaced element that has valid size.
  public get firstAtomChild(): HtmlElement | null {
    for (let i = 0; i < this.childNodes.length; i++) {
      const child = this.childNodes[i];
      if (child.isTextElement() && !WhiteSpace.isWhiteSpaceElement(child)) {
        return child;
      }
      if (ReplacedElement.isReplacedElement(child) && !PhysicalSize.load(child).hasZero()) {
        return child;
      }
      const firstAtomChild = child.firstAtomChild;
      if (firstAtomChild) {
        return firstAtomChild;
      }
    }
    return null;
  }

  public get siblings(): HtmlElement[] {
    if (!this.parent) {
      return [];
    }
    return this.parent.childNodes;
  }

  public get index(): number {
    if (!this.parent) {
      return 0;
    }
    return this.parent.childNodes.indexOf(this);
  }

  public get indexOfType(): number {
    if (!this.parent) {
      return 0;
    }
    return this.parent.childNodes.filter(child => child.tagName === this.tagName).indexOf(this);
  }

  public get indexOfElement(): number {
    if (!this.parent) {
      return 0;
    }
    return this.parent.children.indexOf(this);
  }

  // HTMLElement only
  public get children(): HtmlElement[] {
    return this.childNodes.filter(element => !element.isTextElement());
  }

  public getAttribute(name: string): string | null {
    if (this.$node instanceof HTMLElement) {
      return this.$node.getAttribute(name);
    }
    return null;
  }
}
