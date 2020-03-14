import {
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
  LogicalNodeEvaluator,
} from './public-api'
import { Config } from './config';

export class HoriLogicalNodeEvaluator implements ILogicalNodeEvaluator {
  constructor(private cssVisitor: ILogicalCssEvaluator) { }

  visitChar(char: Char): HTMLElement | Node {
    return document.createTextNode(char.text);
  }

  visitCharEmpha(char: Char, empha: TextEmphaData): HTMLElement | Node {
    const node = document.createElement("div");
    const emphaNode = document.createElement("div");
    const textNode = document.createElement("div");
    emphaNode.appendChild(document.createTextNode(empha.text));
    textNode.appendChild(document.createTextNode(char.text));
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
    // console.log("visitSpaceChar:", spaceChar);
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
    return document.createTextNode(mixChar.text);
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
      node.appendChild(char.acceptEvaluator(this));
      if (char.spacing) {
        // [TODO] added spacing node.
        console.log(`spacing:${char.spacing}`);
      }
    });
    node.normalize();
    return node;
  }

  visitRuby(rubyNode: LogicalRubyNode): HTMLElement {
    // console.log("visitRuby:", rubyNode);
    const node = document.createElement("div");
    const rbNode = document.createElement("div").appendChild(rubyNode.rb.acceptEvaluator(this));
    const rtNode = document.createElement("div").appendChild(rubyNode.rt.acceptEvaluator(this));
    node.appendChild(rtNode);
    node.appendChild(rbNode);
    node.style.display = "inline-block";
    node.style.textAlign = "center";
    rubyNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    rubyNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitLine(lineNode: LogicalLineNode): HTMLElement {
    // console.log("visitLine:", lineNode.text);
    const node = document.createElement("div");
    node.className = "nehan-line";
    node.style.boxSizing = "content-box";
    node.style.position = "absolute";
    // node.style.background = "lightblue";
    node.style.overflow = "visible";
    node.style.top = lineNode.pos.before + "px";
    lineNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    lineNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);

    const baseLineNode = document.createElement("div");
    baseLineNode.className = "nehan-baseline";
    baseLineNode.style.position = "absolute";
    // baseLineNode.style.background = "aliceblue";
    baseLineNode.style.left = (lineNode.pos.start + lineNode.baseline.startOffset) + "px";
    baseLineNode.style.width = lineNode.size.measure + 2 * lineNode.env.font.size + "px"; // Prepare space for 'Bura-sagari'.
    baseLineNode.style.height = lineNode.baseline.size.extent + "px";
    baseLineNode.style.bottom = lineNode.baseline.blockOffset + "px";

    node.appendChild(baseLineNode);
    lineNode.children.forEach(child => {
      baseLineNode.appendChild(child.acceptEvaluator(this));
    });
    return node;
  }

  visitInline(inlineNode: LogicalInlineNode): HTMLElement {
    // console.log("visitInline:", inlineNode.text);
    const node = document.createElement("span");
    node.style.marginLeft = inlineNode.edge.margin.start + "px";
    node.style.marginRight = inlineNode.edge.margin.end + "px";
    inlineNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(LogicalNodeEvaluator.selectEvaluator(child.env.writingMode)));
    });
    return node;
  }

  visitInlineEmpha(inlineNode: LogicalInlineNode): HTMLElement {
    // console.log("visitInlineEmpha:", inlineNode.text);
    const node = document.createElement("div");
    node.style.display = "inline-block";
    node.style.marginLeft = inlineNode.edge.margin.start + "px";
    node.style.marginRight = inlineNode.edge.margin.end + "px";
    inlineNode.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    inlineNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(LogicalNodeEvaluator.selectEvaluator(child.env.writingMode)));
    });
    return node;
  }

  visitInlineBlock(iblockNode: LogicalInlineBlockNode): HTMLElement {
    const node = document.createElement("div");
    node.className = `nehan-iblock nehan-${iblockNode.env.element.tagName}`;
    node.style.display = "inline-block";
    node.style.boxSizing = "content-box";
    node.style.background = "orange";
    node.style.position = "relative";
    node.style.marginLeft = iblockNode.env.edge.margin.start + "px";
    node.style.marginRight = iblockNode.env.edge.margin.end + "px";
    iblockNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    iblockNode.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    iblockNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    iblockNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(LogicalNodeEvaluator.selectEvaluator(child.env.writingMode)));
    });
    return node;
  }

  visitBlock(blockNode: LogicalBlockNode): HTMLElement {
    // console.log("visitBlock:", blockNode);
    const node = document.createElement("div");
    node.className = `nehan-${blockNode.env.element.tagName}`;
    node.style.boxSizing = "content-box";
    node.style.position = blockNode.env.element.tagName === "body" ? "relative" : "absolute";
    blockNode.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    if (blockNode.env.element.tagName === Config.pageRootTagName) {
      blockNode.env.edge.margin.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
      blockNode.env.edge.padding.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    }
    blockNode.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(LogicalNodeEvaluator.selectEvaluator(child.env.writingMode)));
    });
    return node;
  }

  visitTableCells(tableCells: LogicalTableCellsNode): HTMLElement {
    const node = document.createElement("div");
    node.className = "nehan-cells";
    node.style.boxSizing = "content-box";
    node.style.position = "absolute";
    tableCells.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    tableCells.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    tableCells.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(LogicalNodeEvaluator.selectEvaluator(child.env.writingMode)));
    });
    return node;
  }

  visitBlockImage(img: LogicalBlockReNode): HTMLElement {
    // console.log("visitBlockImage");
    const node = document.createElement("img");
    node.style.position = "absolute";
    node.style.width = img.physicalSize.width + "px";
    node.style.height = img.physicalSize.height + "px";
    node.src = img.env.element.getAttribute("src") || "";
    img.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    img.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    img.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitInlineImage(img: LogicalInlineReNode): HTMLElement {
    // console.log("visitInlineImage");
    const node = document.createElement("img");
    node.style.display = "inline";
    node.style.width = img.physicalSize.width + "px";
    node.style.height = img.physicalSize.height + "px";
    node.style.marginLeft = img.edge.margin.start + "px";
    node.style.marginRight = img.edge.margin.end + "px";
    node.src = img.env.element.getAttribute("src") || "";
    img.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    img.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitInlineLink(link: LogicalInlineNode): HTMLElement {
    // console.log("visitInlineLink:", link.text);
    const node = document.createElement("a");
    const href = link.env.element.getAttribute("href");
    const name = link.env.element.getAttribute("name");
    if (href) {
      node.setAttribute("href", href);
    }
    if (name) {
      node.setAttribute("name", name);
    }
    node.style.marginLeft = link.edge.margin.start + "px";
    node.style.marginRight = link.edge.margin.end + "px";
    link.env.font.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    link.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    link.children.forEach(child => {
      node.appendChild(child.acceptEvaluator(LogicalNodeEvaluator.selectEvaluator(child.env.writingMode)));
    });
    return node;
  }

  visitBlockLink(link: LogicalBlockNode): HTMLElement {
    // console.log("visitBlockLink:", link);
    const node = document.createElement("a");
    const href = link.env.element.getAttribute("href");
    const name = link.env.element.getAttribute("name");
    if (href) {
      node.setAttribute("href", href);
    }
    if (name) {
      node.setAttribute("name", name);
    }
    node.style.boxSizing = "content-box";
    node.style.position = "absolute";
    link.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    link.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    link.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    link.env.element.style.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    link.env.element.style.callDomCallbacks(link, node);
    link.children.forEach(child => {
      const childNode = child.acceptEvaluator(LogicalNodeEvaluator.selectEvaluator(child.env.writingMode));
      node.appendChild(childNode);
    });
    return node;
  }
}

