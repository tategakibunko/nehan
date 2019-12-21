import {
  Utils,
  HtmlElement,
  Config,
  LogicalEdge,
  LogicalEdgeDirection,
  LogicalEdgeDirections,
  CssCascade,
  CssPosition,
  CssBoxSize,
  CssEdgeSize,
  CssBorderWidth,
  CssFontSize,
  CssLineHeight,
  LogicalBorderRadius
} from "./public-api";

// element.style -> element.computedStyle
export class ComputedStyle {
  static setComputedValue(element: HtmlElement) {
    // always required.
    this.setValue(element, "display");

    // if display:none, skip
    if (element.computedStyle.getPropertyValue("display") === "none") {
      return;
    }
    // if non layout control tags(br), skip
    if (Config.nonLayoutTags.indexOf(element.tagName) >= 0) {
      return;
    }

    element.computedStyle.setProperty("font-size", this.getFontSize(element) + "px");

    // line-height is inheritable property, and css value keeps it String typed.
    // suppose that font-size:10px
    // if line-height:2em, calculated as 20px, and children inherit line-height '20px'.
    // if line-height:2.0, calculated as 20px, and children inherit line-height '2.0'.
    element.computedStyle.setProperty("line-height", this.getLineHeightString(element));

    // if defined as font size only, skip other css value.
    if (Config.fontSizeOnlyTags.indexOf(element.tagName) >= 0) {
      return;
    }

    if (Config.edgeSkipTags.indexOf(element.tagName) < 0) {
      this.setPadding(element);
      this.setBorderWidth(element);
      this.setBorderStyle(element);
      this.setBorderColor(element);
      this.setBorderRadius(element);
    }

    if (Config.boxSizeSkipTags.indexOf(element.tagName) < 0) {
      this.setMargin(element);
      this.setMeasure(element);
      this.setExtent(element);
      this.setPosition(element);
    }

    this.setValue(element, "font-family");
    this.setValue(element, "font-style");
    this.setValue(element, "font-weight");
    this.setValue(element, "font-variant");
    this.setValue(element, "font-stretch");
    this.setValue(element, "writing-mode");
    this.setValue(element, "float");
    this.setValue(element, "text-orientation");
    this.setValue(element, "text-combine-upright");
    this.setValue(element, "text-emphasis-style");
    this.setValue(element, "text-emphasis-color");
    this.setValue(element, "text-align");
    //this.setValue(element, "text-justify"); // use 'text-align:justify' instead.
    this.setValue(element, "vertical-align");
    this.setValue(element, "list-style-type");
    this.setValue(element, "list-style-position");
    this.setValue(element, "list-style-image");
    this.setValue(element, "content");
    this.setValue(element, "word-break");
    this.setValue(element, "overflow-wrap");
    this.setValue(element, "white-space");
    this.setValue(element, "page-break-before");
    this.setValue(element, "background-position");
  }

  static setValue(element: HtmlElement, prop: string) {
    const value = CssCascade.getValue(element, prop);
    element.computedStyle.setProperty(prop, value);
  }

  static getFontSize(element: HtmlElement): number {
    const value = CssCascade.getValue(element, "font-size");
    const size = new CssFontSize(value).computeSize(element);
    return size;
  }

  static getLineHeightString(element: HtmlElement): string {
    const value = CssCascade.getValue(element, "line-height");
    const css_line_height = new CssLineHeight(value);
    const size = css_line_height.computeSize(element);
    if (css_line_height.hasUnit()) { // has unit, so px value is already confirmed.
      return size + "px";
    }
    return String(size); // remain float value
  }

  static getEdgeSize(element: HtmlElement, prop: string): number {
    const value = CssCascade.getValue(element, prop);
    return new CssEdgeSize(value, prop).computeSize(element);
  }

  static getBorderWidth(element: HtmlElement, prop: string): number {
    const value = CssCascade.getValue(element, prop);
    return new CssBorderWidth(value, prop).computeSize(element);
  }

  static setPadding(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `padding-${direction}`;
      const size = ComputedStyle.getEdgeSize(element, prop);
      element.computedStyle.setProperty(prop, size + "px");
    });
  }

  static setBorderWidth(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `border-${direction}-width`;
      const size = ComputedStyle.getBorderWidth(element, prop);
      element.computedStyle.setProperty(prop, size + "px");
    });
  }

  static setBorderStyle(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `border-${direction}-style`;
      const value = CssCascade.getValue(element, prop);
      element.computedStyle.setProperty(prop, value);
    });
  }

  static setBorderColor(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `border-${direction}-color`;
      const value = CssCascade.getValue(element, prop);
      //console.warn("[%s].%s = %s", element.toString(), prop, value);
      element.computedStyle.setProperty(prop, value);
    });
  }

  static setBorderRadius(element: HtmlElement) {
    LogicalBorderRadius.corners.forEach((corner: string) => {
      const prop = `border-${corner}-radius`;
      const size = ComputedStyle.getEdgeSize(element, prop);
      element.computedStyle.setProperty(prop, size + "px");
    });
  }

  static setMargin(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const prop = `margin-${direction}`;
      const value = CssCascade.getValue(element, prop);
      // [TODO] auto value must be replaced with used value.
      const computedValue = (value === "auto") ? "0" : ComputedStyle.getEdgeSize(element, prop) + "px";
      element.computedStyle.setProperty(prop, computedValue);
    });
  }

  static setMeasure(element: HtmlElement) {
    const value = CssCascade.getValue(element, "measure");
    if (value !== "auto") {
      const size = new CssBoxSize(value, "measure").computeSize(element);
      element.computedStyle.setProperty("measure", size + "px");
    }
  }

  static setExtent(element: HtmlElement) {
    const value = CssCascade.getValue(element, "extent");
    if (value !== "auto") {
      const size = new CssBoxSize(value, "extent").computeSize(element);
      element.computedStyle.setProperty("extent", size + "px");
    }
  }

  static setPosition(element: HtmlElement) {
    LogicalEdgeDirections.forEach(direction => {
      const value = CssCascade.getValue(element, direction);
      if (value !== "auto") {
        const size = new CssPosition(value, direction).computeSize(element);
        element.computedStyle.setProperty(direction, size + "px");
      }
    });
  }
}
