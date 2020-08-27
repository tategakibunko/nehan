import * as Nehan from './public-api';

test("normalize to chain-case", () => {
  expect(new Nehan.CssProp("fontSize").value).toBe("font-size");
  expect(new Nehan.CssProp("borderBeforeWidth").value).toBe("border-before-width");
});
