import * as Nehan from '../dist';

test("attr-selector[title]", () => {
  let element = new Nehan.HtmlDocument("").createElement("div");
  element.setAttribute("title", "foo");
  expect(new Nehan.AttrSelector("title").test(element)).toBe(true);
});

test("attr-selector[title=value]", () => {
  let element = new Nehan.HtmlDocument("").createElement("div");
  element.setAttribute("title", "foo");
  expect(new Nehan.AttrSelector("title", "=", "foo").test(element)).toBe(true);
  expect(new Nehan.AttrSelector("title", "=", "foobar").test(element)).toBe(false);
});

test("attr-selector[title*=value]", () => {
  let element = new Nehan.HtmlDocument("").createElement("div");
  element.setAttribute("title", "foobar");
  expect(new Nehan.AttrSelector("title", "*=", "foo").test(element)).toBe(true);
  expect(new Nehan.AttrSelector("title", "*=", "bar").test(element)).toBe(true);
  expect(new Nehan.AttrSelector("title", "*=", "foobar").test(element)).toBe(true);
  expect(new Nehan.AttrSelector("title", "*=", "baz").test(element)).toBe(false);
});

test("attr-selector[title^=value]", () => {
  let element = new Nehan.HtmlDocument("").createElement("div");
  element.setAttribute("title", "foobar");
  expect(new Nehan.AttrSelector("title", "^=", "foo").test(element)).toBe(true);
  expect(new Nehan.AttrSelector("title", "^=", "bar").test(element)).toBe(false);
});

test("attr-selector[title$=value]", () => {
  let element = new Nehan.HtmlDocument("").createElement("div");
  element.setAttribute("title", "foobar");
  expect(new Nehan.AttrSelector("title", "$=", "foo").test(element)).toBe(false);
  expect(new Nehan.AttrSelector("title", "$=", "bar").test(element)).toBe(true);
});

test("attr-selector[title~=value]", () => {
  let element = new Nehan.HtmlDocument("").createElement("div");
  element.setAttribute("title", "foo bar baz");
  expect(new Nehan.AttrSelector("title", "~=", "foo").test(element)).toBe(true);
  expect(new Nehan.AttrSelector("title", "~=", "bar").test(element)).toBe(true);
  expect(new Nehan.AttrSelector("title", "~=", "baz").test(element)).toBe(true);
  element.setAttribute("title", "foo");
  expect(new Nehan.AttrSelector("title", "~=", "foo").test(element)).toBe(true);
});

test("attr-selector[title|=value]", () => {
  let element = new Nehan.HtmlDocument("").createElement("div");
  element.setAttribute("title", "zh");
  expect(new Nehan.AttrSelector("title", "|=", "zh").test(element)).toBe(true);
  element.setAttribute("title", "zh-cn");
  expect(new Nehan.AttrSelector("title", "|=", "zh").test(element)).toBe(true);
  element.setAttribute("title", "zhcn");
  expect(new Nehan.AttrSelector("title", "|=", "zh").test(element)).toBe(false);
});

