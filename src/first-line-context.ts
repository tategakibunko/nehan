import {
  FlowContext,
  BoxEnv,
} from "./public-api";

export class FirstLineContext extends FlowContext {
  public commit() {
    // if first line is commited, switch env to parent one.
    if (this.counter.yield === 0 && this.element.parent) {
      this.env = new BoxEnv(this.element.parent);
    }
    super.commit();
  }
}

