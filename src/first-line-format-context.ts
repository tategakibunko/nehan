import {
  FlowFormatContext,
  LogicalLineNode,
} from './public-api'

export class FirstLineFormatContext extends FlowFormatContext {
  public addLine(line: LogicalLineNode) {
    // In '::first-line' element, original env is only used for first-line block,
    // so after adding first line block, we should switch env to parent one.
    if (this.totalLineCount === 0 && this.parent) {
      this.env = this.parent.env;
    }
    super.addLine(line);
  }
}