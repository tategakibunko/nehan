import {
  FlowRegion,
  FlowContext,
  LogicalBox,
  Ruby,
} from "./public-api";

export class RubyRegion extends FlowRegion {
  protected rb: LogicalBox | null;
  protected rt: LogicalBox | null;

  constructor(context: FlowContext) {
    super(context);
    this.rb = null;
    this.rt = null;
  }

  public createRuby(): Ruby {
    if (this.rb === null || this.rt === null) {
      throw new Error("ruby element is not ready to create.");
    }
    let ruby = new Ruby({
      id: this.context.element.id,
      classes: this.context.element.classList.values(),
      rb: this.rb,
      rt: this.rt
    });
    this.clear();
    this.resetInlineCursor();
    return ruby;
  }

  public addRt(rt: LogicalBox) {
    if (this.rt) {
      console.warn("duplicate rt:", rt);
      return;
    }
    this.rt = rt;
  }

  public addRb(rb: LogicalBox) {
    if (this.rb) {
      console.warn("duplicate rb:", rb);
      return;
    }
    this.rb = rb;
  }

  public clear() {
    this.rb = null;
    this.rt = null;
  }

  public isRubyReady(): boolean {
    return this.rt !== null && this.rb !== null;
  }

  // ruby can't be splited, so use parent maxContextBoxMeasure while parsing rt, rb.
  public get restContextBoxMeasure(): number {
    if (this.context.parent) {
      return this.context.parent.region.maxContextBoxMeasure;
    }
    return this.maxContextBoxMeasure - this.cursor.start;
  }
}
