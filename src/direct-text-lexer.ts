import {
  TextLexer,
  Character
} from "./public-api";

export class DirectTextLexer extends TextLexer {
  constructor(source: string, tokens: Character []){
    super("");
    this.src = this.normalize(source);
    this.tokens = tokens;
  }
}
