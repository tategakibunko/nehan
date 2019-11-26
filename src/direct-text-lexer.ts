import {
  TextLexer,
  ICharacter,
} from "./public-api";

export class DirectTextLexer extends TextLexer {
  constructor(source: string, tokens: ICharacter[]) {
    super("");
    this.src = this.normalize(source, { isPre: false });
    this.tokens = tokens;
  }
}
