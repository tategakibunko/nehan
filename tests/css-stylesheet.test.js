var Nehan = require("../dist");

test("style matching test", () => {
  let html = [
    "<p class='foo'>foo</p>",
    "<div>hoge</div>",
    "<main><div>hage</div></main>",
    "<h1></h1>",
    "<h2></h2>",
    "<h3></h3>",
    "<h4></h4>",
    "<h5></h5>",
    "<div class='hoge' style='font-size:20px'></div>",
    "<div class='hoge hage hige'></div>",
  ].join("");
  let default_font_size = "1em";
  let header_font_size = { h1: "3em", h2: "2.2em", h3: "1.5em" };
  let stylesheet = new Nehan.CssStyleSheet({
    "body": {
      "!important": (context) => {
        return { "margin": "1em" };
      }
    },
    "h1,h2,h3,h4,h5,h6": {
      "font-size": (selector) => {
        return header_font_size[selector] || "1em";
      }
    },
    "h5": {
      "color": (ctx) => "red" // macro
    },
    "p.foo": {
      "font-size": "2em"
    },
    "div": {
      "font-family": "Mincho,serif"
    },
    "main": {
      "width": (ctx) => "auto" // macro
    },
    "main>div": {
      "font-weight": "bold"
    },
    "div.hoge": {
      "font-style": "italic"
    },
    "div.hoge.hige.hage": {
      "color": "blue"
    }
  });

  let doc = new Nehan.HtmlDocument(html, {
    styleSheets: [stylesheet]
  });
  Nehan.CssLoader.loadAll(doc.body);
  let body = doc.body;
  let p = body.firstChild;
  let div = p.nextSibling;
  let main = div.nextSibling;
  let main_div = main.firstChild;
  let h1 = doc.querySelector("h1");
  let h2 = doc.querySelector("h2");
  let h3 = doc.querySelector("h3");
  let h4 = doc.querySelector("h4");
  let h5 = doc.querySelector("h5");
  let div_hoge = doc.querySelector("div.hoge");
  let div_hoge_hige_hage = doc.querySelector("div.hoge.hige.hage");
  let div_hage_hige_hoge = doc.querySelector("div.hage.hige.hoge"); // same

  expect(body.style.getPropertyValue("margin-start")).toBe("1em");
  expect(p.style.getPropertyValue("font-size")).toBe("2em");
  expect(div.style.getPropertyValue("font-family")).toBe("Mincho,serif");
  expect(main.style.getPropertyValue("width")).toBe("auto");
  expect(main_div.style.getPropertyValue("font-weight")).toBe("bold");
  expect(main_div.style.getPropertyValue("font-family")).toBe("Mincho,serif");
  expect(h1.style.getPropertyValue("font-size")).toBe(header_font_size.h1);
  expect(h2.style.getPropertyValue("font-size")).toBe(header_font_size.h2);
  expect(h3.style.getPropertyValue("font-size")).toBe(header_font_size.h3);
  expect(h4.style.getPropertyValue("font-size")).toBe(default_font_size);
  expect(h5.style.getPropertyValue("color")).toBe("red");
  expect(div_hoge.style.getPropertyValue("font-size")).toBe("20px");
  expect(div_hoge.style.getPropertyValue("font-style")).toBe("italic");
  // 'div.hoge.hige.hage' also should match 'div.hoge'
  expect(div_hoge_hige_hage.style.getPropertyValue("font-style")).toBe("italic");
  expect(div_hoge_hige_hage.style.getPropertyValue("color")).toBe("blue");
  expect(div_hage_hige_hoge.style.getPropertyValue("color")).toBe("blue");
});
