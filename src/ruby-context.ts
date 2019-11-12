import {
  LayoutGenerator,
  LayoutGeneratorFactory,
  FlowContext,
  RubyChildGenerators,
  HtmlElement,
  Ruby,
  RubyRegion,
  LogicalBox,
  LayoutControl,
} from "./public-api";

export class RubyContext extends FlowContext {
  public parent!: FlowContext; // not null unlike FlowContext.
  public region!: RubyRegion;

  constructor(element: HtmlElement, parent: FlowContext) {
    super(element, parent);
    this.element.childNodes = this.element.childNodes.filter(child => child.tagName !== "rp");
  }

  public createRegion(): RubyRegion {
    return new RubyRegion(this);
  }

  public createChildGenerators(): RubyChildGenerators {
    let first_generator = this.createFirstGenerator();
    return new RubyChildGenerators(this, first_generator);
  }

  public rollback() {
    this.region.clear();
    super.rollback();
  }

  public isRubyReady(): boolean {
    return this.region.isRubyReady();
  }

  public shiftInline(box: LogicalBox): boolean {
    switch (box.element.tagName) {
      case "rb":
        this.region.addRb(box);
        break;
      case "rt":
        this.region.addRt(box);
        break;
      default:
        throw new Error("unsupported element(" + box.element.tagName + ") inside ruby");
    }
    this.childGens.commit();
    return this.isRubyReady();
  }

  public createRuby(): Ruby {
    return this.region.createRuby();
  }

  protected createGenerator(element: HtmlElement): LayoutGenerator {
    // text element is treated as <rb>.
    if (element.isTextElement()) {
      let doc = this.element.root;
      let rb = doc.createElement("rb");
      let text = doc.createTextNode(element.textContent);
      rb.parent = this.element;
      rb.appendChild(text);
      if (element.parent) {
        element.parent.replaceChild(rb, element);
      }
      return LayoutGeneratorFactory.createGenerator(this, rb);
    }
    return super.createGenerator(element);
  }

  public createEmptyInlineControl(overflow: boolean, size: number): LayoutControl {
    return LayoutControl.createLineBreak();
  }
}
