import * as Nehan from '../dist';

test("nth-child(2)", () => {
  let pseudo = new Nehan.PseudoClassSelector("nth-child(2)");
  expect(pseudo.testNthExpr(0)).toBe(false);
  expect(pseudo.testNthExpr(1)).toBe(true);
  expect(pseudo.testNthExpr(2)).toBe(false);
});

test("nth-child(2n+1)", () => {
  let pseudo = new Nehan.PseudoClassSelector("nth-child(2n+1)");
  expect(pseudo.testNthExpr(0)).toBe(false);
  expect(pseudo.testNthExpr(1)).toBe(true);
  expect(pseudo.testNthExpr(2)).toBe(false);
  expect(pseudo.testNthExpr(3)).toBe(true);
  expect(pseudo.testNthExpr(4)).toBe(false);
  expect(pseudo.testNthExpr(5)).toBe(true);
});

test("nth-child(3n)", () => {
  let pseudo = new Nehan.PseudoClassSelector("nth-child(3n)");
  expect(pseudo.testNthExpr(0)).toBe(true);
  expect(pseudo.testNthExpr(1)).toBe(false);
  expect(pseudo.testNthExpr(2)).toBe(false);
  expect(pseudo.testNthExpr(3)).toBe(true);
  expect(pseudo.testNthExpr(4)).toBe(false);
  expect(pseudo.testNthExpr(5)).toBe(false);
});

test("nth-child(3n+4)", () => {
  let pseudo = new Nehan.PseudoClassSelector("  nth-child  ( 3n + 4 )  ");
  // 4, 7, 10 ...
  expect(pseudo.testNthExpr(0)).toBe(false);
  expect(pseudo.testNthExpr(1)).toBe(false); // match if n = -1, but n >=0, so false.
  expect(pseudo.testNthExpr(2)).toBe(false);
  expect(pseudo.testNthExpr(3)).toBe(false);
  expect(pseudo.testNthExpr(4)).toBe(true);
  expect(pseudo.testNthExpr(5)).toBe(false);
  expect(pseudo.testNthExpr(6)).toBe(false);
  expect(pseudo.testNthExpr(7)).toBe(true);
  expect(pseudo.testNthExpr(8)).toBe(false);
  expect(pseudo.testNthExpr(9)).toBe(false);
  expect(pseudo.testNthExpr(10)).toBe(true);
});

test("even, odd", () => {
  let doc = new Nehan.HtmlDocument("<ul><li>1<li>2<li>3<li>4</ul>");
  let ul = doc.body.firstChild;
  let li_list = ul.children;
  let pseudo_even = new Nehan.PseudoClassSelector("even");
  let pseudo_odd = new Nehan.PseudoClassSelector("odd");

  expect(pseudo_even.test(li_list[0])).toBe(false); // 1
  expect(pseudo_even.test(li_list[1])).toBe(true); // 2
  expect(pseudo_even.test(li_list[2])).toBe(false); // 3
  expect(pseudo_even.test(li_list[3])).toBe(true); // 4

  expect(pseudo_odd.test(li_list[0])).toBe(true); // 1
  expect(pseudo_odd.test(li_list[1])).toBe(false); // 2
  expect(pseudo_odd.test(li_list[2])).toBe(true); // 3
  expect(pseudo_odd.test(li_list[3])).toBe(false); // 4
});

test("first-child", () => {
  let doc = new Nehan.HtmlDocument("<div>foo</div>");
  let pseudo = new Nehan.PseudoClassSelector("first-child");
  expect(doc.body.firstChild.tagName).toBe("div");
  expect(pseudo.test(doc.body.firstChild)).toBe(true);
});
