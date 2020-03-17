import {
  LogicalLineNode,
} from './public-api';

export interface ILogicalTextJustifier {
  justify: (line: LogicalLineNode) => void;
}

export class LogicalTextJustifier implements ILogicalTextJustifier {
  static instance = new LogicalTextJustifier();
  private constructor() { }

  justify(line: LogicalLineNode) {
    const spaceSize = line.size.measure - line.autoSize.measure;
    if (spaceSize <= 0) {
      return;
    }
    console.log("TODO: justify space:", spaceSize);
  }
}