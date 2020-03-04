import {
  FlowFormatContext,
  LogicalLineNode,
} from './public-api'
import { TextNodeGenerator } from './text-node-generator';

export class FirstLineFormatContext extends FlowFormatContext {
  public addLine(block: LogicalLineNode) {
    const isFirstLine = !this.isLineCreated();
    super.addLine(block);
    // In '::first-line' element, original env is only used for first-line block,
    // so after adding first line block, we should switch env to parent one.
    if (isFirstLine && this.parent) {
      this.env = this.parent.env;
    }
  }
}