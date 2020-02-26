import {
  Font,
  LogicalSize,
  LogicalCursorPos,
  LogicalBorder,
  WritingMode,
  NativeStyleMap,
} from './public-api'

export interface ILogicalCssEvaluator {
  visitFont: (font: Font) => NativeStyleMap;
  visitSize: (size: LogicalSize) => NativeStyleMap;
  visitPos: (pos: LogicalCursorPos) => NativeStyleMap;
  visitLogicalBorder: (border: LogicalBorder) => NativeStyleMap;
}

class LogicalCssEvaluator implements ILogicalCssEvaluator {
  constructor(public writingMode: WritingMode) { }

  visitFont(font: Font): NativeStyleMap {
    const css = new NativeStyleMap();
    css.set("font-style", font.style);
    css.set("font-variant", font.variant);
    css.set("font-weight", font.weight);
    css.set("font-stretch", font.stretch);
    css.set("font-size", font.size + "px");
    css.set("font-family", font.family);
    return css;
  }

  visitSize(size: LogicalSize): NativeStyleMap {
    throw new Error("must be overrided");
  }

  visitPos(pos: LogicalCursorPos): NativeStyleMap {
    throw new Error("must be overrided");
  }

  visitLogicalBorder(border: LogicalBorder): NativeStyleMap {
    const css = new NativeStyleMap();
    border.width.getPhysicalEdge(this.writingMode).items.forEach(item => {
      css.set(border.width.getPropByLogicalDirection(item.prop), item.value + "px");
    });
    border.style.getPhysicalEdge(this.writingMode).items.forEach(item => {
      css.set(border.style.getPropByLogicalDirection(item.prop), String(item.value));
    });
    border.color.getPhysicalEdge(this.writingMode).items.forEach(item => {
      css.set(border.color.getPropByLogicalDirection(item.prop), String(item.value));
    });
    border.radius.getPhysicalBorderRadius(this.writingMode).items.forEach(item => {
      return css.set(`border-${item.prop}-radius`, String(item.value));
    });
    return css;
  }
}

export class VertCssEvaluator extends LogicalCssEvaluator {
  visitSize(size: LogicalSize): NativeStyleMap {
    const css = new NativeStyleMap();
    css.set("width", size.extent + "px");
    css.set("height", size.measure + "px");
    return css;
  }

  visitPos(pos: LogicalCursorPos): NativeStyleMap {
    const css = new NativeStyleMap();
    const beforeProp = this.writingMode.isVerticalRl() ? "right" : "left";
    css.set("top", pos.start + "px");
    css.set(beforeProp, pos.before + "px");
    return css;
  }
}

export class HoriCssEvaluator extends LogicalCssEvaluator {
  visitSize(size: LogicalSize): NativeStyleMap {
    const css = new NativeStyleMap();
    css.set("width", size.measure + "px");
    css.set("height", size.extent + "px");
    return css;
  }

  visitPos(pos: LogicalCursorPos): NativeStyleMap {
    const css = new NativeStyleMap();
    css.set("top", pos.before + "px");
    css.set("left", pos.start + "px");
    return css;
  }
}