import {
  Config,
  Char,
  SpaceChar,
  HalfChar,
  MixChar,
  Tcy,
  Word,
  SmpUniChar,
  RefChar,
  DualChar,
  LogicalTextNode,
  LogicalRubyNode,
  LogicalInlineNode,
  LogicalLineNode,
  LogicalBlockNode,
  LogicalInlineBlockNode,
  ILogicalNodeEvaluator,
  ILogicalCssEvaluator,
  LogicalTableCellsNode,
  LogicalBlockReNode,
  LogicalInlineReNode,
  TextEmphaData,
  LogicalBoxEdge,
  IFlowRootFormatContext,
  ILogicalTextJustifier,
} from './public-api'

export class HoriLogicalNodeEvaluator implements ILogicalNodeEvaluator {
  constructor(
    private pageRoot: IFlowRootFormatContext,
    private cssVisitor: ILogicalCssEvaluator,
    private textJustifier: ILogicalTextJustifier,
  ) { }

  visitChar(char: Char): HTMLElement | Node {
    return document.createTextNode(char.text);
  }

  visitCharEmpha(char: Char, empha: TextEmphaData): HTMLElement | Node {
    const node = document.createElement("div");
    const emphaNode = document.createElement("div");
    const textNode = document.createElement("div");
    emphaNode.appendChild(document.createTextNode(empha.text));
    textNode.appendChild(document.createTextNode(char.text));
    if (empha.scale < 1.0) {
      emphaNode.style.fontSize = String(empha.scale) + "em";
      emphaNode.style.paddingBottom = String(empha.scale / 2) + "em";
    }
    node.style.display = "inline-block";
    node.style.textAlign = "center";
    node.appendChild(emphaNode);
    node.appendChild(textNode);
    return node;
  }

  visitRefChar(refChar: RefChar): HTMLElement | Node {
    return document.createTextNode(refChar.text);
  }

  visitRefCharEmpha(refChar: RefChar, empha: TextEmphaData): HTMLElement | Node {
    return this.visitCharEmpha(refChar as Char, empha);
  }

  visitSpaceChar(spaceChar: SpaceChar): HTMLElement | Node {
    const node = document.createElement("span");
    node.style.display = "inline-block";
    node.style.width = spaceChar.size.measure + "px";
    node.appendChild(document.createTextNode(spaceChar.text));
    return node;
  }

  visitHalfChar(halfChar: HalfChar): HTMLElement | Node {
    return document.createTextNode(halfChar.text);
  }

  visitMixChar(mixChar: MixChar): HTMLElement | Node {
    const node = document.createElement("span");
    node.style.display = "inline-block";
    node.style.width = "1.25em";
    node.appendChild(document.createTextNode(mixChar.text));
    return node;
  }

  visitDualChar(dualChar: DualChar): HTMLElement | Node {
    return document.createTextNode(dualChar.text);
  }

  visitDualCharKern(dualChar: DualChar): HTMLElement | Node {
    const node = document.createElement("span");
    node.style.marginLeft = "-0.5em";
    node.appendChild(document.createTextNode(dualChar.text));
    return node;
  }

  visitSmpUniChar(uniChar: SmpUniChar): HTMLElement | Node {
    return document.createTextNode(uniChar.text);
  }

  visitTcy(tcy: Tcy): HTMLElement | Node {
    return document.createTextNode(tcy.text);
  }

  visitWord(word: Word): HTMLElement | Node {
    return document.createTextNode(word.text);
  }

  visitText(textNode: LogicalTextNode): HTMLElement {
    const node = document.createElement("div");
    node.className = "nehan-text";
    node.style.display = "inline-block";
    node.style.lineHeight = "1";
    textNode.children.forEach(char => {
      const charNode = char.acceptEvaluator(this);
      if (char.spacing) {
        const spacingWrap = document.createElement("span");
        spacingWrap.style.paddingRight = char.spacing + "px";
        spacingWrap.appendChild(charNode);
        node.appendChild(spacingWrap);
      } else {
        node.appendChild(charNode);
      }
    });
    node.normalize();
    return node;
  }

  visitRuby(rubyNode: LogicalRubyNode): HTMLElement {
    const node = document.createElement("div");
    node.className = "nehan-ruby";
    const rbNode = document.createElement("div").appendChild(rubyNode.rb.acceptEvaluator(this));
    const rtNode = document.createElement("div").appendChild(rubyNode.rt.acceptEvaluator(this));
    rbNode.style.display = "block";
    rtNode.style.display = "block";
    rtNode.style.lineHeight = "1";
    node.appendChild(rtNode);
    node.appendChild(rbNode);
    node.style.display = "inline-block";
    node.style.textAlign = "center";
    rubyNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    rubyNode.env.color.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    rubyNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitLine(lineNode: LogicalLineNode): HTMLElement {
    const node = document.createElement("div");
    node.className = "nehan-line";
    node.style.boxSizing = "content-box";
    node.style.position = "absolute";
    node.style.overflow = "visible";
    node.style.top = lineNode.linePos.before + "px";
    lineNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    lineNode.env.color.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    lineNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);

    const baseLineNode = document.createElement("div");
    baseLineNode.className = "nehan-baseline";
    baseLineNode.style.position = "absolute";
    baseLineNode.style.left = (lineNode.linePos.start + lineNode.baseline.startOffset) + "px";
    baseLineNode.style.width = lineNode.size.measure + 2 * lineNode.env.font.size + "px"; // Prepare space for 'Bura-sagari'.
    baseLineNode.style.height = lineNode.baseline.size.extent + "px";
    baseLineNode.style.bottom = lineNode.baseline.blockOffset + "px";

    if (lineNode.env.textAlign.isJustify()) {
      this.textJustifier.justify(lineNode);
    }

    node.appendChild(baseLineNode);
    lineNode.children.forEach(child => {
      baseLineNode.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitInline(inlineNode: LogicalInlineNode): HTMLElement {
    const node = this.pageRoot.createElement("span", ["inline"], inlineNode);
    node.style.marginLeft = inlineNode.edge.margin.start + "px";
    node.style.marginRight = inlineNode.edge.margin.end + "px";
    inlineNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.color.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitInlineEmpha(inlineNode: LogicalInlineNode): HTMLElement {
    const node = this.pageRoot.createElement("span", ["inline", "empha"], inlineNode);
    node.style.display = "inline-block";
    node.style.marginLeft = inlineNode.edge.margin.start + "px";
    node.style.marginRight = inlineNode.edge.margin.end + "px";
    inlineNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.color.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitInlineBlock(iblockNode: LogicalInlineBlockNode): HTMLElement {
    const node = this.pageRoot.createElement("span", ["iblock"], iblockNode);
    node.style.display = "inline-block";
    node.style.boxSizing = "content-box";
    node.style.position = "relative";
    node.style.paddingLeft = iblockNode.env.edge.padding.start + "px";
    node.style.paddingRight = iblockNode.env.edge.padding.end + "px";
    node.style.marginLeft = iblockNode.env.edge.margin.start + "px";
    node.style.marginRight = iblockNode.env.edge.margin.end + "px";
    iblockNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    iblockNode.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    iblockNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    iblockNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitBlock(blockNode: LogicalBlockNode): HTMLElement {
    const node = this.pageRoot.createElement("div", ["block"], blockNode);
    node.style.boxSizing = "content-box";
    node.style.position = (blockNode.env.element.tagName === Config.pageRootTagName) ? "relative" : "absolute";
    node.style.paddingLeft = blockNode.env.edge.padding.start + "px";
    node.style.paddingRight = blockNode.env.edge.padding.end + "px";
    if (blockNode.env.position.isAbsolute()) {
      blockNode.env.absPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    } else {
      blockNode.layoutPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    }
    blockNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitRootBlock(rootBlockNode: LogicalBlockNode): HTMLElement {
    const node = this.pageRoot.createElement("div", ["root"], rootBlockNode);
    const edge = LogicalBoxEdge.loadBoxEdge(rootBlockNode.env.element);
    node.className = "nehan-root";
    node.style.width = rootBlockNode.measure + edge.measure + "px";
    node.style.height = rootBlockNode.extent + edge.extent + "px";
    edge.margin.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    edge.padding.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    rootBlockNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitTableCells(tableCellsNode: LogicalTableCellsNode): HTMLElement {
    const node = this.pageRoot.createElement("div", ["table-cells"], tableCellsNode);
    node.style.boxSizing = "content-box";
    node.style.position = "absolute";
    tableCellsNode.rowPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    tableCellsNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    tableCellsNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitBlockImage(imgNode: LogicalBlockReNode): HTMLElement {
    const node = this.pageRoot.createElement("img", ["block"], imgNode);
    node.style.position = "absolute";
    node.style.width = imgNode.physicalSize.width + "px";
    node.style.height = imgNode.physicalSize.height + "px";
    node.setAttribute("src", imgNode.env.element.getAttribute("src") || "");
    imgNode.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    if (imgNode.env.position.isAbsolute()) {
      imgNode.env.absPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    } else {
      imgNode.layoutPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    }
    imgNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitInlineImage(imgNode: LogicalInlineReNode): HTMLElement {
    const node = this.pageRoot.createElement("img", ["inline"], imgNode);
    node.style.display = "inline";
    node.style.width = imgNode.physicalSize.width + "px";
    node.style.height = imgNode.physicalSize.height + "px";
    node.style.marginLeft = imgNode.edge.margin.start + "px";
    node.style.marginRight = imgNode.edge.margin.end + "px";
    node.style.verticalAlign = "bottom";
    node.setAttribute("src", imgNode.env.element.getAttribute("src") || "");
    imgNode.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    imgNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitBlockVideo(videoNode: LogicalBlockReNode): HTMLElement {
    const node = videoNode.env.element.$node.cloneNode(true) as HTMLElement;
    node.setAttribute("width", String(videoNode.physicalSize.width));
    node.setAttribute("height", String(videoNode.physicalSize.height));
    node.removeAttribute("style"); // remove inline style attribute from cloned node.
    node.style.position = "absolute";
    node.style.marginLeft = videoNode.edge.margin.start + "px";
    node.style.marginRight = videoNode.edge.margin.end + "px";
    node.style.verticalAlign = "bottom";
    videoNode.layoutPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    videoNode.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    videoNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitInlineVideo(videoNode: LogicalInlineReNode): HTMLElement {
    const node = this.pageRoot.createElement("span", ["inline"], videoNode);
    node.style.display = "none";
    node.style.width = "0";
    node.style.height = "0";
    node.innerHTML = "Sorry, inline video is not supported yet!";
    return node;
  }

  visitBlockReFixed(reNodeFixed: LogicalBlockReNode, fixedDOM: HTMLElement): HTMLElement {
    const node = this.pageRoot.createElement("div", ["block"], reNodeFixed);
    node.style.position = "absolute";
    node.style.width = reNodeFixed.physicalSize.width + "px";
    node.style.height = reNodeFixed.physicalSize.height + "px";
    node.appendChild(fixedDOM);
    reNodeFixed.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    if (reNodeFixed.env.position.isAbsolute()) {
      reNodeFixed.env.absPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    } else {
      reNodeFixed.layoutPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    }
    reNodeFixed.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitInlineReFixed(reNodeFixed: LogicalInlineReNode, fixedDOM: HTMLElement): HTMLElement {
    const node = this.pageRoot.createElement("div", ["inline"], reNodeFixed);
    node.style.display = "inline-block";
    node.style.width = reNodeFixed.physicalSize.width + "px";
    node.style.height = reNodeFixed.physicalSize.height + "px";
    node.style.marginLeft = reNodeFixed.edge.margin.start + "px";
    node.style.marginRight = reNodeFixed.edge.margin.end + "px";
    node.appendChild(fixedDOM);
    reNodeFixed.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    reNodeFixed.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitInlineLink(linkNode: LogicalInlineNode): HTMLElement {
    const node = this.pageRoot.createElement("a", ["inline"], linkNode);
    node.style.marginLeft = linkNode.edge.margin.start + "px";
    node.style.marginRight = linkNode.edge.margin.end + "px";
    linkNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    linkNode.env.color.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    linkNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    linkNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitBlockLink(linkNode: LogicalBlockNode): HTMLElement {
    const node = this.pageRoot.createElement("a", ["block"], linkNode);
    node.style.boxSizing = "content-box";
    node.style.position = "absolute";
    node.style.paddingLeft = linkNode.env.edge.padding.start + "px";
    node.style.paddingRight = linkNode.env.edge.padding.end + "px";
    if (linkNode.env.position.isAbsolute()) {
      linkNode.env.absPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    } else {
      linkNode.layoutPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    }
    linkNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    linkNode.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    linkNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    linkNode.children.forEach(child => {
      const childNode = child.acceptEvaluator(this);
      node.appendChild(childNode);
    });
    return node;
  }
}

