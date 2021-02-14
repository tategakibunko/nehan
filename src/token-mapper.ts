import {
  Config,
  Word,
  Tcy,
  ICharacter,
} from "./public-api";

export interface TokenMapper<T> {
  visit: (tokens: T[]) => T[];
}

export class UprightTokenMapper implements TokenMapper<ICharacter> {
  visit(tokens: ICharacter[]): ICharacter[] {
    return tokens.reduce((acm, token) => {
      if (token instanceof Word) {
        return acm.concat(token.toTcys());
      }
      return acm.concat(token);
    }, [] as ICharacter[]);
  }
}

export class TcyTokenMapper implements TokenMapper<ICharacter> {
  visit(tokens: ICharacter[]): ICharacter[] {
    return tokens.map((token, index) => {
      if (token instanceof Word === false) {
        return token;
      }
      const prev = index > 0 ? tokens[index - 1].text : "";
      const next = index < tokens.length - 1 ? tokens[index + 1].text : "";
      if (Config.isTcyWord(token.text, { prev, next })) {
        return new Tcy(token.text);
      }
      return token;
    }, [] as ICharacter[]);
  }
}