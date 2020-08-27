import * as Nehan from './public-api';

test("spec", () => {
  expect(Nehan.SelectorParser.parse("p").specificity).toEqual({
    a: 0, b: 0, c: 1
  });
  expect(Nehan.SelectorParser.parse("p.hoge").specificity).toEqual({
    a: 0, b: 1, c: 1
  });
  expect(Nehan.SelectorParser.parse("p#hoge").specificity).toEqual({
    a: 1, b: 0, c: 1
  });
  expect(Nehan.SelectorParser.parse("p#hoge.foo").specificity).toEqual({
    a: 1, b: 1, c: 1
  });
  expect(Nehan.SelectorParser.parse("p#hoge.foo>span").specificity).toEqual({
    a: 1, b: 1, c: 2
  });
});

test("querySelector", () => {
  let html = "<main><p class='foo'>hoge</p><p>hige</p></main>";
  let doc = new Nehan.HtmlDocument(html);
  let query = "body>main>p:nth-child(2)";
  let selector = Nehan.SelectorParser.parse(query);
  console.info("complex selector:", selector.toString());
  console.info("specificity:", selector.specificity);
  //let elements = selector.querySelectorAll(doc);
  let elements = doc.querySelectorAll(query);
  elements.forEach((e) => {
    console.log(e.toString());
  });
});
