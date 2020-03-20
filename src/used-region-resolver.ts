import {
  Config,
  HtmlElement,
  ComputedRegion,
  Display,
  BorderCollapse,
  LogicalFloatValue,
  CssCascade,
  PositionValue,
  ReplacedElement,
} from './public-api'

export interface IRegionResolver {
  resolve: (element: HtmlElement, computedResion: ComputedRegion, display: Display) => void;
}

// https://www.w3.org/TR/CSS22/visudet.html#Computing_widths_and_margins
export class UsedRegionResolver {
  static select(element: HtmlElement) {
    const display = Display.load(element);
    const float = CssCascade.getValue(element, "float") as LogicalFloatValue;
    const position = CssCascade.getValue(element, "position") as PositionValue;
    const isRe = ReplacedElement.isReplacedElement(element);

    if (float !== "none") {
      return isRe ? ReFloatBlockRegionResolver.instance : FloatBlockRegionResolver.instance;
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

  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    // In collapse mode, <tr>, <tbody>, <thead>, <tfoot> share the measure of block level parent(<table>).
    if (display.isTableRow() || display.isTableRowGroup()) {
      const parent = element.parent;
      const borderCollapse = BorderCollapse.load(element);
      if (parent && borderCollapse.isCollapse()) {
        return parseInt(parent.computedStyle.getPropertyValue("measure") || "0");
      }
    }
    if (region.logicalSize.measure.length === "auto") {
      region.edges.margin.clearAutoInline();
      region.logicalSize.measure.length = region.containingMeasure - region.edges.measure;
      return;
    }
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

class ReBlockRegionResolver implements IRegionResolver {
  static instance = new ReBlockRegionResolver();
  private constructor() { }

  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    if (region.logicalSize.measure.length === "auto") {
      region.edges.margin.clearAutoInline();
      return;
    }
    if (region.edges.margin.start.length === "auto" && region.edges.margin.end.length === "auto") {
      const autoMarginBoth = Math.floor((region.containingMeasure - region.logicalSize.measure.length) / 2);
      region.edges.margin.start.length = region.edges.margin.end.length = autoMarginBoth;
    } else if (region.edges.margin.start.length === "auto" && region.edges.margin.end.length !== "auto") {
      const autoMarginStart = region.containingMeasure - region.logicalSize.measure.length - region.edges.margin.end.length;
      region.edges.margin.start.length = autoMarginStart;
    } else if (region.edges.margin.start.length !== "auto" && region.edges.margin.end.length === "auto") {
      const autoMarginEnd = region.containingMeasure - region.logicalSize.measure.length - region.edges.margin.start.length;
      region.edges.margin.end.length = autoMarginEnd;
    }
  }
}

class FloatBlockRegionResolver implements IRegionResolver {
  static instance = new FloatBlockRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    region.edges.margin.clearAutoInline();
    if (region.logicalSize.measure.isAuto()) {
      console.info(`auto measure for float element is not allowed in nehan, so use ${Config.defaultFloatMeasure}px by default.`);
      region.logicalSize.measure.length = Config.defaultFloatMeasure;
    }
  }
}

class ReFloatBlockRegionResolver implements IRegionResolver {
  static instance = new ReFloatBlockRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    region.edges.margin.clearAutoInline();
    if (region.logicalSize.measure.isAuto()) {
      console.info(`auto measure for float element is not allowed in nehan, so use ${Config.defaultFloatMeasure}px by default.`);
      region.logicalSize.measure.length = Config.defaultFloatMeasure;
    }
  }
}

class InlineRegionResolver implements IRegionResolver {
  static instance = new InlineRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    region.edges.margin.clearAutoInline();
  }
}

class ReInlineRegionResolver implements IRegionResolver {
  static instance = new ReInlineRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    region.edges.margin.clearAutoInline();
  }
}

class InlineBlockRegionResolver implements IRegionResolver {
  static instance = new InlineBlockRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    region.edges.margin.clearAutoInline();
    if (region.logicalSize.measure.isAuto()) {
      if (element.computedStyle.getPropertyValue("display") !== "table-cell") {
        console.info(`auto measure for inline-block element is not allowed in nehan, so use ${Config.defaultInlineBlockMeasure}px by default.`);
        region.logicalSize.measure.length = Config.defaultInlineBlockMeasure;
      }
    }
  }
}

class ReInlineBlockRegionResolver implements IRegionResolver {
  static instance = new ReInlineBlockRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    region.edges.margin.clearAutoInline();
    if (region.logicalSize.measure.isAuto()) {
      console.info(`auto measure for inline-block element is not allowed in nehan, so use ${Config.defaultInlineBlockMeasure}px by default.`);
      region.logicalSize.measure.length = Config.defaultInlineBlockMeasure;
    }
  }
}

class AbsoluteRegionResolver implements IRegionResolver {
  static instance = new AbsoluteRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    region.edges.margin.clearAutoInline();
  }
}

class ReAbsoluteRegionResolver implements IRegionResolver {
  static instance = new ReAbsoluteRegionResolver();
  private constructor() { }
  resolve(element: HtmlElement, region: ComputedRegion, display: Display) {
    region.edges.margin.clearAutoInline();
  }
}

