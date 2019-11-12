import {
  LayoutGenerator,
  ConstantContext,
  LayoutValue
} from "./public-api";

export class ConstantGenerator extends LayoutGenerator {
  protected context!: ConstantContext;

  protected * createIterator(): IterableIterator<LayoutValue[]> {
    while (this.context.hasNext()) {
      yield this.context.getValues();
    }
  }
}
