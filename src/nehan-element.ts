import {
  NehanDocument,
  CssStyleDeclaration,
  DomTokenList,
  SelectorLexer,
  SelectorParser,
  ChildNodeFilter,
  NodeEffector,
  WhiteSpace,
  ReplacedElement,
  PhysicalSize,
  CssLoader,
} from "./public-api";

// For performance reason, we use this `NehanElement` class for both `Node` and `Element`.
// Note that some properties(like `attributes`, `childNodes` etc) are not available
// if `this.$node` is not `Element` but `Node`.
// [TODO] remove selector cache on `NehanDocument` if some node is removed from tree.
export class NehanElement {
  public $node: Node | HTMLElement;
  public $dom: HTMLElement | undefined; // dynamically created DOM.
  public tagName: string;
  public childNodes: NehanElement[]; // [TODO] (NehanElement | NehanNode)[]
  public parent: NehanElement | null;
  public root: NehanDocument;
  public style: CssStyleDeclaration;
  public computedStyle: CssStyleDeclaration;
  public id: string;
  public classList: DomTokenList;

  constructor(node: Node, root: NehanDocument) {
    this.$node = node;
    this.$dom = undefined;
    this.tagName = this.getTagName();
    this.childNodes = [];
    this.parent = null;
    this.root = root;
    this.style = new CssStyleDeclaration();
    this.computedStyle = new CssStyleDeclaration();
    this.id = this.$node instanceof Element ? this.$node.id : "";
    this.classList = this.createClassList();
    this.setupChildren(this.$node, root);
  }

  public acceptChildFilter(visitor: ChildNodeFilter): NehanElement {
    this.childNodes = this.childNodes.filter(node => visitor.visit(node));
    return this;
  }

  public acceptEffector(visitor: NodeEffector): NehanElement {
    visitor.visit(this);
    return this;
  }

  public acceptEffectorAll(visitor: NodeEffector): NehanElement {
    visitor.visit(this);
    this.childNodes.forEach(node => node.acceptEffectorAll(visitor));
    return this;
  }

  public get nextSibling(): NehanElement | null {
    if (!this.parent) {
      return null;
    }
    const index = this.parent.childNodes.indexOf(this);
    return (index < 0 || index + 1 >= this.parent.childNodes.length) ? null : this.parent.childNodes[index + 1];
  }

  public get previousSibling(): NehanElement | null {
    if (!this.parent) {
      return null;
    }
    const index = this.parent.childNodes.indexOf(this);
    return (index > 0) ? this.parent.childNodes[index - 1] : null;
  }

  public clone(deep = false): NehanElement {
    const element = this.ownerDocument.createNehanElement(this.$node.cloneNode(deep));
    element.style = this.style;
    element.computedStyle = this.computedStyle;
    return element;
  }

  protected createClassList(): DomTokenList {
    if (this.$node instanceof Element) {
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

  protected setupChildren($node: Node, root: NehanDocument) {
    if ($node instanceof Element) {
      for (let i = 0; i < $node.childNodes.length; i++) {
        let child = $node.childNodes.item(i);
        let child_element = root.createNehanElement(child);
        this.appendChild(child_element);
      }
    }
  }

  public set innerHTML(html: string) {
    (this.$node as HTMLElement).innerHTML = html;
    this.childNodes = [];
    this.setupChildren(this.$node, this.root);
    CssLoader.loadAll(this);
  }

  public get innerHTML(): string {
    if (this.isTextElement()) {
      return this.textContent;
    }
    return (this.$node as HTMLElement).innerHTML;
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
    if (this.$node instanceof Element) {
      return this.$node.attributes;
    }
    return null;
  }

  public get dataset(): DOMStringMap {
    if (this.$node instanceof Element) {
      return this.$node.dataset;
    }
    throw new Error("dataset is not defined(not HTMLElement)");
  }

  public get textContent(): string {
    return this.$node.textContent || "";
  }

  protected getTagName(): string {
    if (this.$node instanceof Text) {
      return "(text)";
    }
    if (this.$node instanceof Element) {
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

  public querySelectorAll(query: string): NehanElement[] {
    const lexer = new SelectorLexer(query);
    const selector = new SelectorParser(lexer).parse();
    const elements = selector.querySelectorAll(this);
    return elements;
  }

  public querySelector(query: string): NehanElement | null {
    const lexer = new SelectorLexer(query);
    const selector = new SelectorParser(lexer).parse();
    const element = selector.querySelector(this);
    return element;
  }

  public queryLeafs(selector: string): NehanElement[] {
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

  public appendChild(element: NehanElement): NehanElement {
    element.parent = this;
    this.childNodes.push(element);
    return this;
  }

  public replaceChild(new_child: NehanElement, old_child: NehanElement | null): NehanElement {
    if (old_child) {
      const index = this.childNodes.indexOf(old_child);
      if (index >= 0) {
        new_child.parent = this;
        this.childNodes[index] = new_child;
      }
    }
    return new_child;
  }

  public removeChild(target_child: NehanElement): NehanElement {
    const index = this.childNodes.indexOf(target_child);
    if (index >= 0) {
      this.childNodes.splice(index, 1);
    }
    return target_child;
  }

  public insertBefore(new_node: NehanElement, ref_node: NehanElement | null): NehanElement | null {
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
    if (this.$node instanceof Element) {
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
    if (this.$node instanceof Element) {
      this.$node.setAttribute(name, value);
    }
  }

  public get ownerDocument(): NehanDocument {
    return this.root as NehanDocument;
  }

  public get firstChild(): NehanElement | null {
    return this.childNodes[0] || null;
  }

  public get firstTextElement(): NehanElement | null {
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

  public get lastChild(): NehanElement | null {
    return this.childNodes[this.childNodes.length - 1] || null;
  }

  public get lastElementChild(): NehanElement | null {
    const children = this.children;
    return children[children.length - 1] || null;
  }

  public get firstElementChild(): NehanElement | null {
    return this.children[0] || null;
  }

  public get nextElementSibling(): NehanElement | null {
    let next = this.nextSibling;
    while (next) {
      if (next.isElement()) {
        break;
      }
      next = next.nextSibling;
    }
    return next;
  }

  public get previousElementSibling(): NehanElement | null {
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
  public get firstAtomChild(): NehanElement | null {
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

  public get siblings(): NehanElement[] {
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
  public get children(): NehanElement[] {
    return this.childNodes.filter(element => !element.isTextElement());
  }

  public getAttribute(name: string): string | null {
    if (this.$node instanceof Element) {
      return this.$node.getAttribute(name);
    }
    return null;
  }
}
