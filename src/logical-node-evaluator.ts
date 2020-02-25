import {
  LogicalTextNode,
  LogicalRubyNode,
  LogicalInlineNode,
  LogicalLineNode,
  LogicalBlockNode,
  ILogicalCssEvaluator,
  LogicalTableCellsNode,
  LogicalReNode,
} from './public-api'

export interface ILogicalNodeEvaluator {
  visitText: (...args: any[]) => Node;
  visitRuby: (...args: any[]) => HTMLElement;
  visitLine: (...args: any[]) => HTMLElement;
  visitInline: (...args: any[]) => HTMLElement;
  visitBlock: (...args: any[]) => HTMLElement;
  visitInlineBlock: (...args: any[]) => HTMLElement;
  visitTableCells: (...args: any[]) => HTMLElement;
  visitBlockImage: (...args: any[]) => HTMLElement;
  visitBlockVideo: (...args: any[]) => HTMLElement;
  visitInlineImage: (...args: any[]) => HTMLElement;
  visitInlineVideo: (...args: any[]) => HTMLElement;
}

export class HoriLogicalNodeEvaluator implements ILogicalNodeEvaluator {
  constructor(public cssVisitor: ILogicalCssEvaluator) { }

  visitText(textNode: LogicalTextNode): Node {
    const node = document.createTextNode(textNode.text);
    return node;
  }

  visitRuby(rubyNode: LogicalRubyNode): HTMLElement {
    const node = document.createElement("div");
    const rbNode = this.visitInline(rubyNode.rb);
    const rtNode = this.visitInline(rubyNode.rt);
    node.appendChild(rtNode);
    node.appendChild(rbNode);
    return node;
  }

  visitLine(lineNode: LogicalLineNode): HTMLElement {
    const node = document.createElement("div");
    node.className = "nehan-line";
    node.style.boxSizing = "content-box";
    node.style.position = "absolute";
    node.style.top = lineNode.pos.before + "px";
    node.style.left = (lineNode.pos.start + lineNode.lineBoxStartOffset) + "px";
    node.style.background = "skyblue";
    node.style.height = lineNode.size.extent + "px";
    lineNode.children.forEach(child => {
      const childNode = child.acceptEvaluator(this);
      node.appendChild(childNode);
    });
    return node;
  }

  visitInline(inlineNode: LogicalInlineNode): HTMLElement {
    const node = document.createElement("span");
    node.style.marginRight = inlineNode.edge.margin.end + "px";
    inlineNode.children.forEach(child => {
      const childNode = child.acceptEvaluator(this);
      node.appendChild(childNode);
    });
    return node;
  }

  visitInlineBlock(blockNode: LogicalBlockNode): HTMLElement {
    const node = document.createElement("div");
    node.className = ["nehan", blockNode.env.element.tagName].join("-");
    node.style.display = "inline-block";
    node.style.boxSizing = "content-box";
    node.style.position = "relative";
    blockNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.children.forEach(child => {
      const childNode = child.acceptEvaluator(this);
      node.appendChild(childNode);
    });
    return node;
  }

  visitBlock(blockNode: LogicalBlockNode): HTMLElement {
    const node = document.createElement("div");
    const background: any = { "body": "wheat", "p": "orange", "div": "pink" };
    node.className = ["nehan", blockNode.env.element.tagName].join("-");
    node.style.boxSizing = "content-box";
    node.style.background = background[blockNode.env.element.tagName] || "wheat";
    node.style.position = blockNode.env.element.tagName === "body" ? "relative" : "absolute";
    blockNode.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.size.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    blockNode.children.forEach(child => {
      const childNode = child.acceptEvaluator(this);
      node.appendChild(childNode);
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
      const childNode = child.acceptEvaluator(this);
      node.appendChild(childNode);
    });
    return node;
  }

  visitBlockImage(img: LogicalReNode): HTMLElement {
    const node = document.createElement("img");
    node.style.position = "absolute";
    node.style.width = img.physicalSize.width + "px";
    node.style.height = img.physicalSize.height + "px";
    node.src = img.env.element.getAttribute("src") || "";
    img.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    img.pos.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitBlockVideo(video: LogicalReNode): HTMLElement {
    console.log(video);
    throw new Error("todo");
  }

  visitInlineImage(img: LogicalReNode): HTMLElement {
    const node = document.createElement("img");
    node.style.width = img.physicalSize.width + "px";
    node.style.height = img.physicalSize.height + "px";
    node.src = img.env.element.getAttribute("src") || "";
    img.edge.border.acceptCssEvaluator(this.cssVisitor).applyTo(node.style);
    return node;
  }

  visitInlineVideo(video: LogicalReNode): HTMLElement {
    console.log(video);
    throw new Error("todo");
  }
}