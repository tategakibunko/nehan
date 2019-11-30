import * as Nehan from '../dist';

test("CssFontSize(absolute size)", () => {
  let doc = new Nehan.HtmlDocument("dummy");
  let element = doc.createElement("div");
  // let element = new Nehan.HtmlElement("div", doc);
  expect(new Nehan.CssFontSize("xx-small").computeSize(element)).toBe(8);
  expect(new Nehan.CssFontSize("x-small").computeSize(element)).toBe(10);
  expect(new Nehan.CssFontSize("small").computeSize(element)).toBe(13);
  expect(new Nehan.CssFontSize("medium").computeSize(element)).toBe(16);
  expect(new Nehan.CssFontSize("large").computeSize(element)).toBe(18);
  expect(new Nehan.CssFontSize("x-large").computeSize(element)).toBe(24);
  expect(new Nehan.CssFontSize("xx-large").computeSize(element)).toBe(33);
});

test("CssFontSize(relative size)", () => {
  let doc = new Nehan.HtmlDocument("<div>foo</div>");
  let div = doc.querySelector("div");
  expect(new Nehan.CssFontSize("smaller").computeSize(div)).toBe(Math.floor(0.8 * 16));
  expect(new Nehan.CssFontSize("larger").computeSize(div)).toBe(Math.floor(1.2 * 16));
});
