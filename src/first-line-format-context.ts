import {
  FlowFormatContext,
  LogicalLineNode,
} from './public-api'
import { TextNodeGenerator } from './text-node-generator';

export class FirstLineFormatContext extends FlowFormatContext {
  public addLine(block: LogicalLineNode) {
    const isFirstLine = !this.isLineCreated();
    super.addLine(block);
    if (isFirstLine && this.parent) {
      this.env = this.parent.env;
      let child = this.child;
      while (child) {
        if (child instanceof TextNodeGenerator) {
          break;
        }
        child.context.env = this.parent.env;
        if (child instanceof FlowFormatContext) {
          child = child.child;
        } else {
          break;
        }
      }
    }
  }
}