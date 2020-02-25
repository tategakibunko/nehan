import {
  BoxEnv,
  LogicalBorder,
  ILogicalNodeEvaluator,
  LogicalCursorPos,
  LogicalBoxEdge,
  LogicalSize,
  PhysicalSize,
  ICharacter,
} from './public-api'

export interface ILogicalNode {
  // size: LogicalSize;
  measure: number;
  extent: number;
  text: string;
  acceptEvaluator: (visitor: ILogicalNodeEvaluator, ...args: any[]) => HTMLElement | Node;
}

export class LogicalTextNode implements ILogicalNode {
  constructor(
    public size: LogicalSize,
    public text: string,
    public children: ICharacter[],
  ) { }

  get measure(): number {
    return this.size.measure;
  }

  get extent(): number {
    return this.size.extent;
  }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): Node {
    return visitor.visitText(this);
  }
}

export class LogicalLineNode implements ILogicalNode {
  constructor(
    public pos: LogicalCursorPos,
    public size: LogicalSize,
    public text: string,
    public children: ILogicalNode[],
    public lineBoxStartOffset: number,
  ) { }

  get measure(): number {
    return this.size.measure;
  }

  get extent(): number {
    return this.size.extent;
  }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement {
    return visitor.visitLine(this);
  }
}

export class LogicalRubyNode implements ILogicalNode {
  public children: any[] = [];

  constructor(
    public size: LogicalSize,
    public text: string,
    public rb: LogicalInlineNode,
    public rt: LogicalInlineNode,
  ) {
  }

  get measure(): number {
    return this.size.measure;
  }

  get extent(): number {
    return this.size.extent;
  }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement {
    return visitor.visitRuby(this);
  }
}

export class LogicalInlineNode implements ILogicalNode {
  constructor(
    public env: BoxEnv,
    public size: LogicalSize,
    public text: string,
    public edge: LogicalBoxEdge,
    public children: ILogicalNode[],
  ) { }

  get measure(): number {
    return this.size.measure + this.edge.measure;
  }

  get extent(): number {
    return this.size.extent + this.edge.extent;
  }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement {
    return visitor.visitInline(this);
  }
}

export class LogicalBlockNode implements ILogicalNode {
  constructor(
    public env: BoxEnv,
    public pos: LogicalCursorPos,
    public size: LogicalSize, // padding box size
    public text: string,
    public border: LogicalBorder,
    public children: ILogicalNode[],
  ) { }

  get measure(): number {
    return this.size.measure + this.border.width.measure;
  }

  get extent(): number {
    return this.size.extent + this.border.width.extent;
  }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement {
    const display = this.env.display;
    if (display.isInlineBlockFlow() && !display.isTableCell()) {
      return visitor.visitInlineBlock(this);
    }
    return visitor.visitBlock(this);
  }
}

export class LogicalTableCellsNode implements ILogicalNode {
  constructor(
    public size: LogicalSize,
    public pos: LogicalCursorPos,
    public text: string,
    public children: LogicalBlockNode[],
  ) { }

  get measure(): number {
    return this.size.measure;
  }

  get extent(): number {
    return this.size.extent;
  }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement {
    return visitor.visitTableCells(this);
  }
}

export class LogicalReNode implements ILogicalNode {
  constructor(
    public env: BoxEnv,
    public size: LogicalSize,
    public physicalSize: PhysicalSize,
    public edge: LogicalBoxEdge,
    public pos: LogicalCursorPos,
    public text: string,
  ) { }

  get measure(): number {
    return this.size.measure + this.edge.borderBoxMeasure;
  }

  get extent(): number {
    return this.size.extent + this.env.edge.borderBoxExtent;
  }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement {
    const display = this.env.display;
    switch (this.env.element.tagName) {
      case "img": return display.isBlockLevel() ? visitor.visitBlockImage(this) : visitor.visitInlineImage(this);
      case "video": return display.isBlockLevel() ? visitor.visitBlockVideo(this) : visitor.visitInlineVideo(this);
    }
    console.error("unsupported replaced element:", this);
    throw new Error("unsupported replaced element");
  }
}