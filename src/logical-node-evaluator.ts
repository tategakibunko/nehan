import {
  LogicalTextNode,
  LogicalRubyNode,
  LogicalInlineNode,
  LogicalLineNode,
  LogicalBlockNode,
  NativeStyleMap,
} from './public-api'

export interface ILogicalNodeEvaluator {
  visitText: (...args: any[]) => Node;
  visitRuby: (...args: any[]) => HTMLElement;
  visitLine: (...args: any[]) => HTMLElement;
  visitInline: (...args: any[]) => HTMLElement;
  visitBlock: (...args: any[]) => HTMLElement;
}

export class LogicalNodeEvaluator implements ILogicalNodeEvaluator {
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
    if (lineNode.floatOffset > 0) {
      console.warn("float offset(%d) is applied to lineNode(%s)", lineNode.floatOffset, lineNode.text);
    }
    node.style.position = "absolute";
    node.style.top = lineNode.pos.before + "px";
    node.style.left = (lineNode.pos.start + lineNode.floatOffset) + "px";
    node.style.background = "orange";
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
    node.className = [blockNode.env.element.tagName, blockNode.env.element.indexOfType].join("-");
    node.style.position = blockNode.env.element.tagName === "body" ? "relative" : "absolute";
    node.style.top = blockNode.pos.before + "px";
    node.style.left = blockNode.pos.start + "px";
    node.style.width = blockNode.size.measure + "px";
    node.style.height = blockNode.size.extent + "px";
    node.style.background = "wheat";
    blockNode.children.forEach(child => {
      const childNode = child.acceptEvaluator(this);
      node.appendChild(childNode);
    });
    return node;
  }
}