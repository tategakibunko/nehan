/*
import {
  WritingMode,
  ILogicalNodeEvaluator,
  HoriLogicalNodeEvaluator,
  VertLogicalNodeEvaluator,
  HoriCssEvaluator,
  VertCssEvaluator,
  LogicalTextJustifier,
} from './public-api';

export class LogicalNodeEvaluatorFactory {
  static createEvaluator(writingMode: WritingMode): ILogicalNodeEvaluator {
    switch (writingMode.value) {
      case "horizontal-tb":
        return new HoriLogicalNodeEvaluator(
          writingMode,
          new HoriCssEvaluator(writingMode),
          LogicalTextJustifier.instance,
        );
      case "vertical-rl":
        return new VertLogicalNodeEvaluator(
          writingMode,
          new VertCssEvaluator(writingMode),
          LogicalTextJustifier.instance,
        );
      case "vertical-lr":
        return new VertLogicalNodeEvaluator(
          writingMode,
          new VertCssEvaluator(writingMode),
          LogicalTextJustifier.instance,
        );
      default:
        throw new Error(`undefined writing mode: ${writingMode.value}`);
    }
  }
}
*/