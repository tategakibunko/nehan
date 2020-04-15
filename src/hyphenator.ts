import {
  DualChar,
  Lexer,
  ICharacter,
  TextFormatContext,
} from './public-api';

export interface IHyphenator {
  hyphenate: (context: TextFormatContext) => number;
}

export class Hyphenator implements IHyphenator {
  static instance = new Hyphenator();
  private constructor() { }

  public hyphenate(context: TextFormatContext): number {
    const lexer = context.lexer;
    const moveCount = this.getHyphenateCount(lexer);

    // if moveCount is minus, it's 'OI-DASHI'.
    if (moveCount < 0) {
      // console.log("OI-DASHI:", moveCount);
      const popCount = -moveCount;
      if (popCount >= context.characters.length) {
        return 0;
      }
      for (let i = 0; i < popCount; i++) {
        context.characters.pop();
        context.text = context.text.slice(0, -1);
        lexer.setPos(lexer.getPos() - 1);
      }
    }
    // if offst is plus, it's 'BURA-SAGARI'.
    else if (moveCount > 0) {
      // console.log("BURA-SAGARI:", moveCount);
      for (let i = 0; i < moveCount; i++) {
        context.addCharacter(lexer.getNext());
      }
    }
    return moveCount;
  }

  private getHyphenateCount(lexer: Lexer<ICharacter>): number {
    const tail = lexer.peek(-1);
    const head = lexer.peek(0);
    const next1 = lexer.peek(+1);

    // c ... [prev2][prev1][tail] <br>
    // [head(NG)][next1]
    if (head instanceof DualChar && head.isHeadNg() && head.isHangEnable()) {
      //
      // BURA-SAGARI for head-NG(+1)
      //
      // c ... [prev2][prev1][tail][head] <br>
      // [next1]
      if (next1 === null || next1 instanceof DualChar === false) {
        return +1;
      }
      if (next1 && next1 instanceof DualChar && next1.isHeadNg() === false) {
        return +1;
      }

      //
      // OI-DASHI for head-NG(-1)
      // 
      // c ... c [prev2][prev1]<br>
      // [tail][head][next1]
      if (tail && tail instanceof DualChar === false) {
        return -1;
      }
      if (tail && tail instanceof DualChar && tail.isHeadNg() === false) {
        return -1;
      }
    }

    // c ... c [prev2][prev1][tail(NG)]<br>
    // [head][next1]
    if (tail instanceof DualChar && tail.isTailNg()) {
      let move = -1;
      while (true) {
        let prev = lexer.peek(move - 1); // prev1(-2), prev2(-3) ...
        if (!prev) {
          break;
        }
        if (prev && prev instanceof DualChar === false) {
          break;
        }
        if (prev && prev instanceof DualChar && prev.isTailNg() === false) {
          break;
        }
        move--;
      }
      return move;
    }
    return 0;
  }
}