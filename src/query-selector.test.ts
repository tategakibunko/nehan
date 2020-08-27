import * as Nehan from './public-api';

test("querySelector from different query root", () => {
  let doc = new Nehan.HtmlDocument([
    "<html><body>",
    "<main><ul><li>foo</li><li>bar</li><li>baz</li></ul></main>",
    "<nav><ul><li>hoge</li><li>hige</li></ul></main>",
    "</body></html>",
  ].join(""));

  let main = doc.querySelector("main");
  let main_li = main.querySelectorAll("li");
  let nav = doc.querySelector("nav");
  let nav_li = nav.querySelectorAll("li");
  let all_li = doc.querySelectorAll("ul>li");

  expect(all_li.length).toBe(5);
  expect(main_li.length).toBe(3);
  expect(nav_li.length).toBe(2);
});
