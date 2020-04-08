export namespace Config {
  // Language setting.
  export let lang = "ja";

  export let engineVersion = 7;

  // Tag name of page root.
  export let pageRootTagName = "body";

  export let normalizeHtml = (html: string): string => {
    return html
      .replace(/\r/g, "") // remove CR
      .replace(/<rp>(.*?)<\/rp>/gi, "") // remove rp(for faster parse)
      .replace(/<!--[\s\S]*?-->/g, "") // remove comment
      .replace(/\u2015{2}/g, "\u2014\u2014") // HORIZONTAL BAR{2} -> EM DASH{2}
      .replace(/\s+$/, "") // trim end
      // for our legacy page-break tag.
      .replace(/(?:<page-break>)|(?:<pbr>)/g, "<hr style='border-width:0px; margin:0; page-break-after: always'>")
      ;
  };

  export let maxPageCount = 2000; // too many pages -> abort.

  // text-align: justify
  // max allowed spacing size for text-align:justify.
  export let maxJustifyGap = 1.0;

  // If enabled, anonymous 'empty' line block will be discarded.
  // This is usefull if you want to display all white-spaces only by css(margin, padding, position), not by empty line.
  export let ignoreEmptyLine = false;

  // If enabled, empty inline element will be discarded.
  export let ignoreEmptyInline = false;

  // debug log settings.
  export let debugResourceLoader = false; // debug pre-loading process for resources.
  export let debugCharacter = false; // enable debug log even if it's single character.
  export let debugLayout = false; // enable debug log in layout-context and layout-generator.

  export let defaultFontSize = 16;
  export let defaultFontFamily = [
    "'ヒラギノ明朝 Pro W3'",
    "'Hiragino Mincho Pro'",
    "'HiraMinProN-W3'",
    "'Meiryo'",
    "'メイリオ'",
    "'IPA明朝'",
    "'IPA Mincho'",
    "'ＭＳ 明朝'",
    "'MS Mincho'",
    "monospace"
  ].join(",");

  export let defaultFont = [defaultFontSize + "px", defaultFontFamily].join(" ");
  export let defaultBodyMeasure = 640;
  export let defaultBodyExtent = 480;
  export let defaultLineHeight = 2.0;
  export let defaultBorderColor = "rgba(0,0,0,0.4)";
  export let defaultFloatMeasure = 100;
  export let defaultInlineBlockMeasure = 200;

  // Zs(separator, space category) characters but not omitted as white-space.
  export let nonOmitWhiteSpaces = [
    "\u3000"
  ]

  // [unmanagedCssProps] are properties that are NOT affected to nehan.js layout structure,
  // so they are transparently applied(copied) to box element as they are.
  // Feel free to add props to this field if it doesn't do any bad to your page.
  export let unmanagedCssProps = [
    "background",
    "background-image",
    "background-color",
    "background-position",
    "color",
    "z-index"
  ]

  // Tags with no css.
  export let nonLayoutTags = [
    "br"
  ]

  // Tags with only font-size settings. Empty by default.
  // Use this settings to speed up your layout engine.
  // For example, normally some kind of tags (ruby, rt, rb etc) requires only font-size.
  export let fontSizeOnlyTags: string[] = [
    "b",
    "br",
    "em",
    "rb",
    "rt",
    "rp",
    "ruby",
    "strong",
  ]

  // Tags with no edge(margin/border/padding).
  export let edgeSkipTags = [
    "rb",
    "rt",
    "rp",
    "ruby",
  ]

  // Tags with no fiexed size.
  export let boxSizeSkipTags = [
    "b",
    "em",
    "rb",
    "rt",
    "rp",
    "ruby",
    "strong",
  ]

  // Ignored css props that is defined in inline-style.
  // @example if you set this props like
  //
  // export let IgnoredInlineStyleProps = ['position'];
  //
  // then position of following tag is ignored by Nehan.CssParser::parseInlineStyle.
  // <span style='positoin:abosolute'>foo</span>
  export let IgnoredInlineStyleProps: string[] = [
  ]

  // \u0021-\u007E, block = Basic Latin(without \u0026, \u003B)
  // \u00C0-\u02A8, block = IPA Extensions
  // \u2000-\u206F, block = General Punctuation
  // \uFB00-\uFB06, block = Alphabetic Presentation Forms(but latin only)
  export let rexWord: RegExp =
    /^[\u0021-\u0025\u0027-\u003A\u003C-\u007E\u00C0-\u02A8\u2000-\u206F\uFB00-\uFB06]+/;

  // character-reference pattern
  export let rexRefChar: RegExp = /^&.+?;/;

  // tate-chu-yoko (unicode)
  // \u203C = DOUBLE EXCLAMATION MARK
  // \u2047 = DOUBLE QUESTION MARK
  // \u2048 = QUESTION EXCLAMATION MARK
  // \u2049 = EXCLAMATION QUESTION MARK
  export let rexTcyUni: RegExp = /^[\u203C\u2047-\u2049]/;

  // tate-chu-yoko pattern
  export let rexTcy: RegExp = /^[!?]{1,2}(?![!?])/;

  // return true if word string is treated as tcy.
  // @example
  // Config.isTcyWord = (word: string): boolean => {
  //   return word.length <= 2 && word.match(/^\d{1,2}$/) !== null;
  // }
  export let isTcyWord = (word: string): boolean => {
    return false;
  }

  // half width kana
  // \uFF66 = HALFWITH KATAKANA LETTER A
  // \uFF70 = HALFWIDTH KATAKANA-HIRAGANA PROLONGED SOUND MARK (not included)
  // \uFF9E = HALFWIDTH KATAKANA VOICED SOUND MARK
  // \uFF9F = HALFWIDTH KATAKANA SEMI-VOICED SOUND MARK
  export let rexHalfChar: RegExp = /^[\uFF66-\uFF69\uFF71-\uFF9D][\uFF9E-\uFF9F]?/;

  // space or control-code(like CRLF) pattern
  export let rexSpace: RegExp =
    /^[ \f\n\r\t\v\u00A0\u1680\u180e\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/;
  //export let rexSpace: RegExp = /^\s/;

  // nbsp, ensp, emsp, thinsp
  export let rexSpaceCharRef: RegExp = /^&(nb|en|em|thin)sp;/;

  // mix-char pattern used by ligature, goji.
  export let rexVoicedMark: RegExp = /^[\u3099-\u309C]/;

  // latin typographic ligatures[FB00(ff) - FB06(st)] are inlucded in rexWord,
  // so this pattern is not required.
  // export let rexTypographicLigature: RegExp = /^[\uFB00-\uFB06]/;
}
