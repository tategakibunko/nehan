import { NehanDocument, CssLength } from './public-api';

test("CssEdgeSize(border by keyword value)", () => {
  let element = new NehanDocument("").createElement("div");
  expect(CssLength.computeBorderWidth(element, "border-start-width", "thin")).toBe(2);
  expect(CssLength.computeBorderWidth(element, "border-start-width", "medium")).toBe(4);
  expect(CssLength.computeBorderWidth(element, "border-start-width", "thick")).toBe(6);
});
