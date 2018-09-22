var Nehan = require("../dist");

test("selector parser simple", () => {
  let query = "main>div";
  let selector = Nehan.SelectorParser.parse(query);
  let cmbs = selector.combinators.reverse();
  let sels = selector.selectors.reverse();
  expect(sels[0].getTagName()).toBe("main");
  expect(sels[1].getTagName()).toBe("div");
  expect(cmbs[0]).toBe(">");
});

test("selector parser complex", () => {
  let query = "body:first-child > main.foo div * a#hoge[title*=foo]::first-letter";
  let selector = Nehan.SelectorParser.parse(query);
  let cmbs = selector.combinators.reverse();
  let sels = selector.selectors.reverse();
  //console.log("query:", query);
  //console.log("cmbs:", cmbs.map((c) => { return "[" + c + "]" }).join(", "));
  //console.log("sels:", sels.map((s) => { return s.toString() }).join(", "));
  expect(cmbs[0]).toBe(">");
  expect(cmbs[1]).toBe(" ");
  expect(cmbs[2]).toBe(" ");
  expect(cmbs[3]).toBe(" ");
  expect(sels[0].getTagName()).toBe("body");
  expect(sels[1].getTagName()).toBe("main");
  expect(sels[2].getTagName()).toBe("div");
  expect(sels[3].getTagName()).toBe("*");
  expect(sels[4].getTagName()).toBe("a");
  console.log(sels[4]);
});
