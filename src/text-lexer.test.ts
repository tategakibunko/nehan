import * as Nehan from './public-api';

//let text = "&shy;foo&shy;haa";
//let text = "goﬀ";
//let text ="hoo!!hoge!?";
//let text = "ほげ!hoge!";
//let text = "「ほげ。ひげ」";

test("unicode", () => {
  const text = "&shy;foo&nbsp;word&shy;fooあ゛ばば🐟。";
  let lexer = new Nehan.TextLexer(text);
  while (lexer.hasNext()) {
    lexer.getNext();
  }
});

test("space", () => {
  const text = " hoge&nbsp;hige&ensp;hage\u0020foo　bar&thinsp;";
  let lexer = new Nehan.TextLexer(text);
  while (lexer.hasNext()) {
    lexer.getNext();
  }
});
