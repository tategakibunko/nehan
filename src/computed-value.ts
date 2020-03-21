import {
  Config,
  HtmlElement,
  ContainingElement,
  CssCascade,
  CssStyleDeclaration,
  LogicalSize,
  LogicalPadding,
  LogicalBorder,
  BoxSizing,
} from './public-api'

/*
  Compute used-value(auto, inherit, percent) for 'measure', 'extent', 'margin' etc.
  These props have it's constraints, and thus, decided by other extra rule or property.

  [warning]

  There are some properties that inherit percentage value by inherit.

  quote from [https://www.w3.org/TR/CSS2/changes.html#q21.36]
  > Since computed value of a property can now also be a percentage.
  > In particular, the following properties now inherit the percentage if the specified value is a percentage.
  > Note that only 'text-indent' inherits by default, the others only inherit if the 'inherit' keyword is specified.

  > background-position
  > before, end, after, start
  > extent, measure,
  > margin-***,
  > min-extent, min-measure
  > padding-***,
  > text-indent

  [example]

  <body style="measure:100px">
    <div style="measure:auto">
      100px
      <div style="measure:50%">
        50px(50% of parent=100px)
        <div style="measure:inherit">
          25px(inherit=50% of parent=50px)
          Note that inherited value of 'inherit' is specified value(50%), not computed value(50px).
        </div>
      </div>
    </div>
  </body>

  [todo]

  If element is absolutely posisioned,
  percentage size is caluclated with respect to size of 'padding-box'.
*/
type OptionalNumber = "none" | number;
type AutableNumber = "auto" | number;

interface ComputedValue {
  save: (style: CssStyleDeclaration) => void;
}

function loadOptionalNumber(element: HtmlElement, prop: string): OptionalNumber {
  const value = CssCascade.getValue(element, prop);
  return (value === "none") ? value : parseInt(value, 10);
}

function loadAutableNumber(element: HtmlElement, prop: string): AutableNumber {
  const value = CssCascade.getValue(element, prop);
  return (value === "auto") ? value : parseInt(value, 10);
}

class ComputedLength implements ComputedValue {
  constructor(public length: AutableNumber, public prop: string) { }

  static load(element: HtmlElement, prop: string): ComputedLength {
    const value = loadAutableNumber(element, prop);
    return new ComputedLength(value, prop);
  }

  get number(): number {
    if (this.length === "auto") {
      throw new Error("length is not resolved.")
    }
    return this.length;
  }

  set number(value: number) {
    this.length = value;
  }

  isAuto(): boolean {
    return this.length === "auto";
  }

  setAutoZero() {
    this.length = (this.length === "auto") ? 0 : this.length;
  }

  save(style: CssStyleDeclaration) {
    if (this.length !== "auto") {
      style.setProperty(this.prop, this.length + "px");
    }
  }
}

class ComputedPosition {
  constructor(
    public before: ComputedLength,
    public end: ComputedLength,
    public after: ComputedLength,
    public start: ComputedLength
  ) { }

  static load(element: HtmlElement): ComputedPosition {
    return new ComputedPosition(
      ComputedLength.load(element, "before"),
      ComputedLength.load(element, "end"),
      ComputedLength.load(element, "after"),
      ComputedLength.load(element, "start"),
    );
  }

  save(style: CssStyleDeclaration) {
    this.before.save(style);
    this.end.save(style);
    this.after.save(style);
    this.start.save(style);
  }

  public isAutoInline(): boolean {
    return this.start.isAuto() && this.end.isAuto();
  }
}

class ComputedMinSize {
  constructor(private minSize: OptionalNumber, private prop: string) { }

  static load(element: HtmlElement, prop: string): ComputedMinSize {
    return new ComputedMinSize(loadOptionalNumber(element, prop), prop);
  }

  save(style: CssStyleDeclaration) {
    if (this.minSize !== "none") {
      style.setProperty(this.prop, this.minSize + "px");
    }
  }

  apply(value: number): number {
    return this.minSize !== "none" ? Math.max(this.minSize, value) : value;
  }
}

class ComputedMaxSize {
  constructor(private maxSize: OptionalNumber, private prop: string) { }

  static load(element: HtmlElement, prop: string): ComputedMaxSize {
    return new ComputedMaxSize(loadOptionalNumber(element, prop), prop);
  }

  save(style: CssStyleDeclaration) {
    if (this.maxSize !== "none") {
      style.setProperty(this.prop, this.maxSize + "px");
    }
  }

  apply(value: number): number {
    return this.maxSize !== "none" ? Math.min(this.maxSize, value) : value;
  }
}

class ComputedMinMaxRange {
  constructor(private minSize: ComputedMinSize, private maxSize: ComputedMaxSize) { }

  static load(element: HtmlElement, minProp: string, maxProp: string): ComputedMinMaxRange {
    return new ComputedMinMaxRange(
      ComputedMinSize.load(element, minProp),
      ComputedMaxSize.load(element, maxProp)
    );
  }

  save(style: CssStyleDeclaration) {
    this.minSize.save(style);
    this.maxSize.save(style);
  }

  apply(value: number): number {
    return this.maxSize.apply(this.minSize.apply(value));
  }
}

class ComputedMinMaxBoxSize {
  constructor(private minMaxMeasure: ComputedMinMaxRange, private minMaxExtent: ComputedMinMaxRange) { }

  static load(element: HtmlElement): ComputedMinMaxBoxSize {
    return new ComputedMinMaxBoxSize(
      ComputedMinMaxRange.load(element, "min-measure", "max-measure"),
      ComputedMinMaxRange.load(element, "min-extent", "max-extent")
    );
  }

  save(style: CssStyleDeclaration) {
    this.minMaxMeasure.save(style);
    this.minMaxExtent.save(style);
  }

  apply(measure: number, extent: number): LogicalSize {
    return new LogicalSize({
      measure: this.minMaxMeasure.apply(measure),
      extent: this.minMaxExtent.apply(extent)
    });
  }
}

class ComputedLogicalSize {
  constructor(public measure: ComputedLength, public extent: ComputedLength) { }

  static load(element: HtmlElement): ComputedLogicalSize {
    let measure = ComputedLength.load(element, "measure");
    let extent = ComputedLength.load(element, "extent");
    if (!element.parent) {
      measure = measure.isAuto() ? new ComputedLength(Config.defaultBodyMeasure, "measure") : measure;
      extent = extent.isAuto() ? new ComputedLength(Config.defaultBodyExtent, "extent") : extent;
    }
    return new ComputedLogicalSize(measure, extent);
  }

  save(style: CssStyleDeclaration) {
    this.measure.save(style);
    this.extent.save(style);
  }
}

class ComputedPhysicalSize {
  constructor(public width: ComputedLength, public height: ComputedLength) { }

  static load(element: HtmlElement): ComputedPhysicalSize {
    const width = this.loadPhysicalSize(element, "width");
    const height = this.loadPhysicalSize(element, "height");
    return new ComputedPhysicalSize(width, height);
  }

  static loadPhysicalSize(element: HtmlElement, prop: string): ComputedLength {
    // attr size must be defined by pixel size.
    // https://www.w3.org/wiki/Html/Elements/img#HTML_Attributes
    let attrSize = element.getAttribute(prop);
    if (attrSize) {
      return new ComputedLength(parseInt(attrSize), prop);
    }
    return ComputedLength.load(element, prop);
  }

  save(style: CssStyleDeclaration) {
    this.width.save(style);
    this.height.save(style);
  }
}

class ComputedMargin {
  constructor(
    public before: ComputedLength,
    public end: ComputedLength,
    public after: ComputedLength,
    public start: ComputedLength
  ) { }

  static load(element: HtmlElement): ComputedMargin {
    return new ComputedMargin(
      ComputedLength.load(element, "margin-before"),
      ComputedLength.load(element, "margin-end"),
      ComputedLength.load(element, "margin-after"),
      ComputedLength.load(element, "margin-start"),
    );
  }

  save(style: CssStyleDeclaration) {
    this.before.save(style);
    this.end.save(style);
    this.after.save(style);
    this.start.save(style);
  }

  get measure(): number {
    return this.start.number + this.end.number;
  }

  get extent(): number {
    return this.before.number + this.after.number;
  }

  isAutoMeasure(): boolean {
    return this.start.isAuto() || this.end.isAuto();
  }

  isAutoExtent(): boolean {
    return this.before.isAuto() || this.after.isAuto();
  }

  clearAutoInline() {
    this.start.setAutoZero();
    this.end.setAutoZero();
  }

  clearAutoBlock() {
    this.before.setAutoZero();
    this.after.setAutoZero();
  }

  clearInline() {
    this.start.number = 0;
    this.end.number = 0;
  }

  clearBlock() {
    this.before.number = 0;
    this.after.number = 0;
  }
}

class ComputedBoxEdges {
  constructor(
    public padding: LogicalPadding,
    public border: LogicalBorder,
    public margin: ComputedMargin,
  ) { }

  static load(element: HtmlElement) {
    return new ComputedBoxEdges(
      LogicalPadding.load(element),
      LogicalBorder.load(element),
      ComputedMargin.load(element),
    )
  }

  save(style: CssStyleDeclaration) {
    this.margin.save(style);
  }

  get measure(): number {
    return this.borderBoxMeasure + this.margin.measure;
  }

  get extent(): number {
    return this.borderBoxExtent + this.margin.extent;
  }

  get borderBoxMeasure(): number {
    return this.border.width.measure + this.padding.measure;
  }

  get borderBoxExtent(): number {
    return this.border.width.extent + this.padding.extent;
  }
}

export class ComputedRegion {
  constructor(
    public boxSizing: BoxSizing,
    public containingMeasure: number, // resolved!
    public containingExtent: ComputedLength,
    public logicalSize: ComputedLogicalSize,
    public physicalSize: ComputedPhysicalSize,
    public position: ComputedPosition,
    public edges: ComputedBoxEdges,
    public minMaxBoxSize: ComputedMinMaxBoxSize,
  ) { }

  static load(element: HtmlElement): ComputedRegion | undefined {
    const containingElement = ContainingElement.get(element);
    const containingMeasure = ComputedLength.load(containingElement, "measure");
    const containingExtent = ComputedLength.load(containingElement, "extent");
    if (containingMeasure.isAuto()) {
      // console.warn("[%s] containing size for %s is not resolved yet. containingElement:%o", element.tagName, containingElement.tagName, containingElement);
      return undefined;
    }
    return new ComputedRegion(
      BoxSizing.load(element),
      containingMeasure.number,
      containingExtent,
      ComputedLogicalSize.load(element),
      ComputedPhysicalSize.load(element),
      ComputedPosition.load(element),
      ComputedBoxEdges.load(element),
      ComputedMinMaxBoxSize.load(element),
    );
  }

  save(style: CssStyleDeclaration) {
    this.logicalSize.save(style);
    this.physicalSize.save(style);
    this.position.save(style);
    this.edges.save(style);
    this.minMaxBoxSize.save(style);
  }

  get borderBoxMeasure(): number {
    if (this.logicalSize.measure.length === "auto") {
      throw new Error("measure is not resolved.")
    }
    if (this.boxSizing.isBorderBox()) {
      return this.logicalSize.measure.length;
    }
    if (this.boxSizing.isPaddingBox()) {
      return this.logicalSize.measure.length + this.edges.border.width.measure;
    }
    return this.logicalSize.measure.length + this.edges.borderBoxMeasure;
  }
}
