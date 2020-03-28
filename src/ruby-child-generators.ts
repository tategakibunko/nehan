/*
import {
  FlowChildGenerators,
} from "./public-api";

export class RubyChildGenerators extends FlowChildGenerators {
  // Always rollback from first(not lead) generator.
  public rollback() {
    if(this.resumedGenerators.isRunning()){
      this.resumedGenerators.rollback();
    } else if(this.first) {
      this.first.rollback();
      this.updateActive(this.first);
    }
  }
}
*/