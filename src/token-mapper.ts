import {
  Word,
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