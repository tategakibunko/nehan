import {
  WritingMode,
} from "./public-api";

class PropMap extends Map<string, string> {
  get(prop: string): string {
    const value = super.get(prop);
    if (!value) {
      throw new Error(`property(${prop}) is not defined in map`);
    }
    return value;
  }
}

// logical property to physical mapper.
class LogicalMap {
  protected horiTb: PropMap;
  protected vertRl: PropMap;
  protected vertLr: PropMap;

  constructor() {
    this.horiTb = new PropMap();
    this.vertRl = new PropMap();
    this.vertLr = new PropMap();
  }

  select(writingMode: WritingMode): PropMap {
    if (writingMode.isTextHorizontal()) {
      return this.horiTb;
    }
    if (writingMode.isVerticalRl()) {
      return this.vertRl;
    }
    return this.vertLr;
  }
}

class LogicalEdgeMapImpl extends LogicalMap {
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

class LogicalCornerMapImpl extends LogicalMap {
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

export let LogicalEdgeMap = new LogicalEdgeMapImpl();
export let LogicalCornerMap = new LogicalCornerMapImpl();
