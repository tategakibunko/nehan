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

  private visitSingle(node: ILogicalNode) {
    if (node.dom) {
      node.env.element.style.callDomCallbacks(node, node.dom, this.pageRoot);
    }
  }

  private visitMany(node: IContainerLogicalNode) {
    if (node.dom) {
      node.env.element.style.callDomCallbacks(node, node.dom, this.pageRoot);
      node.children.forEach(child => child.acceptEffector(this));
    }
  }

  visitRuby(node: LogicalRubyNode) {
    this.visitSingle(node);
    node.rt.acceptEffector(this);
    node.rb.acceptEffector(this);
  }

  visitInline(node: LogicalInlineNode) {
    this.visitMany(node);
  }

  visitInlineEmpha(node: LogicalInlineNode) {
    this.visitMany(node);
  }

  visitBlock(node: LogicalBlockNode) {
    this.visitMany(node);
  }

  visitInlineBlock(node: LogicalInlineBlockNode) {
    this.visitMany(node);
  };

  visitTableCells(node: LogicalTableCellsNode) {
    this.visitMany(node);
  };

  visitInlineLink(node: LogicalInlineNode) {
    this.visitMany(node);
  };

  visitBlockLink(node: LogicalBlockNode) {
    this.visitMany(node);
  };

  visitBlockImage(node: LogicalBlockReNode) {
    this.visitSingle(node);
  };

  visitInlineImage(node: LogicalInlineReNode) {
    this.visitSingle(node);
  };

  visitBlockVideo(node: LogicalBlockReNode) {
    this.visitSingle(node);
  };

  visitInlineVideo(node: LogicalInlineReNode) {
    this.visitSingle(node);
  };

}