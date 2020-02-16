import {
  LogicalTextNode,
  LogicalRubyNode,
  LogicalInlineNode,
  LogicalLineNode,
  LogicalBlockNode,
  ILogicalCssEvaluator,
} from './public-api'

export interface ILogicalNodeEvaluator {
  visitText: (...args: any[]) => Node;
  visitRuby: (...args: any[]) => HTMLElement;
  visitLine: (...args: any[]) => HTMLElement;
  visitInline: (...args: any[]) => HTMLElement;
  visitBlock: (...args: any[]) => HTMLElement;
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
    node.style.left = (lineNode.pos.start + lineNode.floatOffset) + "px";
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
    inlineNode.children.forEach(child => {
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
}