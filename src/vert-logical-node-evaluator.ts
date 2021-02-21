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
  ILogicalTextJustifier,
  ILogicalNode,
  IFlowRootFormatContext,
} from './public-api'

export class VertLogicalNodeEvaluator implements ILogicalNodeEvaluator {
  constructor(
    private pageRoot: IFlowRootFormatContext,
    private cssVisitor: ILogicalCssEvaluator,
    private textJustifier: ILogicalTextJustifier,
  ) { }

  private isReOrIblock(node: ILogicalNode): boolean {
    if (node instanceof LogicalInlineReNode || node instanceof LogicalInlineBlockNode) {
      return true;
    }
    if (node instanceof LogicalInlineNode) {
      return node.children.some(child => this.isReOrIblock(child));
    }
    return false;
  }

  visitChar(char: Char): HTMLElement | Node {
    return document.createTextNode(char.text);
  }

  visitCharEmpha(char: Char, empha: TextEmphaData): HTMLElement | Node {
    const node = document.createElement("div");
    const emphaNode = document.createElement("div");
    const textNode = document.createElement("div");
    textNode.appendChild(document.createTextNode(char.text));
    emphaNode.appendChild(document.createTextNode(empha.text));
    if (empha.scale < 1.0) {
      emphaNode.style.fontSize = String(empha.scale) + "em";
      emphaNode.style.paddingLeft = String(empha.scale / 2) + "em";
    }
    node.style.textAlign = "center";
    node.style.display = "flex";
    node.style.alignItems = "center";
    node.appendChild(textNode);
    node.appendChild(emphaNode);
    return node;
  }

  visitRefChar(refChar: RefChar): HTMLElement | Node {
    return document.createTextNode(refChar.text);
  }

  visitRefCharEmpha(refChar: RefChar, empha: TextEmphaData): HTMLElement | Node {
    return this.visitCharEmpha(refChar as Char, empha);
  }

  visitSpaceChar(spaceChar: SpaceChar): HTMLElement | Node {
    const node = document.createElement("div");
    node.style.height = spaceChar.size.measure + "px";
    return node;
  }

  visitHalfChar(halfChar: HalfChar): HTMLElement | Node {
    const node = document.createElement("div");
    node.appendChild(document.createTextNode(halfChar.text));
    node.style.textAlign = "center";
    node.style.width = "1em";
    return node;
  }

  visitMixChar(mixChar: MixChar): HTMLElement | Node {
    const node = document.createElement("div");
    node.appendChild(document.createTextNode(mixChar.text));
    return node;
  }

  visitDualChar(dualChar: DualChar): HTMLElement | Node {
    const node = document.createElement("div");
    node.style.writingMode = "vertical-rl";
    node.appendChild(document.createTextNode(dualChar.text));
    return node;
  }

  visitDualCharKern(dualChar: DualChar): HTMLElement | Node {
    const node = document.createElement("div");
    node.style.writingMode = "vertical-rl";
    node.style.marginTop = "-0.5em";
    node.appendChild(document.createTextNode(dualChar.text));
    return node;
  }

  visitSmpUniChar(uniChar: SmpUniChar): HTMLElement | Node {
    return document.createTextNode(uniChar.text);
  }

  visitTcy(tcy: Tcy): HTMLElement | Node {
    const node = document.createElement("div");
    node.style.writingMode = "vertical-rl";
    node.style.textCombineUpright = "all";
    node.style.setProperty("-webkit-text-combine", "horizontal"); // for Safari
    node.appendChild(document.createTextNode(tcy.text));
    return node;
  }

  visitWord(word: Word): HTMLElement | Node {
    const node = document.createElement("div");
    node.style.writingMode = "vertical-rl";
    node.style.textOrientation = "sideways";
    node.appendChild(document.createTextNode(word.text));
    return node;
  }

  visitText(textNode: LogicalTextNode): HTMLElement {
    const node = document.createElement("div");
    node.className = "nehan-text";
    node.style.lineHeight = "1";
    textNode.children.forEach(char => {
      const charNode = char.acceptEvaluator(this);
      node.appendChild(charNode);
      if (charNode instanceof Text) {
        node.appendChild(document.createElement("br"));
      }
      if (char.spacing) {
        const spacingNode = document.createElement("div");
        spacingNode.style.height = char.spacing + "px";
        spacingNode.appendChild(document.createTextNode(" "));
        node.appendChild(spacingNode);
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
    node.appendChild(rbNode);
    node.appendChild(rtNode);
    node.style.display = "flex";
    node.style.textAlign = "center";
    node.style.alignItems = "center";
    rubyNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    rubyNode.env.color.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    rubyNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitLine(lineNode: LogicalLineNode): HTMLElement {
    const writingMode = lineNode.env.writingMode;
    const beforeProp = writingMode.isVerticalLr() ? "left" : "right";
    const node = document.createElement("div");
    node.className = "nehan-line";
    node.style.boxSizing = "content-box";
    node.style.position = "absolute";
    node.style.overflow = "visible";
    node.style[beforeProp] = lineNode.pos.before + "px";
    lineNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    lineNode.env.color.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    lineNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);

    const baseLineNode = document.createElement("div");
    baseLineNode.className = "nehan-baseline";
    baseLineNode.style.position = "absolute";
    baseLineNode.style.top = (lineNode.pos.start + lineNode.baseline.startOffset) + "px";
    baseLineNode.style.height = "100%";
    baseLineNode.style.width = lineNode.baseline.size.extent + "px";
    baseLineNode.style.left = lineNode.baseline.blockOffset + "px";

    node.appendChild(baseLineNode);

    if (lineNode.env.textAlign.isJustify()) {
      this.textJustifier.justify(lineNode);
    }

    lineNode.children.forEach(child => {
      const childNode = child.acceptEvaluator(this);
      const textBodyExtent = this.isReOrIblock(child) ? child.extent : child.env.font.size;
      const baselineGap = Math.floor((lineNode.baseline.textBodySize.extent - textBodyExtent) / 2);
      if (baselineGap === 0) {
        baseLineNode.appendChild(childNode);
      } else {
        const offsetNode = document.createElement("div");
        offsetNode.style.marginLeft = Math.max(0, baselineGap) + "px";
        offsetNode.appendChild(childNode);
        baseLineNode.appendChild(offsetNode);
      }
    });
    return node;
  }

  visitInline(inlineNode: LogicalInlineNode): HTMLElement {
    const node = this.pageRoot.createElement("div", ["inline"], inlineNode);
    node.style.marginTop = inlineNode.edge.margin.start + "px";
    node.style.marginBottom = inlineNode.edge.margin.end + "px";
    inlineNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.color.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitInlineEmpha(inlineNode: LogicalInlineNode): HTMLElement {
    const node = this.pageRoot.createElement("div", ["inline", "empha"], inlineNode);
    node.style.marginTop = inlineNode.edge.margin.start + "px";
    node.style.marginBottom = inlineNode.edge.margin.end + "px";
    inlineNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.color.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitInlineBlock(iblockNode: LogicalInlineBlockNode): HTMLElement {
    const node = this.pageRoot.createElement("div", ["iblock"], iblockNode);
    node.style.boxSizing = "content-box";
    node.style.position = "relative";
    node.style.paddingTop = iblockNode.env.edge.padding.start + "px";
    node.style.paddingBottom = iblockNode.env.edge.padding.end + "px";
    node.style.marginTop = iblockNode.env.edge.margin.start + "px";
    node.style.marginBottom = iblockNode.env.edge.margin.end + "px";
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
    node.style.paddingTop = blockNode.env.edge.padding.start + "px";
    node.style.paddingBottom = blockNode.env.edge.padding.end + "px";
    if (blockNode.env.position.isAbsolute()) {
      blockNode.env.absPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    } else {
      blockNode.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
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
    node.style.width = rootBlockNode.extent + edge.extent + "px";
    node.style.height = rootBlockNode.measure + edge.measure + "px";
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
    tableCellsNode.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    tableCellsNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    tableCellsNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitBlockImage(imgNode: LogicalBlockReNode): HTMLElement {
    const node = this.pageRoot.createElement("img", ["block"], imgNode);
    node.style.position = "absolute";
    node.style.display = "block";
    node.style.width = imgNode.physicalSize.width + "px";
    node.style.height = imgNode.physicalSize.height + "px";
    node.setAttribute("src", imgNode.env.element.getAttribute("src") || "");
    imgNode.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    if (imgNode.env.position.isAbsolute()) {
      imgNode.env.absPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    } else {
      imgNode.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    }
    imgNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitInlineImage(imgNode: LogicalInlineReNode): HTMLElement {
    const node = this.pageRoot.createElement("img", ["inline"], imgNode);
    node.style.display = "block";
    node.style.width = imgNode.physicalSize.width + "px";
    node.style.height = imgNode.physicalSize.height + "px";
    node.style.marginTop = imgNode.edge.margin.start + "px";
    node.style.marginBottom = imgNode.edge.margin.end + "px";
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
    node.style.marginTop = videoNode.edge.margin.start + "px";
    node.style.marginBottom = videoNode.edge.margin.end + "px";
    videoNode.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    videoNode.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    videoNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitInlineVideo(videoNode: LogicalInlineReNode): HTMLElement {
    const node = this.pageRoot.createElement("div", ["inline"], videoNode);
    node.style.display = "none";
    node.style.width = "0";
    node.style.height = "0";
    node.innerHTML = "Sorry, inline video is not supported yet!";
    return node;
  }

  visitInlineLink(linkNode: LogicalInlineNode): HTMLElement {
    const node = this.pageRoot.createElement("a", ["inline"], linkNode);
    node.style.marginTop = linkNode.edge.margin.start + "px";
    node.style.marginBottom = linkNode.edge.margin.end + "px";
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
    node.style.paddingTop = linkNode.env.edge.padding.start + "px";
    node.style.paddingBottom = linkNode.env.edge.padding.end + "px";
    if (linkNode.env.position.isAbsolute()) {
      linkNode.env.absPos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    } else {
      linkNode.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
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