import {
  FlowGenerator,
  RubyContext,
  LayoutValue,
  LayoutControl,
  LogicalBox,
} from "./public-api";

export class RubyGenerator extends FlowGenerator {
  protected context!: RubyContext;

  protected onInline(box: LogicalBox): LayoutValue[] {
    if (this.context.shiftInline(box)) {
      let ruby = this.context.createRuby();
      return [new LayoutValue(ruby)];
    }
    return [];
  }

  protected reduceLayout(overflow: boolean): LayoutValue[] {
    if (this.context.isRubyReady()) {
      let ruby = this.context.createRuby();
      return [new LayoutValue(ruby)];
    }
    return [new LayoutValue(LayoutControl.createSkip())];
  }
}
