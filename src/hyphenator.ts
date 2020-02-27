import {
  Config,
  Lexer,
  ICharacter,
  TextFormatContext,
} from './public-api';

export interface IHyphenator {
  hyphenate: (context: TextFormatContext) => void;
}

export class Hyphenator implements IHyphenator {
  static instance = new Hyphenator();
  private constructor() { }

  public hyphenate(context: TextFormatContext) {
  }
  /*
  public hyphenate() {
    let offset = this.getHyphenatePos();
    // if offset is minus, it's 'OI-DASHI'.
    if (offset < 0) {
      if (Config.debugLayout) {
        console.log("OI-DASHI:", offset);
      }
      let pop_count = -offset;
      // prevent from popping all inlines.
      pop_count = this.region.roundHyphenationPopCount(pop_count);
      for (var i = 0; i < pop_count; i++) {
        //let char = this.region.popInline();
        this.region.popCharacter();
        this.pushBack();
      }
    }
    // if offst is plus, it's 'BURA-SAGARI'.
    else if (offset > 0) {
      this.brasagari = true;
      if (Config.debugLayout) {
        console.log("BURA-SAGARI:", offset);
      }
      let push_count = offset;
      for (var i = 0; i < push_count; i++) {
        this.region.pushCharacter(this.lexer.getNext());
      }
    }
  }

  protected getHyphenatePos(): number {
    let tail = this.lexer.peek(-1);
    let head = this.lexer.peek(0);
    let next1 = this.lexer.peek(+1);

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
        let prev = this.lexer.peek(move - 1); // prev1(-2), prev2(-3) ...
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
  */
}