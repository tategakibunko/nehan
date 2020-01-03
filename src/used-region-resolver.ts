import {
  HtmlElement,
  ComputedRegion,
  Display,
  LogicalFloatValue,
  CssCascade,
  PositionValue,
  ReplacedElement,
} from './public-api'

export interface IRegionResolver {
  resolve: (element: HtmlElement, computedResion: ComputedRegion) => void;
}

// https://www.w3.org/TR/CSS22/visudet.html#Computing_widths_and_margins
export class UsedRegionResolver {
  static select(element: HtmlElement) {
    const display = Display.load(element);
    const float = CssCascade.getValue(element, "float") as LogicalFloatValue;
    const position = CssCascade.getValue(element, "position") as PositionValue;
    const isRe = ReplacedElement.isReplacedElement(element);

    if (float !== "none") {
      return isRe ? ReFloatRegionResolver.instance : FloatRegionResolver.instance;
    }
    if (position === "absolute") {
      return isRe ? ReAbsoluteRegionResolver.instance : AbsoluteRegionResolver.instance;
    }
    if (display.isInlineBlockFlow()) {
      return isRe ? ReInlineBlockRegionResolver.instance : InlineBlockRegionResolver.instance;
    }
    if (display.isInlineLevel()) {
      return isRe ? ReInlineRegionResolver.instance : InlineRegionResolver.instance;
    }
    if (display.isBlockLevel()) {
      return isRe ? ReBlockRegionResolver.instance : BlockRegionResolver.instance;
    }
    console.error("select resolver failed.");
    return InlineRegionResolver.instance;
  }
}

class BlockRegionResolver implements IRegionResolver {
  static instance = new BlockRegionResolver();
  private constructor() { }

  resolve(element: HtmlElement, region: ComputedRegion) {
    if (region.logicalSize.measure.length === "auto") {
      region.edges.margin.clearAutoInline();
      region.logicalSize.measure.length = region.containingMeasure - region.edges.measure;
    } else {
      const borderBoxMeasure = region.borderBoxMeasure;
      if (region.boxSizing.isBorderBox()) {
        region.logicalSize.measure.length -= region.edges.borderBoxMeasure;
      } else if (region.boxSizing.isPaddingBox()) {
        region.logicalSize.measure.length -= region.edges.padding.measure;
      }
      if (borderBoxMeasure > region.containingMeasure) {
        region.edges.margin.clearInline();
      }
      if (region.edges.margin.isAutoMeasure()) {
        const autoMargin = Math.floor((region.containingMeasure - region.logicalSize.measure.length) / 2);
        region.edges.margin.start.length = region.edges.margin.end.length = autoMargin;
        // console.log("[%s] auto margin is resolved to %d", element.tagName, autoMargin);
      }
    }
  }
}

class ReBlockRegionResolver implements IRegionResolver {
  static instance = new ReBlockRegionResolver();
  private constructor() { }

  resolve(element: HtmlElement, region: ComputedRegion) {
    if (region.logicalSize.measure.length === "auto") {
      region.edges.margin.clearAutoInline();
    } else {
      if (region.edges.margin.start.length === "auto" && region.edges.margin.end.length === "auto") {
        const autoMarginBoth = Math.floor((region.containingMeasure - region.logicalSize.measure.length) / 2);
        region.edges.margin.start.length = region.edges.margin.end.length = autoMarginBoth;
      }
      else if (region.edges.margin.start.length === "auto" && region.edges.margin.end.length !== "auto") {
        const autoMarginStart = region.containingMeasure - region.logicalSize.measure.length - region.edges.margin.end.length;
        region.edges.margin.start.length = autoMarginStart;
      }
      else if (region.edges.margin.start.length !== "auto" && region.edges.margin.end.length === "auto") {
        const autoMarginEnd = region.containingMeasure - region.logicalSize.measure.length - region.edges.margin.start.length;
        region.edges.margin.end.length = autoMarginEnd;
      }
    }
  }
}

class FloatRegionResolver implements IRegionResolver {
  static instance = new FloatRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion) {
    region.edges.margin.clearAutoInline();
  }
}

class ReFloatRegionResolver implements IRegionResolver {
  static instance = new ReFloatRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion) {
    region.edges.margin.clearAutoInline();
  }
}

class InlineRegionResolver implements IRegionResolver {
  static instance = new InlineRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion) {
    region.edges.margin.clearAutoInline();
  }
}

class ReInlineRegionResolver implements IRegionResolver {
  static instance = new ReInlineRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion) {
    region.edges.margin.clearAutoInline();
  }
}

class InlineBlockRegionResolver implements IRegionResolver {
  static instance = new InlineBlockRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion) {
    region.edges.margin.clearAutoInline();
  }
}

class ReInlineBlockRegionResolver implements IRegionResolver {
  static instance = new ReInlineBlockRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion) {
    region.edges.margin.clearAutoInline();
  }
}

class AbsoluteRegionResolver implements IRegionResolver {
  static instance = new AbsoluteRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion) {
    region.edges.margin.clearAutoInline();
  }
}

class ReAbsoluteRegionResolver implements IRegionResolver {
  static instance = new ReAbsoluteRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion) {
    region.edges.margin.clearAutoInline();
  }
}

