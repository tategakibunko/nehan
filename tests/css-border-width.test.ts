import * as Nehan from '../dist';

test("CssEdgeSize(border by keyword value)", () => {
  let element = new Nehan.HtmlDocument("").createElement("div");
  expect(new Nehan.CssBorderWidth("thin", "border-start-width").computeSize(element)).toBe(2);
  expect(new Nehan.CssBorderWidth("medium", "border-start-width").computeSize(element)).toBe(4);
  expect(new Nehan.CssBorderWidth("thick", "border-start-width").computeSize(element)).toBe(6);
});
