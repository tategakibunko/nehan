import * as Nehan from '../dist';

let NString = Nehan.Utils.String;

test("String.multiSpaceToSingle", () => {
  expect(NString.multiSpaceToSingle("foo  =  bar")).toBe("foo = bar");
});

test("String.capitalize", () => {
  expect(NString.capitalize("foo")).toBe("Foo");
  expect(NString.capitalize("Foo")).toBe("Foo");
});

test("String.chainToCamel", () => {
  expect(NString.chainToCamel("font-size")).toBe("fontSize");
  expect(NString.chainToCamel("border-left-width")).toBe("borderLeftWidth");
});

test("String.camelToChain", () => {
  expect(NString.camelToChain("fontSize")).toBe("font-size");
  expect(NString.camelToChain("borderLeftWidth")).toBe("border-left-width");
});
