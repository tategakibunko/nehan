import * as Nehan from './public-api';

let html = [
  "<body>",
  "<p class='foo'></p>",
  "<div class='one'><div class='two'><div class='three'></div></div></div>",
  "<div class='hoge'><div class='hige'></div></div>",
  "</body>"
].join("");

let stylesheet = new Nehan.CssStyleSheet({
  "body": {
    "font-size": "20px",
    "margin": "20px 10px"
  },
  "p.foo": {
    "margin": "0",
    "line-height": "200%",
    "font-size": "0.5em" // 10px
  },
  "div.one": {
    "margin": "0",
    "line-height": "1.5",
    "font-size": "1rem" // 20px
  },
  "div.two": { // line-height = 1.5
    "font-size": "16px"
  },
  "div.three": { // line-height = 1.5
    "font-size": "8px"
  },
  "div.hoge": { // line-height = 40px
    "line-height": "2em"
  }
});
let doc = new Nehan.NehanDocument(html, {
  styleSheets: [stylesheet]
});

let body = doc.body;
let p_foo = doc.querySelector("p.foo");
let div_one = doc.querySelector("div.one");
let div_two = doc.querySelector("div.two");
let div_three = doc.querySelector("div.three");
let div_hoge = doc.querySelector("div.hoge");
let div_hige = doc.querySelector("div.hige");

test("body.extent", () => {
  let initial = Nehan.Config.defaultBodyExtent;
  expect(body.computedStyle.getPropertyValue("extent")).toBe(initial + "px");
});

test("body.measure", () => {
  let initial = Nehan.Config.defaultBodyMeasure;
  expect(body.computedStyle.getPropertyValue("measure")).toBe(initial + "px");
});

test("body.fontSize", () => {
  expect(body.computedStyle.getPropertyValue("font-size")).toBe("20px");
  expect(p_foo!.computedStyle.getPropertyValue("font-size")).toBe("10px");
  expect(div_one!.computedStyle.getPropertyValue("font-size")).toBe("20px");
});

test("body.margin", () => {
  expect(body.computedStyle.getPropertyValue("margin-before")).toBe("20px");
  expect(body.computedStyle.getPropertyValue("margin-after")).toBe("20px");
  expect(body.computedStyle.getPropertyValue("margin-end")).toBe("10px");
  expect(body.computedStyle.getPropertyValue("margin-start")).toBe("10px");
});

test("p.foo", () => {
  expect(p_foo!.computedStyle.getPropertyValue("font-size")).toBe("10px");
  expect(p_foo!.computedStyle.getPropertyValue("line-height")).toBe("20px");
});

test("div.one", () => {
  expect(div_one!.computedStyle.getPropertyValue("line-height")).toBe("1.5");
});

test("div.two", () => {
  expect(div_two!.computedStyle.getPropertyValue("line-height")).toBe("1.5");
});

test("div.three", () => {
  expect(div_three!.computedStyle.getPropertyValue("line-height")).toBe("1.5");
});

test("div.hoge", () => {
  expect(div_hoge!.computedStyle.getPropertyValue("line-height")).toBe("40px");
});

test("div.hige", () => {
  expect(div_hige!.computedStyle.getPropertyValue("line-height")).toBe("40px");
});

