import * as Nehan from './public-api';

test("selector parser simple", () => {
  const query = "main>div";
  const lexer = new Nehan.SelectorLexer(query);
  const selector = new Nehan.SelectorParser(lexer).parse();
  expect(selector.getSelectorItem(1).getTagName()).toBe("main");
  expect(selector.getSelectorItem(0).getTagName()).toBe("div");
  expect(selector.getCombinatorItem(0)).toBe(">");
});

test("selector parser complex", () => {
  const query = "body:first-child > main.foo div * a#hoge[title*=foo]::first-letter";
  const lexer = new Nehan.SelectorLexer(query);
  const selector = new Nehan.SelectorParser(lexer).parse();
  //console.log("query:", query);
  //console.log("cmbs:", cmbs.map((c) => { return "[" + c + "]" }).join(", "));
  //console.log("sels:", sels.map((s) => { return s.toString() }).join(", "));
  expect(selector.getCombinatorItem(3)).toBe(">");
  expect(selector.getCombinatorItem(2)).toBe(" ");
  expect(selector.getCombinatorItem(1)).toBe(" ");
  expect(selector.getCombinatorItem(0)).toBe(" ");
  expect(selector.getSelectorItem(4).getTagName()).toBe("body");
  expect(selector.getSelectorItem(3).getTagName()).toBe("main");
  expect(selector.getSelectorItem(2).getTagName()).toBe("div");
  expect(selector.getSelectorItem(1).getTagName()).toBe("*");
  expect(selector.getSelectorItem(0).getTagName()).toBe("a");
});
