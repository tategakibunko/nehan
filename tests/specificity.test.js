var Nehan = require("../dist");

test("sort", () => {
  let s1 = new Nehan.Specificity(1,0,0);
  let s2 = new Nehan.Specificity(2,0,0);
  let s3 = new Nehan.Specificity(0,10,0);
  expect(Nehan.Specificity.compare(s1, s1)).toBe(0);
  expect(Nehan.Specificity.compare(s1, s2)).toBe(-1);
  expect(Nehan.Specificity.compare(s2, s3)).toBe(1);
});
