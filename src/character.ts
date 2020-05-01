import {
  LogicalSize,
  Font,
  TextEmphaData,
  ILogicalNodeEvaluator,
} from "./public-api";

export interface ICharacter {
  text: string;
  size: LogicalSize;
  charCount: number;
  empha?: TextEmphaData;
  kerning: boolean;
  spacing: number;
  setMetrics: (opts: {
    font: Font;
    isVertical: boolean;
    empha?: TextEmphaData;
  }) => void;
  toString: () => string;
  acceptEvaluator: (visitor: ILogicalNodeEvaluator) => HTMLElement | Node;
}
