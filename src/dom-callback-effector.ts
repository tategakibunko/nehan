import { LogicalLineNode } from "./logical-node";
import {
  ILogicalNode,
  ILogicalNodeEffector,
  IFlowRootFormatContext,
  LogicalBlockNode,
  LogicalRubyNode,
  LogicalInlineNode,
  LogicalInlineBlockNode,
  LogicalTableCellsNode,
  LogicalBlockReNode,
  LogicalInlineReNode,
} from "./public-api";

interface IContainerLogicalNode extends ILogicalNode {
  children: ILogicalNode[];
}

export class DomCallbackEffector implements ILogicalNodeEffector {
  constructor(
    private pageRoot: IFlowRootFormatContext,
  ) { }

  private visitNode(node: ILogicalNode) {
    if (node.dom) {
      node.env.element.style.callDomCallbacks(node, node.dom, this.pageRoot);
    }
  }

  private visitTree(node: IContainerLogicalNode) {
    this.visitNode(node);
    this.visitChildren(node.children);
  }

  private visitChildren(children: ILogicalNode[]) {
    children.forEach(child => child.acceptEffector(this));
  }

  visitLine(node: LogicalLineNode) {
    this.visitChildren(node.children);
  }

  visitRuby(node: LogicalRubyNode) {
    this.visitNode(node);
    this.visitNode(node.rt);
    this.visitNode(node.rb);
  }

  visitInline(node: LogicalInlineNode) {
    this.visitTree(node);
  }

  visitBlock(node: LogicalBlockNode) {
    this.visitTree(node);
  }

  visitInlineBlock(node: LogicalInlineBlockNode) {
    this.visitTree(node);
  };

  visitTableCells(node: LogicalTableCellsNode) {
    node.children.forEach(child => child.acceptEffector(this));
  };

  visitBlockImage(node: LogicalBlockReNode) {
    this.visitNode(node);
  };

  visitInlineImage(node: LogicalInlineReNode) {
    this.visitNode(node);
  };

  visitBlockVideo(node: LogicalBlockReNode) {
    this.visitNode(node);
  };

  visitInlineVideo(node: LogicalInlineReNode) {
    this.visitNode(node);
  };

}