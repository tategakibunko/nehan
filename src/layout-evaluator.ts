import {
  LogicalBox,
  FlowContext,
  BoxType,
  BoxContent,
  Config,
  Prefix,
  Word,
  Char,
  SpaceChar,
  RefChar,
  HalfChar,
  DualChar,
  SmpUniChar,
  MixChar,
  Ruby,
  Tcy,
  LayoutValueType,
} from "./public-api";

export type LayoutParent = LogicalBox | null;

export class LayoutEvaluator {
  public bodyContext: FlowContext;

  constructor(body_context: FlowContext){
    this.bodyContext = body_context;
  }

  public eval(box: LogicalBox): HTMLElement {
    return this.evalBox(null, box);
  }

  protected evalBox(parent: LayoutParent, box: LogicalBox): HTMLElement {
    //console.log("evalBox:(%s, %s):", box.tagName, box.boxType, box);
    switch(box.boxType){
    case BoxType.TABLE_ROW:
      return this.evalTableRow(parent, box);
    default:
      return this.evalFlowBox(parent, box);
    }
  }

  protected createLineNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    throw new Error("must be overrided.");
  }

  protected createBaselineNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    throw new Error("must be overrided.");
  }

  // [NOTE]
  // this function is never called, because text-box is force inlined
  // when it's added to FlowContent(see FlowContent::addTextBox).
  protected createTextNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    throw new Error("must be overrided.");
  }

  protected createInlineNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    throw new Error("must be overrided.");
  }

  protected createInlineLinkNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    let node = document.createElement("a");
    let element = box.element;
    let href = element.getAttribute("href") || "";
    let title = element.getAttribute("title") || "";
    let anchor_name = (href.charAt(0) === "#")? href.substring(1) : "";
    let outline = this.bodyContext.outline;
    let anchor = outline.getAnchor(anchor_name);
    let anchor_page_index = anchor? anchor.pageIndex : box.pageIndex;
    let page_index = box.pageIndex;
    let e_classes = box.classList.values().map(Prefix.addExternal);
    let i_classes = ["inline", "a"].map(Prefix.addInternal);
    i_classes.concat(e_classes).forEach(klass => node.classList.add(klass));
    if(box.id){
      node.id = Prefix.addExternal(box.id);
    }
    node.setAttribute("href", href);
    node.setAttribute("title", title);
    node.dataset.anchorPageIndex = String(anchor_page_index);
    node.dataset.pageIndex = String(page_index);
    box.getCssInline(parent).apply(node);
    return node;
  }

  protected createInlineBlockNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    throw new Error("must be overrided.");
  }

  protected createBlockNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    throw new Error("must be overrided.");
  }

  protected createFlowNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    //console.log("createFlowNode(%s, %s):", box.tagName, box.boxType, box);
    switch(box.boxType){
    case BoxType.LINE:
      return this.createLineNode(parent, box);
    case BoxType.BASELINE:
      return this.createBaselineNode(parent, box);
    case BoxType.TEXT:
      return this.createTextNode(parent, box);
    case BoxType.INLINE:
      switch(box.tagName){
      case "a":
	return this.createInlineLinkNode(parent, box);
      default:
	return this.createInlineNode(parent, box);
      }
    case BoxType.INLINE_BLOCK:
      return this.createInlineBlockNode(parent, box);
    case BoxType.BLOCK:
      return this.createBlockNode(parent, box);
    case BoxType.TABLE:
    case BoxType.TABLE_ROW_GROUP:
    case BoxType.TABLE_ROW:
    case BoxType.TABLE_CELL:
      return this.createBlockNode(parent, box); // TODO
    }
    console.error("unsupported box:", box);
    //return this.createBlockNode(parent, box);
    throw new Error("unsupported box type:" + box.boxType);
  }

  protected evalFlowBox(parent: LayoutParent, box: LogicalBox): HTMLElement {
    //console.log("evalBox(%s, %s):", box.tagName, box.boxType, box);
    let node: HTMLElement = this.createFlowNode(parent, box);
    if(!box.isLine() && !box.isBaseline()){
      box.element.style.callDomCallbacks(box, node);
    }
    if(Config.debugElementByClick){
      node.addEventListener("click", (e) => {
	console.info(box);
      });
    }
    node = box.getChildren().reduce((node, child) => {
      let child_node = this.evalFlowChild(box, child);
      node.appendChild(child_node);
      this.appendBoxChildAfter(node, box, child);
      return node;
    }, node);
    node.normalize(); // normalize for horizontal mode.
    return node;
  }

  protected appendBoxChildAfter(node: HTMLElement, box: LogicalBox, child: BoxContent){
  }

  protected evalTableRow(parent: LayoutParent, box: LogicalBox): HTMLElement {
    //throw new Error("todo");
    return this.evalFlowBox(parent, box);
  }

  // image is replaced element, so createElement is not required.
  protected evalImage(parent: LogicalBox, image: LogicalBox): HTMLElement {
    let $node = image.element.$node as HTMLImageElement;
    let element = document.createElement("img") as HTMLImageElement;
    let ph_size = image.physicalSize;
    let e_classes = image.classList.values().map(Prefix.addExternal);
    if($node.id){
      element.id = Prefix.addExternal($node.id);
    }
    element.src = $node.src;
    element.width = ph_size.width;
    element.height = ph_size.height;
    element.classList.add(Prefix.addInternal("img"));

    if(image.isBlockLevel()){
      element.classList.add(Prefix.addInternal("block"));
      image.getCssBlockRe(parent).apply(element);
    } else if(parent && parent.isTextVertical()){
      let css = image.getCssInlineVertRe(parent);
      css.apply(element);
      element.classList.add(Prefix.addInternal("inline"));
    }
    e_classes.forEach(klass => element.classList.add(klass));
    image.element.style.callDomCallbacks(image, element);
    return element;
  }

  protected evalFlowChild(parent: LogicalBox, child: LayoutValueType): Node {
    if(child instanceof LogicalBox){
      if(child.isImage()){
	return this.evalImage(parent, child);
      }
      return this.evalBox(parent, child);
    }
    if(child instanceof Word){
      return this.evalWord(parent, child);
    }
    if(child instanceof Char){
      return this.evalChar(parent, child);
    }
    if(child instanceof SpaceChar){
      return this.evalSpaceChar(parent, child);
    }
    if(child instanceof RefChar){
      return this.evalRefChar(parent, child);
    }
    if(child instanceof HalfChar){
      return this.evalHalfChar(parent, child);
    }
    if(child instanceof SmpUniChar){
      return this.evalSmpUniChar(parent, child);
    }
    if(child instanceof MixChar){
      return this.evalMixChar(parent, child);
    }
    if(child instanceof DualChar){
      return this.evalDualChar(parent, child);
    }
    if(child instanceof Ruby){
      return this.evalRuby(parent, child);
    }
    if(child instanceof Tcy){
      return this.evalTcy(parent, child);
    }
    throw new Error("undefined layout value");
  }

  protected evalRuby(parent: LogicalBox, ruby: Ruby): HTMLElement {
    throw new Error("not implemented");
  }

  protected evalWord(parent: LogicalBox, word: Word): Node {
    throw new Error("not implemented");
  }

  protected evalChar(parent: LogicalBox, char: Char): Node {
    throw new Error("not implemented");
  }

  protected evalSpaceChar(parent: LogicalBox, char: SpaceChar): Node {
    throw new Error("not implemented");
  }

  protected evalRefChar(parent: LogicalBox, char: RefChar): Node {
    throw new Error("not implemented");
  }

  protected evalHalfChar(parent: LogicalBox, char: HalfChar): Node {
    throw new Error("not implemented");
  }

  protected evalSmpUniChar(parent: LogicalBox, char: SmpUniChar): Node {
    throw new Error("not implemented");
  }

  protected evalMixChar(parent: LogicalBox, char: MixChar): Node {
    throw new Error("not implemented");
  }

  protected evalDualChar(parent: LogicalBox, char: DualChar): Node {
    throw new Error("not implemented");
  }

  protected evalTcy(parent: LogicalBox, tcy: Tcy): Node {
    throw new Error("not implemented");
  }
}

