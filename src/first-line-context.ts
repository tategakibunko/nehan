import {
  FlowContext,
} from "./public-api";

export class FirstLineContext extends FlowContext {
  public commit() {
    // if first line is commited, switch env to parent one.
    if (this.counter.yield === 0 && this.parent) {
      this.env = this.parent.env;
    }
    super.commit();
  }
}

