/*
import {
  Anchor,
  FlowGenerator,
  BodyContext,
  ILayoutOutlineCallbacks,
  LayoutEvaluator,
  VertLayoutEvaluator,
  HoriLayoutEvaluator,
  LayoutValue,
} from "./public-api";

export class BodyGenerator extends FlowGenerator {
  protected context!: BodyContext;

  public createOutlineElement(callbacks?: ILayoutOutlineCallbacks): HTMLElement {
    return this.context.createOutlineElement(callbacks);
  }

  public createEvaluator(): LayoutEvaluator {
    return this.context.isTextVertical() ?
      new VertLayoutEvaluator(this.context) : new HoriLayoutEvaluator(this.context);
  }

  public getAnchor(anchorName: string): Anchor | undefined {
    return this.context.getAnchor(anchorName);
  }

  protected onYields(values: LayoutValue[]): LayoutValue[] {
    let yields = values.filter(value => {
      return value.isBox() && value.getAsBox().size.extent > 0;
    });
    if (yields.length > 0) {
      this.context.updateStyle();
    }
    if (this.context.isTooManyPages()) {
      console.error("too many pages!");
      this.context.abort();
    }
    return yields;
  }
}
*/