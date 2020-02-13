import {
  LogicalSize,
  NativeStyleMap,
} from './public-api'

export interface ILogicalCssEvaluator {
  visitSize: (size: LogicalSize) => NativeStyleMap;
}

export class VertCssEvaluator implements ILogicalCssEvaluator {
  public instance = new VertCssEvaluator();
  private constructor() { }

  visitSize(size: LogicalSize): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("width", size.extent + "px");
    css.set("height", size.measure + "px");
    return css;
  }
}

export class HoriCssEvaluator implements ILogicalCssEvaluator {
  public instance = new HoriCssEvaluator();
  private constructor() { }

  visitSize(size: LogicalSize): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("width", size.measure + "px");
    css.set("height", size.extent + "px");
    return css;
  }
}