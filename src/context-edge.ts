import {
  LogicalPadding,
  LogicalMargin,
  LogicalBorder,
  LogicalEdgeValue,
  LogicalBoxEdge,
  LogicalEdge,
  LogicalEdgeDirection,
  LogicalEdgeDirections,
  LogicalEdgeSize,
} from './public-api'

export class ContextEdgeState {
  private state: LogicalEdgeValue<boolean>;

  constructor() {
    this.state = { before: false, end: false, after: false, start: false };
  }

  public mask(edge: LogicalEdgeValue<number>) {
    LogicalEdgeDirections.forEach(dir => {
      edge[dir] = this.state[dir] ? edge[dir] : 0;
    });
  }

  public clear() {
    this.state.before = false;
    this.state.end = false;
    this.state.after = false;
    this.state.start = false;
  }

  public addEdge(direction: LogicalEdgeDirection) {
    this.state[direction] = true;
  }

  public isEnable(direction: LogicalEdgeDirection): boolean {
    return this.state[direction];
  }
}

export class ContextEdgeSize {
  constructor(
    private edgeSize: LogicalEdgeSize,
    private edgeState = new ContextEdgeState()
  ) { }

  mask(edge: LogicalEdgeSize) {
    this.edgeState.mask(edge);
  }

  clear() {
    this.edgeState.clear();
  }

  addEdge(direction: LogicalEdgeDirection) {
    this.edgeState.addEdge(direction);
  }

  getSize(direction: LogicalEdgeDirection): number {
    return this.edgeState.isEnable(direction) ? this.edgeSize[direction] : 0;
  }

  get measure(): number {
    return this.getSize("start") + this.getSize("end");
  }

  get extent(): number {
    return this.getSize("before") + this.getSize("after");
  }
}

export class ContextBoxEdge {
  public padding: ContextEdgeSize;
  public margin: ContextEdgeSize;
  public borderWidth: ContextEdgeSize;

  constructor(private envEdge: LogicalBoxEdge) {
    this.padding = new ContextEdgeSize(envEdge.padding);
    this.margin = new ContextEdgeSize(envEdge.margin);
    this.borderWidth = new ContextEdgeSize(envEdge.border.width);
  }

  public clear() {
    this.padding.clear();
    this.margin.clear();
    this.borderWidth.clear();
  }

  get currentBorder(): LogicalBorder {
    const border = this.envEdge.border.clone();
    this.borderWidth.mask(border.width);
    return border;
  }

  get currentPadding(): LogicalPadding {
    const padding = this.envEdge.padding.clone();
    this.padding.mask(padding);
    return padding;
  }

  get currentMargin(): LogicalMargin {
    const margin = this.envEdge.margin.clone();
    this.margin.mask(margin);
    return margin;
  }

  get currentBorderBoxEdge(): LogicalBoxEdge {
    const border = this.currentBorder;
    const padding = this.currentPadding;
    const margin = LogicalMargin.none;
    return new LogicalBoxEdge({ padding, border, margin });
  }

  get currentMarginBoxEdge(): LogicalBoxEdge {
    const border = this.currentBorder;
    const padding = this.currentPadding;
    const margin = this.currentMargin;
    return new LogicalBoxEdge({ padding, border, margin });
  }

  getBorderBoxEdgeSize(direction: LogicalEdgeDirection): number {
    return this.borderWidth.getSize(direction) + this.padding.getSize(direction);
  }

  getMarginBoxEdgeSize(direction: LogicalEdgeDirection): number {
    return this.borderWidth.getSize(direction) + this.padding.getSize(direction) + this.margin.getSize(direction);
  }

  get borderBoxAfter(): number {
    return this.borderWidth.getSize("after") + this.padding.getSize("after");
  }

  get borderBoxMeasure(): number {
    return this.borderWidth.measure + this.padding.measure;
  }

  get borderBoxExtent(): number {
    return this.borderWidth.extent + this.padding.extent;
  }
}
