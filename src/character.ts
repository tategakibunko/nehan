import {
  LogicalSize,
  BoxEnv,
  Char,
  SpaceChar,
  HalfChar,
  RefChar,
  SmpUniChar,
  MixChar,
  DualChar,
  Tcy,
  Word
} from "./public-api";

export interface ICharacter {
  text: string,
  size: LogicalSize,
  pos: number,
  charCount: number,
  hasEmphasis: boolean,
  kerning: boolean,
  spacing: number,
  setMetrics: (env: BoxEnv) => void,
  toString: () => string
}

export type Character = Char | SpaceChar | HalfChar | RefChar | SmpUniChar |
  MixChar | DualChar | Tcy | Word;

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
