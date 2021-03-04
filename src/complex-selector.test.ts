import * as Nehan from './public-api';

test("spec", () => {
  expect(new Nehan.SelectorParser(new Nehan.SelectorLexer("p")).parse().specificity).toEqual({
    a: 0, b: 0, c: 1
  });
  expect(new Nehan.SelectorParser(new Nehan.SelectorLexer("p.hoge")).parse().specificity).toEqual({
    a: 0, b: 1, c: 1
  });
  expect(new Nehan.SelectorParser(new Nehan.SelectorLexer("p#hoge")).parse().specificity).toEqual({
    a: 1, b: 0, c: 1
  });
  expect(new Nehan.SelectorParser(new Nehan.SelectorLexer("p#hoge.foo")).parse().specificity).toEqual({
    a: 1, b: 1, c: 1
  });
  expect(new Nehan.SelectorParser(new Nehan.SelectorLexer("p#hoge.foo>span")).parse().specificity).toEqual({
    a: 1, b: 1, c: 2
  });
});

test("querySelector", () => {
  const html = "<main><p class='foo'>hoge</p><p>hige</p></main>";
  const doc = new Nehan.NehanDocument(html);
  const query = "body>main>p:nth-child(2)";
  const lexer = new Nehan.SelectorLexer(query);
  const parser = new Nehan.SelectorParser(lexer);
  const selector = parser.parse();
  console.info("complex selector:", selector.toString());
  console.info("specificity:", selector.specificity);
  //const elements = selector.querySelectorAll(doc);
  const elements = doc.querySelectorAll(query);
  elements.forEach((e) => {
    console.log(e.toString());
  });
});
