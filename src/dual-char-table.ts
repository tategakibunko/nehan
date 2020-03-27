import {
  ParenType,
  KinsokuPos,
  DualCharInfo,
  Utils
} from "./public-api";

let kakkoStart: DualCharInfo = {
  parenType: "open",
  kinsokuPos: "tail",
  kernEnable: true,
  hangEnable: false,
  rotatable: false,
  isSmall: false
};

let kakkoStartHalf: DualCharInfo = {
  parenType: "open",
  kinsokuPos: "tail",
  kernEnable: false,
  hangEnable: false,
  rotatable: false,
  isSmall: true
};

let kakkoEnd: DualCharInfo = {
  parenType: "close",
  kinsokuPos: "head",
  kernEnable: true,
  hangEnable: true,
  rotatable: false,
  isSmall: false
};

let kakkoEndHalf: DualCharInfo = {
  parenType: "close",
  kinsokuPos: "head",
  kernEnable: false,
  hangEnable: true,
  rotatable: false,
  isSmall: true
};

let kutouten: DualCharInfo = {
  parenType: "none",
  kinsokuPos: "head",
  kernEnable: true,
  hangEnable: true,
  rotatable: false,
  isSmall: false
};

let kutoutenHalf: DualCharInfo = {
  parenType: "none",
  kinsokuPos: "head",
  kernEnable: false,
  hangEnable: true,
  rotatable: false,
  isSmall: true
};

let dash: DualCharInfo = {
  parenType: "none",
  kinsokuPos: "none",
  kernEnable: false,
  hangEnable: false,
  rotatable: false,
  isSmall: false
};

/*
let rotatableDash: DualCharInfo = {
  parenType: "none",
  kinsokuPos: KinsokuPos.NONE,
  kernEnable: false,
  hangEnable: false,
  rotatable: true,
  isSmall: false
}
*/

let colon: DualCharInfo = {
  parenType: "none",
  kinsokuPos: "none",
  kernEnable: false,
  hangEnable: false,
  rotatable: false,
  isSmall: false
};

let smallKana: DualCharInfo = {
  parenType: "none",
  kinsokuPos: "head",
  kernEnable: false,
  hangEnable: false,
  rotatable: false,
  isSmall: true
};

let normal: DualCharInfo = {
  parenType: "none",
  kinsokuPos: "none",
  kernEnable: false,
  hangEnable: false,
  rotatable: false,
  isSmall: false
};

let dual_char_table: { [_: string]: DualCharInfo } = {
  "U+0028": kakkoStartHalf, // LEFT PARENTHESIS
  "U+0029": kakkoEndHalf, // RIGHT PARENTHESIS
  "U+002C": kutoutenHalf, // COMMA
  "U+002D": dash, // HYPHEN-MINUS
  "U+002E": kutoutenHalf, // FULL STOP
  "U+003A": kutoutenHalf, // COLON
  "U+003D": normal, // EQUALS SIGN
  "U+005B": kakkoStartHalf, // LEFT SQUARE BRACKET
  "U+005D": kakkoEndHalf, // RIGHT SQUARE BRACKET
  "U+007B": kakkoStartHalf, // LEFT CURLY BRACKET
  "U+007D": kakkoEndHalf, // RIGHT CURLY BRACKET
  "U+2014": dash, // EM DASH
  "U+2015": dash, // HORIZONTAL BAR
  "U+201C": kakkoStart, // LEFT DOUBLE QUOTATION MARK
  "U+201D": kakkoEnd, // RIGHT DOUBLE QUOTATION MARK
  "U+2025": dash, // TWO DOT LEADER
  "U+2026": dash, // HORIZONTAL ELLIPSIS
  "U+2190": normal, // LEFTWARDS ARROW
  "U+2191": normal, // UPWARDS ARROW
  "U+2192": normal, // RIGHTWARDS ARROW
  "U+2193": normal, // DOWNWARDS ARROW
  "U+21D2": normal, // RIGHTWARDS DOUBLE ARROW
  "U+2212": dash, // MINUS SIGN
  "U+2252": normal, // APPROXIMATELY EQUAL TO OR THE IMAGE OF
  "U+2260": normal, // NOT EQUAL TO
  "U+226A": kakkoStart, // MUCH LESS-THAN
  "U+226B": kakkoEnd, // MUCH GREATER-THAN
  "U+22EF": dash, // MIDLINE HORIZONTAL ELLIPSIS
  "U+2500": dash, // BOX DRAWINGS LIGHT HORIZONTAL
  "U+2772": kakkoStart, // LIGHT LEFT TORTOISE SHELL BRACKET ORNAMENT
  "U+2773": kakkoEnd, // LIGHT RIGHT TORTOISE SHELL BRACKET ORNAMENT
  "U+3001": kutouten, // IDEOGRAPHIC COMMA
  "U+3002": kutouten, // IDEOGRAPHIC FULL STOP
  "U+3008": kakkoStart, // LEFT ANGLE BRACKET
  "U+3009": kakkoEnd, // RIGHT ANGLE BRACKET
  "U+300A": kakkoStart, // LEFT DOUBLE ANGLE BRACKET
  "U+300B": kakkoEnd, // RIGHT DOUBLE ANGLE BRACKET
  "U+300C": kakkoStart, // LEFT CORNER BRACKET
  "U+300D": kakkoEnd, // RIGHT CORNER BRACKET
  "U+300E": kakkoStart, // LEFT WHITE CORNER BRACKET
  "U+300F": kakkoEnd, // RIGHT WHITE CORNER BRACKET
  "U+3010": kakkoStart, // LEFT BLACK LENTICULAR BRACKET
  "U+3011": kakkoEnd, // RIGHT BLACK LENTICULAR BRACKET
  "U+3014": kakkoStart, // LEFT TORTOISE SHELL BRACKET
  "U+3015": kakkoEnd, // RIGHT TORTOISE SHELL BRACKET
  "U+3016": kakkoStart, // LEFT WHITE LENTICULAR BRACKET
  "U+3017": kakkoEnd, // RIGHT WHITE LENTICULAR BRACKET
  "U+3018": kakkoStart, // LEFT WHITE TORTOISE SHELL BRACKET
  "U+3019": kakkoEnd, // RIGHT WHITE TORTOISE SHELL BRACKET
  "U+301A": kakkoStart, // LEFT WHITE SQUARE BRACKET
  "U+301B": kakkoEnd, // RIGHT WHITE SQUARE BRACKET
  "U+301C": dash, // WAVE DASH
  "U+301D": kakkoStart, // REVERSED DOUBLE PRIME QUOTATION MARK
  "U+301E": kakkoEnd, // DOUBLE PRIME QUOTATION MARK
  "U+301F": kakkoEnd, // LOW DOUBLE PRIME QUOTATION MARK
  "U+3041": smallKana, // HIRAGANA LETTER SMALL A
  "U+3043": smallKana, // HIRAGANA LETTER SMALL I
  "U+3045": smallKana, // HIRAGANA LETTER SMALL U
  "U+3047": smallKana, // HIRAGANA LETTER SMALL E
  "U+3049": smallKana, // HIRAGANA LETTER SMALL O
  "U+3063": smallKana, // HIRAGANA LETTER SMALL TU
  "U+3083": smallKana, // HIRAGANA LETTER SMALL YA
  "U+3085": smallKana, // HIRAGANA LETTER SMALL YU
  "U+3087": smallKana, // HIRAGANA LETTER SMALL YO
  "U+308E": smallKana, // HIRAGANA LETTER SMALL WA
  "U+30A1": smallKana, // KATAKANA LETTER SMALL A
  "U+30A3": smallKana, // KATAKANA LETTER SMALL I
  "U+30A5": smallKana, // KATAKANA LETTER SMALL U
  "U+30A7": smallKana, // KATAKANA LETTER SMALL E
  "U+30A9": smallKana, // KATAKANA LETTER SMALL O
  "U+30C3": smallKana, // KATAKANA LETTER SMALL TU
  "U+30E3": smallKana, // KATAKANA LETTER SMALL YA
  "U+30E5": smallKana, // KATAKANA LETTER SMALL YU
  "U+30E7": smallKana, // KATAKANA LETTER SMALL YO
  "U+30EE": smallKana, // KATAKANA LETTER SMALL WA
  "U+30F5": smallKana, // KATAKANA LETTER SMALL KA
  "U+30F6": smallKana, // KATAKANA LETTER SMALL KE
  "U+30FC": dash, // KATAKANA-HIRAGANA PROLONGED SOUND MARK
  "U+FF08": kakkoStart, // FULLWIDTH LEFT PARENTHESIS
  "U+FF09": kakkoEnd, // FULLWIDTH RIGHT PARENTHESIS
  "U+FF0C": kutouten, // FULLWIDTH COMMA
  "U+FF0D": dash, // FULLWIDTH HYPHEN-MINUS
  "U+FF0E": kutouten, // FULLWIDTH FULL STOP
  "U+FF1A": colon, // FULLWIDTH COLON
  "U+FF1C": kakkoStart, // FULLWIDTH LESS-THAN SIGN
  "U+FF1D": normal, // FULLWIDTH EQUALS SIGN
  "U+FF1E": normal, // FULLWIDTH GREATER-THAN SIGN
  "U+FF3B": kakkoStart, // FULLWIDTH LEFT SQUARE BRACKET
  "U+FF3D": kakkoEnd, // FULLWIDTH RIGHT SQUARE BRACKET
  "U+FF3F": dash, // FULLWIDTH LOW LINE
  "U+FF5B": kakkoStart, // FULLWIDTH LEFT CURLY BRACKET
  "U+FF5C": dash, // FULLWIDTH VERTICAL LINE
  "U+FF5D": kakkoEnd, // FULLWIDTH RIGHT CURLY BRACKET
  "U+FF5E": dash, // FULLWIDTH TILDE
  "U+FF61": kutoutenHalf, // HALFWIDTH IDEOGRAPHIC FULL STOP
  "U+FF62": kakkoStartHalf, // HALFWIDTH LEFT CORNER BRACKET
  "U+FF63": kakkoEndHalf,  // HALFWIDTH RIGHT CORNER BRACKET
  "U+FF64": kutouten, // HALFWIDTH IDEOGRAPHIC COMMA
  "U+FF70": dash, // HALFWIDTH KATAKANA-HIRAGANA PROLONGED SOUND MARK
};

export class DualCharTable {
  static load(str: string): DualCharInfo | null {
    let prop = Utils.String.getUnicodeProp(str);
    let info = dual_char_table[prop];
    return info || null;
  }
}
