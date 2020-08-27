import { CssLength, HtmlDocument, CssStyleSheet } from "./public-api";

let test_style = new CssStyleSheet({
  "body": {
    fontSize: "16px",
  },
  ".outer": {
    fontSize: "1.5em", // 24px
  },
  ".inner": {
    fontSize: "0.5em", // 12px
    padding: "0.5em", // 6px
  }
});

const create_doc = (html: string): HtmlDocument => {
  return new HtmlDocument(html, {
    styleSheets: [test_style]
  });
};

test("CssLength.getFontSize, CssLength.getBoxLength", () => {
  const doc = create_doc([
    "<body><div class='outer'><div class='inner'></div></div></body>"
  ].join(""));
  const outer = doc.querySelector(".outer");
  const inner = doc.querySelector(".inner");
  if (!outer || !inner) {
    throw new Error("fatal");
  }
  expect(outer.computedStyle.getPropertyValue("font-size")).toBe("24px");
  expect(inner.computedStyle.getPropertyValue("font-size")).toBe("12px");
  expect(inner.computedStyle.getPropertyValue("padding-start")).toBe("6px");

  expect(CssLength.computeFontSize(outer)).toBe(24);
  expect(CssLength.computeFontSize(inner)).toBe(12);
  expect(CssLength.computeBoxLength(inner, "padding-start")).toBe(6);
});
