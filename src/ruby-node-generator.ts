import {
  CssLength,
  Config,
  ILogicalNodeGenerator,
  LayoutResult,
  HtmlElement,
  RubyFormatContext,
  RubyReducer,
  LogicalNodeGenerator,
} from './public-api'

// ----------------------------------------------------------------------
// (rt | rb) -> ruby
// ----------------------------------------------------------------------
export class RubyNodeGenerator implements ILogicalNodeGenerator {
  private generator: Generator<LayoutResult>;

  constructor(
    public context: RubyFormatContext,
    public reducer = RubyReducer.instance,
  ) {
    this.generator = this.createGenerator();
  }

  public getNext(): LayoutResult | undefined {
    const next = this.generator.next();
    return next.done ? undefined : next.value;
  }

  private *createGenerator(): Generator<LayoutResult> {
    if (Config.debugLayout) {
      console.group("ruby");
    }
    let childElement: HtmlElement | null = this.context.env.element.firstChild;
    while (childElement !== null) {
      const childGen = LogicalNodeGenerator.createChild(childElement, this.context);
      this.context.child = childGen.generator;
      // Note that rb, rt never overflows in inline direction,
      // because RubyChildFormatContext has Infinity value for 'restMeasure' and 'restExtent'.
      // Because management of overflow for <rb>, <rt> is the task of <ruby> context.
      while (true) {
        const value: LayoutResult | undefined = this.context.child.getNext();
        if (!value) {
          break;
        }
        switch (value.type) {
          case "ruby-base":
            this.context.addRubyBase(value.body);
            break;
          case "ruby-text":
            this.context.addRubyText(value.body);
            break;
        }
      }
      childElement = childGen.nextElement;
    }
    for (let rubyGroup of this.context.rubyGroups) {
      const ruby = this.context.acceptLayoutReducer(this.reducer, rubyGroup);
      const rubyNode = ruby.body;
      const rubyLineExtent = rubyNode.lineExtent;
      // console.log("ruby:%o, rubyLineExtent:%d, restE:%d", rubyNode, rubyLineExtent, this.context.restExtent);
      if (rubyNode.size.measure > this.context.maxMeasure) {
        console.warn("too large ruby, can't be included, ignored:%o(maxM=%d)", ruby, this.context.maxMeasure);
        continue;
      }
      while (this.context.restExtent < rubyLineExtent) {
        yield LayoutResult.pageBreak(this.context, `restExtent is not enough for rubyNode.lineExtent(${rubyLineExtent})`);
      }
      while (this.context.restMeasure < rubyNode.measure) {
        yield LayoutResult.lineBreak;
      }
      // re-check extent after line-break
      while (this.context.restExtent < rubyLineExtent) {
        yield LayoutResult.pageBreak(this.context, `restExtent is not enough for rubyNode.lineExtent(${rubyLineExtent}) even after pageBreak`);
      }
      yield ruby;
    }
    if (Config.debugLayout) {
      console.groupEnd();
    }
  }
}

