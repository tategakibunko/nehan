import * as Nehan from './public-api';

let doc = new Nehan.HtmlDocument("");

test("class selector", () => {
  let div = doc.createElement("div");
  div.classList.add("foo");
  div.classList.add("bar");
  div.classList.add("baz");
  let foo = new Nehan.ClassSelector("foo");
  expect(foo.test(div)).toBe(true);
  let bar = new Nehan.ClassSelector("bar");
  expect(bar.test(div)).toBe(true);
  let baz = new Nehan.ClassSelector("baz");
  expect(baz.test(div)).toBe(true);
});
