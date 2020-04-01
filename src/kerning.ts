import {
  DualChar
} from './public-api';

export interface IKerning {
  set: (cur: DualChar, prev: DualChar) => boolean;
}

export class Kerning implements IKerning {
  static instance = new Kerning();
  private constructor() { }

  set(cur: DualChar, prev: DualChar): boolean {
    debugger;
    if (!prev.isKernEnable()) {
      return false;
    }
    if (prev.isOpenParen() && cur.isCloseParen()) {
      return false;
    }
    if (prev.isCloseParen() && cur.isOpenParen()) {
      return false;
    }
    if (prev.isOpenParen() && !cur.isParen()) {
      return false;
    }
    if (cur.isKernEnable()) {
      cur.kerning = true;
      // console.log("kerning done: %o, %o", cur, prev);
      return true;
    }
    return false;
  }
}

