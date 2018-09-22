import {
  FlowContext
} from "./public-api";

export class FirstLineContext extends FlowContext {
  public commit(){
    // if first line is commited, switch env to parent one.
    if(this.counter.yield === 0 && this.env.parent){
      this.env = this.env.parent;
    }
    super.commit();
  }
}

