import {
  BoxEnv,
  LogicalBorder,
  ILogicalNodeEvaluator,
  LogicalCursorPos,
  LogicalBoxEdge,
  LogicalSize,
  ICharacter,
} from './public-api'

export interface ILogicalNode {
  size: LogicalSize;
  text: string;
  acceptEvaluator: (visitor: ILogicalNodeEvaluator) => HTMLElement | Node;
}

export class LogicalTextNode implements ILogicalNode {
  constructor(
    public size: LogicalSize,
    public text: string,
    public children: ICharacter[],
  ) { }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement | Node {
    return visitor.visitText(this);
  }
}

export class LogicalLineNode implements ILogicalNode {
  constructor(
    public pos: LogicalCursorPos,
    public size: LogicalSize,
    public text: string,
    public children: ILogicalNode[],
    public floatOffset: number,
  ) { }

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

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement {
    return visitor.visitRuby(this);
  }
}

export class LogicalInlineNode implements ILogicalNode {
  constructor(
    public size: LogicalSize,
    public text: string,
    public edge: LogicalBoxEdge,
    public children: ILogicalNode[],
  ) { }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement {
    return visitor.visitInline(this);
  }
}

export class LogicalBlockNode implements ILogicalNode {
  constructor(
    public env: BoxEnv,
    public pos: LogicalCursorPos,
    public size: LogicalSize,
    public text: string,
    public border: LogicalBorder,
    public children: ILogicalNode[],
  ) { }

  get extent(): number {
    return this.size.extent + this.border.width.extent;
  }

  get measure(): number {
    return this.size.extent + this.border.width.measure;
  }

  acceptEvaluator(visitor: ILogicalNodeEvaluator): HTMLElement {
    return visitor.visitBlock(this);
  }
}