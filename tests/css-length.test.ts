import * as Nehan from "../dist";

let test_style = new Nehan.CssStyleSheet({
  "body":{
    fontSize:"16px",
  },
  ".outer":{
    fontSize:"1.5em", // 24px
  },
  ".inner":{
    fontSize:"0.5em", // 12px
    padding:"0.5em", // 6px
  }
});

let create_doc = (html): Nehan.HtmlDocument => {
  return new Nehan.HtmlDocument(html, {
    styleSheets:[test_style]
  });
};

test("CssFontSize", () => {
  let doc = create_doc([
    "<body><div class='outer'><div class='inner'></div></div></body>"
  ].join(""));
  let outer = doc.querySelector(".outer");
  let inner = doc.querySelector(".inner");
  if(!outer || !inner){
    throw new Error("fatal");
  }
  Nehan.CssLoader.loadAll(doc.body);
  let outer_font_size = new Nehan.CssFontSize("1.5em");
  expect(outer_font_size.computeEmBasePx(outer)).toBe(16);
  expect(outer_font_size.computeSize(outer)).toBe(24);
  let inner_font_size = new Nehan.CssFontSize("0.5em");
  expect(inner_font_size.computeEmBasePx(inner)).toBe(24);
  expect(inner_font_size.computeSize(inner)).toBe(12);
  let inner_padding_size = new Nehan.CssEdgeSize("0.5em", "padding");
  expect(inner_padding_size.computeEmBasePx(inner)).toBe(12);
  expect(inner_padding_size.computeSize(inner)).toBe(6);
});
