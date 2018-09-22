import {
  SpaceCharInfo,
  Utils,
} from "./public-api";

let create_size_space_info = (advance_rate: number): SpaceCharInfo => {
  return {
    advanceRate: advance_rate,
    isNoBreak: false,
    isControl: false
  };
};

let zeroSpace: SpaceCharInfo = {
  advanceRate: 0,
  isNoBreak: false,
  isControl: false
};

let zeroSpaceNoBreak: SpaceCharInfo = {
  advanceRate: 0,
  isNoBreak: true,
  isControl: false
}

let noBreakSpace: SpaceCharInfo = {
  advanceRate: 0.38,
  isNoBreak: true,
  isControl: false
}

let narrowNoBreakSpace: SpaceCharInfo = {
  // Usually the size of narrow no break space is one third of normal space,
  // but changes between 33% to 70% by it's context.
  // [ref: https://en.wikipedia.org/wiki/Non-breaking_space]
  advanceRate: 0.33,
  isNoBreak: true,
  isControl: false
}

let controller: SpaceCharInfo = {
  advanceRate: 0,
  isNoBreak: false,
  isControl: true
};

let fullSpace = create_size_space_info(1);
let halfSpace = create_size_space_info(0.5);
let threePerEm = create_size_space_info(1/3);
let fourPerEm = create_size_space_info(1/4);
let sixPerEm = create_size_space_info(1/6);
let thinSpace = create_size_space_info(0.2);
let hairSpace = create_size_space_info(0.1);

// [key: string] is called 'string index siguniture',
// means that all key must be string.
let space_char_table: {[_: string]: SpaceCharInfo} = {
  "U+0009":halfSpace, // CHARACTER TABULATION
  "U+000A":controller, // LINE FEED
  "U+000B":controller, // VERTICAL TABULATION
  "U+000C":controller, // FORM FEED
  "U+000D":controller, // CARRIAGE RETURN
  "U+001C":halfSpace, // FILE SEPARATOR
  "U+001D":halfSpace, // GROUP SEPARATOR
  "U+001E":halfSpace, // RECORD SEPARATOR
  "U+001F":halfSpace, // UNIT SEPARATOR
  "U+0020":halfSpace, // SPACE
  "U+00A0":noBreakSpace, // NO-BREAK SPACE
  "U+034F":zeroSpace, // COMBINING GRAPHEME JOINER
  "U+1680":halfSpace, // OGHAM SPACE MARK
  "U+180E":halfSpace, // MONGOLIAN VOWEL SEPARATOR
  "U+2000":halfSpace, // EN QUAD
  "U+2001":fullSpace, // EM QUAD
  "U+2002":halfSpace, // EN SPACE
  "U+2003":fullSpace, // EM SPACE
  "U+2004":threePerEm, // THREE-PER-EM SPACE
  "U+2005":fourPerEm, // FOUR-PER-EM SPACE
  "U+2006":sixPerEm, // SIX-PER-EM SPACE
  "U+2007":halfSpace, // FIGURE SPACE
  "U+2008":halfSpace, // PUNCTUATION SPACE
  "U+2009":thinSpace, // THIN SPACE
  "U+200A":hairSpace, // HAIR SPACE
  "U+200B":zeroSpace, // ZERO WIDTH SPACE,
  "U+200C":zeroSpace, // ZERO WIDTH NON-JOINER
  "U+200D":zeroSpace, // ZERO WIDTH JOINER
  "U+200E":zeroSpace, // LEFT-TO-RIGHT MARK
  "U+200F":zeroSpace, // RIGHT-TO-LEFT MARK
  "U+2028":controller, // LINE SEPARATOR
  "U+2029":controller, // PARAGRAPH SEPARATOR
  "U+202A":controller, // LEFT-TO-RIGHT EMBEDDING
  "U+202B":controller, // RIGHT-TO-LEFT EMBEDDING
  "U+202C":controller, // POP DIRECTIONAL FORMATTING
  "U+202D":controller, // LEFT-TO-RIGHT OVERRIDE
  "U+202E":controller, // RIGHT-TO-LEFT OVERRIDE
  "U+202F":narrowNoBreakSpace, // NARROW NO-BREAK SPACE
  "U+2061":controller, // FUNCTION APPLICATION
  "U+2062":controller, // INVISIBLE TIMES
  "U+2063":controller, // INVISIBLE SEPARATOR
  "U+3000":fullSpace, // IDEOGRAPHIC SPACE
  "U+FEFE":zeroSpaceNoBreak, // ZERO WIDTH NO-BREAK SPACE
}

// reference: http://anti.rosx.net/etc/memo/002_space.html
export class SpaceCharTable {
  static load(str: string): SpaceCharInfo {
    let prop = Utils.String.getUnicodeProp(str);
    let info = space_char_table[prop];
    if(!info){
      throw new Error("SpaceChar(" + prop + ") not exists.");
    }
    //console.log("space char table(%s):", prop, info);
    return info;
  }
}
