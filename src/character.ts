import {
  LogicalSize,
  Char,
  SpaceChar,
  HalfChar,
  RefChar,
  SmpUniChar,
  MixChar,
  DualChar,
  Tcy,
  Word,
  Font,
  TextEmphaData,
} from "./public-api";

export interface ICharacter {
  text: string,
  size: LogicalSize,
  charCount: number,
  empha?: TextEmphaData,
  kerning: boolean,
  spacing: number,
  setMetrics: (opts: {
    font: Font;
    isVertical: boolean;
    empha?: TextEmphaData;
  }) => void,
  toString: () => string
}

export type EmphasizableChar = Char | RefChar;

export let isCharacter = (value: any) => {
  return (value instanceof Char ||
    value instanceof SpaceChar ||
    value instanceof HalfChar ||
    value instanceof RefChar ||
    value instanceof SmpUniChar ||
    value instanceof MixChar ||
    value instanceof DualChar ||
    value instanceof Tcy ||
    value instanceof Word);
};
