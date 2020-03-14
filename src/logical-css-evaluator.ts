import {
  Config,
  Font,
  LogicalSize,
  LogicalPos,
  LogicalCursorPos,
  LogicalEdgeMap,
  LogicalMargin,
  LogicalBorder,
  LogicalBorderColor,
  LogicalBorderStyle,
  LogicalBorderWidth,
  LogicalBorderRadius,
  LogicalPadding,
  WritingMode,
  NativeStyleMap,
  CssStyleDeclaration,
} from './public-api'

export interface ILogicalCssEvaluator {
  visitFont: (font: Font) => NativeStyleMap;
  visitSize: (size: LogicalSize) => NativeStyleMap;
  visitPos: (pos: LogicalCursorPos) => NativeStyleMap;
  visitLogicalPos: (pos: LogicalPos) => NativeStyleMap;
  visitLogicalMargin: (margin: LogicalMargin) => NativeStyleMap;
  visitLogicalBorderColor: (borderColor: LogicalBorderColor) => NativeStyleMap;
  visitLogicalBorderWidth: (borderWidth: LogicalBorderWidth) => NativeStyleMap;
  visitLogicalBorderStyle: (borderStyle: LogicalBorderStyle) => NativeStyleMap;
  visitLogicalBorderRadius: (borderRadius: LogicalBorderRadius) => NativeStyleMap;
  visitLogicalPadding: (pading: LogicalPadding) => NativeStyleMap;
  visitUnmanagedCssProps: (style: CssStyleDeclaration) => NativeStyleMap;
}

export class LogicalCssEvaluator implements ILogicalCssEvaluator {
  constructor(public writingMode: WritingMode) { }

  visitUnmanagedCssProps(style: CssStyleDeclaration): NativeStyleMap {
    const css = new NativeStyleMap();
    Config.unmanagedCssProps.forEach(prop => {
      const unmanagedValue = style.getPropertyValue(prop);
      if (unmanagedValue !== null) {
        // console.info("set unmanaged prop:%s = %s", prop, unmanagedValue);
        css.set(prop, unmanagedValue);
      }
    });
    return css;
  }

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

  visitLogicalMargin(margin: LogicalMargin): NativeStyleMap {
    return margin.getPhysicalEdge(this.writingMode).items.reduce((css, item) => {
      return css.set(margin.getPropByLogicalDirection(item.prop), item.value + "px");
    }, new NativeStyleMap());
  }

  visitLogicalPadding(padding: LogicalPadding): NativeStyleMap {
    return padding.getPhysicalEdge(this.writingMode).items.reduce((css, item) => {
      return css.set(padding.getPropByLogicalDirection(item.prop), item.value + "px");
    }, new NativeStyleMap());
  }

  visitLogicalBorderColor(borderColor: LogicalBorderColor): NativeStyleMap {
    return borderColor.getPhysicalEdge(this.writingMode).items.reduce((css, item) => {
      return css.set(borderColor.getPropByLogicalDirection(item.prop), String(item.value));
    }, new NativeStyleMap());
  }

  visitLogicalBorderWidth(borderWidth: LogicalBorderWidth): NativeStyleMap {
    return borderWidth.getPhysicalEdge(this.writingMode).items.reduce((css, item) => {
      return css.set(borderWidth.getPropByLogicalDirection(item.prop), item.value + "px");
    }, new NativeStyleMap());
  }

  visitLogicalBorderStyle(borderStyle: LogicalBorderStyle): NativeStyleMap {
    return borderStyle.getPhysicalEdge(this.writingMode).items.reduce((css, item) => {
      return css.set(borderStyle.getPropByLogicalDirection(item.prop), String(item.value));
    }, new NativeStyleMap());
  }

  visitLogicalBorderRadius(borderRadius: LogicalBorderRadius): NativeStyleMap {
    return borderRadius.getPhysicalBorderRadius(this.writingMode).items.reduce((css, item) => {
      return css.set(`border-${item.prop}-radius`, String(item.value));
    }, new NativeStyleMap());
  }

  visitLogicalPos(pos: LogicalPos): NativeStyleMap {
    const css = new NativeStyleMap();
    if (pos.before !== undefined) {
      css.set(LogicalEdgeMap.mapValue(this.writingMode, "before"), pos.before + "px");
    }
    if (pos.end !== undefined) {
      css.set(LogicalEdgeMap.mapValue(this.writingMode, "end"), pos.end + "px");
    }
    if (pos.after !== undefined) {
      css.set(LogicalEdgeMap.mapValue(this.writingMode, "after"), pos.after + "px");
    }
    if (pos.start !== undefined) {
      css.set(LogicalEdgeMap.mapValue(this.writingMode, "start"), pos.start + "px");
    }
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