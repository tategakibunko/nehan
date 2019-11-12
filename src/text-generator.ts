import {
  LayoutValue,
  LayoutGenerator,
  TextContext,
} from "./public-api";

export class TextGenerator extends LayoutGenerator {
  protected context!: TextContext;

  public rollback() {
    this.context.rollback();
  }

  protected * createIterator(): IterableIterator<LayoutValue[]> {
    while (this.context.hasNext()) {
      this.context.save();
      let next = this.context.getNext();
      let char = next.value[0].getAsCharacter();
      if (this.context.shiftCharacter(char)) {
        let text = this.context.createTextBox(true);
        yield [new LayoutValue(text)];
      }
      if (!this.context.hasNext()) {
        let text = this.context.createTextBox(false);
        yield [new LayoutValue(text)];
      }
    }
  }
}
