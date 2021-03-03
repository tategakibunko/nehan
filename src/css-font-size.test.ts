import { NehanElement, HtmlDocument, CssLength } from './public-api';

test("CssFontSize(absolute size)", () => {
  let doc = new HtmlDocument("dummy");
  let element = doc.createElement("div");
  expect(CssLength.computeFontSize(element, "xx-small")).toBe(8);
  expect(CssLength.computeFontSize(element, "x-small")).toBe(10);
  expect(CssLength.computeFontSize(element, "small")).toBe(13);
  expect(CssLength.computeFontSize(element, "medium")).toBe(16);
  expect(CssLength.computeFontSize(element, "large")).toBe(18);
  expect(CssLength.computeFontSize(element, "x-large")).toBe(24);
  expect(CssLength.computeFontSize(element, "xx-large")).toBe(33);
});

test("CssFontSize(relative size)", () => {
  let doc = new HtmlDocument("<body style='font-size:16px'><div>foo</div></div>");
  let div = doc.querySelector("div");
  expect(CssLength.computeFontSize(div!, "smaller")).toBe(Math.floor(0.8 * 16));
  expect(CssLength.computeFontSize(div!, "larger")).toBe(Math.floor(1.2 * 16));
});
