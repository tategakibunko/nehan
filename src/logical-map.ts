import {
  WritingMode,
} from "./public-api";

// logical property to physical mapper.
class LogicalMap {
  protected horiTb: Map<string, string>;
  protected vertRl: Map<string, string>;
  protected vertLr: Map<string, string>;

  constructor(){
    this.horiTb = new Map<string, string>();
    this.vertRl = new Map<string, string>();
    this.vertLr = new Map<string, string>();
  }

  private getValue(map: Map<string, string>, prop: string): string {
    let value = map.get(prop);
    if(!value){
      throw new Error(prop + " is not defined in map");
    }
    return value;
  }

  protected selectMap(writing_mode: WritingMode): Map<string, string> {
    if(writing_mode.isTextHorizontal()){
      return this.horiTb;
    }
    if(writing_mode.isVerticalRl()){
      return this.vertRl;
    }
    return this.vertLr;
  }

  public mapValue(writing_mode: WritingMode, prop: string): string {
    return this.getValue(this.selectMap(writing_mode), prop);
  }

  public forEach(writing_mode: WritingMode, fn: (prop: string, value: string) => void){
    this.selectMap(writing_mode).forEach((value: string, prop: string) => {
      fn(prop, value);
    });
  }
}

class LogicalEdgeMapImpl extends LogicalMap {
  constructor(){
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
  constructor(){
    super();
    this.horiTb.set("before-start", "top-left");
    this.horiTb.set("before-end", "top-right");
    this.horiTb.set("after-end", "bottom-right");
    this.horiTb.set("after-start", "bottom-left");

    this.vertRl.set("before-start", "top-right");
    this.vertRl.set("before-end", "bottom-right");
    this.vertRl.set("after-end", "bottom-left");
    this.vertRl.set("after-start",  "top-left");

    this.vertLr.set("before-start", "top-left");
    this.vertLr.set("before-end", "bottom-left");
    this.vertLr.set("after-end", "bottom-right");
    this.vertLr.set("after-start",  "top-right");
  }
}

export let LogicalEdgeMap = new LogicalEdgeMapImpl();
export let LogicalCornerMap = new LogicalCornerMapImpl();
