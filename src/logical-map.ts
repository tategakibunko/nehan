import {
  WritingMode,
  LogicalEdgeDirection,
  PhysicalEdgeDirection,
  LogicalBorderRadiusCorner,
} from "./public-api";

class PropMap<P, V> extends Map<P, V> {
  get(prop: P): V {
    const value = super.get(prop);
    if (!value) {
      throw new Error(`property(${prop}) is not defined in map`);
    }
    return value;
  }
}

export interface ILogicalMap<P, V> {
  readonly horiTb: PropMap<P, V>;
  readonly vertRl: PropMap<P, V>;
  readonly vertLr: PropMap<P, V>;
  select: (writingMode: WritingMode) => PropMap<P, V>;
}

// logical property to physical mapper.
class LogicalMap<P, V> implements ILogicalMap<P, V> {
  horiTb: PropMap<P, V>;
  vertRl: PropMap<P, V>;
  vertLr: PropMap<P, V>;

  constructor() {
    this.horiTb = new PropMap<P, V>();
    this.vertRl = new PropMap<P, V>();
    this.vertLr = new PropMap<P, V>();
  }

  select(writingMode: WritingMode): PropMap<P, V> {
    if (writingMode.isTextHorizontal()) {
      return this.horiTb;
    }
    if (writingMode.isVerticalRl()) {
      return this.vertRl;
    }
    return this.vertLr;
  }
}

class LogicalEdgeMapImpl extends LogicalMap<LogicalEdgeDirection, PhysicalEdgeDirection> {
  constructor() {
    super();
    this.horiTb.set("before", "top");
    this.horiTb.set("end", "right");
    this.horiTb.set("after", "bottom");
    this.horiTb.set("start", "left");

    this.vertRl.set("before", "right");
    this.vertRl.set("end", "bottom");
    this.vertRl.set("after", "left");
    this.vertRl.set("start", "top");

    this.vertLr.set("before", "left");
    this.vertLr.set("end", "bottom");
    this.vertLr.set("after", "right");
    this.vertLr.set("start", "top");
  }
}

class LogicalCornerMapImpl extends LogicalMap<LogicalBorderRadiusCorner, string> {
  constructor() {
    super();
    this.horiTb.set("before-start", "top-left");
    this.horiTb.set("before-end", "top-right");
    this.horiTb.set("after-end", "bottom-right");
    this.horiTb.set("after-start", "bottom-left");

    this.vertRl.set("before-start", "top-right");
    this.vertRl.set("before-end", "bottom-right");
    this.vertRl.set("after-end", "bottom-left");
    this.vertRl.set("after-start", "top-left");

    this.vertLr.set("before-start", "top-left");
    this.vertLr.set("before-end", "bottom-left");
    this.vertLr.set("after-end", "bottom-right");
    this.vertLr.set("after-start", "top-right");
  }
}

export const LogicalEdgeMap: ILogicalMap<LogicalEdgeDirection, PhysicalEdgeDirection> = new LogicalEdgeMapImpl();
export const LogicalCornerMap: ILogicalMap<LogicalBorderRadiusCorner, string> = new LogicalCornerMapImpl();
