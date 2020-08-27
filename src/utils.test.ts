import { Utils } from './public-api';

test("String.multiSpaceToSingle", () => {
  expect(Utils.String.multiSpaceToSingle("foo  =  bar")).toBe("foo = bar");
});

test("String.capitalize", () => {
  expect(Utils.String.capitalize("foo")).toBe("Foo");
  expect(Utils.String.capitalize("Foo")).toBe("Foo");
});

test("String.chainToCamel", () => {
  expect(Utils.String.chainToCamel("font-size")).toBe("fontSize");
  expect(Utils.String.chainToCamel("border-left-width")).toBe("borderLeftWidth");
});

test("String.camelToChain", () => {
  expect(Utils.String.camelToChain("fontSize")).toBe("font-size");
  expect(Utils.String.camelToChain("borderLeftWidth")).toBe("border-left-width");
});
