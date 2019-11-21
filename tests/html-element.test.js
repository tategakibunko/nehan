var Nehan = require("../dist");

let doc = new Nehan.HtmlDocument("");
let div = doc.createElement("div");
doc.body.appendChild(div);

["zero", "one", "two", "three", "four"].forEach(function (name) {
  div.appendChild(doc.createElement(name));
});

test("children.length", () => {
  expect(div.children.length).toBe(5);
});

test("getPrevElement", () => {
  expect(div.children[1].previousSibling.tagName).toBe("zero");
  expect(div.children[2].previousSibling.tagName).toBe("one");
  expect(div.children[4].previousSibling.tagName).toBe("three");
});

test("getNodeName", () => {
  let node = doc.createElement("div");
  node.classList.add("foo");
  node.id = "bar";
  expect(node.getNodeName()).toBe("div#bar.foo");
});

test("className(set/get)", () => {
  let node = doc.createElement("div");
  node.className = "  foo   bar baz  ";
  expect(node.classList.length).toBe(3);
  expect(node.className).toBe("foo bar baz");
  node.classList.remove("bar");
  expect(node.classList.length).toBe(2);
  expect(node.className).toBe("foo baz");
  node.className = "";
  expect(node.classList.length).toBe(0);
  expect(node.className).toBe("");
});

test("removeChild(first)", () => {
  let d = new Nehan.HtmlDocument([
    "<div>",
    "<span class='foo'></span>",
    "<span class='bar'></span>",
    "<span class='baz'></span>",
    "</div>",
  ].join(""));
  let div = d.body.firstChild;
  let first = div.removeChild(div.firstChild);
  expect(first.className).toBe("foo");
  expect(div.firstChild.className).toBe("bar");
});

test("removeChild(second)", () => {
  let d = new Nehan.HtmlDocument([
    "<div>",
    "<span class='foo'></span>",
    "<span class='bar'></span>",
    "<span class='baz'></span>",
    "</div>",
  ].join(""));
  let div = d.body.firstChild;
  let second = div.removeChild(div.firstChild.nextSibling);
  expect(second.className).toBe("bar");
  expect(div.firstChild.nextSibling.className).toBe("baz");
});

test("removeChild(last)", () => {
  let d = new Nehan.HtmlDocument([
    "<div>",
    "<span class='foo'></span>",
    "<span class='bar'></span>",
    "<span class='baz'></span>",
    "</div>",
  ].join(""));
  let div = d.body.firstChild;
  let last = div.removeChild(div.lastChild);
  expect(last.className).toBe("baz");
});

test("replaceChild", () => {
  let d = new Nehan.HtmlDocument([
    "<div>",
    "<span class='foo'></span>",
    "</div>"
  ].join(""));
  let node = d.createElement("section");
  let div = d.body.firstChild;
  let new_child = div.replaceChild(node, div.firstChild);
  expect(new_child.tagName).toBe("section");
  expect(div.firstChild.tagName).toBe("section");
});

test("appendChild", () => {
  let d = new Nehan.HtmlDocument([
    "<div>",
    "<span class='foo'></span>",
    "</div>"
  ].join(""));
  let node = d.createElement("section");
  let div = d.body.firstChild;
  div.appendChild(node);
  expect(div.firstChild.nextSibling.tagName).toBe("section");
});

test("insertBefore", () => {
  let d = new Nehan.HtmlDocument([
    "<div>",
    "<span class='foo'></span>",
    "<span class='bar'></span>",
    "<span class='baz'></span>",
    "</div>",
  ].join(""));
  let div = d.querySelector("div");
  let foo = div.querySelector("span.foo"); // 0
  let bar = div.querySelector("span.bar"); // 1
  expect(bar.index).toBe(1);

  let new_node = d.createElement("strong");
  let inserted = div.insertBefore(new_node, bar);
  expect(inserted.tagName).toBe("strong");
  expect(inserted.index).toBe(1);
  expect(bar.index).toBe(2);
  expect(bar.indexOfType).toBe(1);
});

test("getElementById", () => {
  let d = new Nehan.HtmlDocument([
    "<div id='foo'>foo</div>",
    "<div>hoge</div>",
  ].join(""));

  let div_foo = d.getElementById("foo");
  expect(div_foo.id).toBe("foo");
});
