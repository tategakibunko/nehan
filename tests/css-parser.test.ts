import * as Nehan from '../dist';

test("CssParser.parseInlineStyle", () => {
  const declrs = Nehan.CssParser.parseInlineStyle("  font-size : 1em; margin:1em ");
  console.log(declrs);
});

test("CssParser macro1", () => {
  const rule = Nehan.CssParser.parseRule("h1", {
    "font-size": (s) => { return "30px" }
  })[0];
  expect(rule.getPropertyValue("font-size")).toBe("30px");
});

test("CssParser !dynamic", () => {
  const rule = Nehan.CssParser.parseRule("h1", {
    "font-size": "30px",
    "!dynamic": (context) => {
      return { "font-size": "100px" };
    }
  })[0];
  // !imporatnt is callback and evaluated later,
  // so normal 'font-size' wins in this case!!
  expect(rule.getPropertyValue("font-size")).toBe("30px");

  const doc = new Nehan.HtmlDocument("");
  const element = doc.createElement("h1");
  const important_style = rule.style.getDynamicStyle(element);

  // now important callback is applied.
  expect(important_style.getPropertyValue("font-size")).toBe("100px");
});

test("CssRule.compare", () => {
  const rule1 = Nehan.CssParser.parseRule("div.foo", { "font-size": "1em" })[0];
  const rule2 = Nehan.CssParser.parseRule("div#bar", { "font-size": "2em" })[0];
  const rule3 = Nehan.CssParser.parseRule("div#bar main", { "font-size": "3em" })[0];
  expect(Nehan.CssRule.compare(rule1, rule2)).toBe(-1);
  expect(Nehan.CssRule.compare(rule2, rule1)).toBe(1);
  expect(Nehan.CssRule.compare(rule1, rule1)).toBe(0);
  expect(Nehan.CssRule.compare(rule2, rule3)).toBe(-1);
});

test("text-emphasis(shorthand)", () => {
  const rule1 = Nehan.CssParser.parseRule("*", { "text-emphasis": "filled sesame #555" })[0];
  expect(rule1.getPropertyValue("text-emphasis-style")).toBe("filled sesame");
  expect(rule1.getPropertyValue("text-emphasis-color")).toBe("#555");

  const rule2 = Nehan.CssParser.parseRule("*", { "text-emphasis": "open #555" })[0];
  expect(rule2.getPropertyValue("text-emphasis-style")).toBe("open");
  expect(rule2.getPropertyValue("text-emphasis-color")).toBe("#555");
});

test("font(shorthand)", () => {
  const shorthand = "italic small-caps normal 13px/150% Arial, Helvetica, sans-serif";
  const rule = Nehan.CssParser.parseRule("body", { "font": shorthand })[0];
  expect(rule.getPropertyValue("font-style")).toBe("italic");
  expect(rule.getPropertyValue("font-variant")).toBe("small-caps");
  expect(rule.getPropertyValue("font-weight")).toBe("normal");
  expect(rule.getPropertyValue("font-size")).toBe("13px");
  expect(rule.getPropertyValue("line-height")).toBe("150%");
  expect(rule.getPropertyValue("font-family")).toBe("Arial,Helvetica,sans-serif");
});

test("border all(shorthand)", () => {
  const shorthand = "1px solid black";
  const rule = Nehan.CssParser.parseRule("body", { "border": shorthand })[0];

  expect(rule.getPropertyValue("border-before-width")).toBe("1px");
  expect(rule.getPropertyValue("border-end-width")).toBe("1px");
  expect(rule.getPropertyValue("border-after-width")).toBe("1px");
  expect(rule.getPropertyValue("border-start-width")).toBe("1px");

  expect(rule.getPropertyValue("border-before-style")).toBe("solid");
  expect(rule.getPropertyValue("border-end-style")).toBe("solid");
  expect(rule.getPropertyValue("border-after-style")).toBe("solid");
  expect(rule.getPropertyValue("border-start-style")).toBe("solid");

  expect(rule.getPropertyValue("border-before-color")).toBe("black");
  expect(rule.getPropertyValue("border-end-color")).toBe("black");
  expect(rule.getPropertyValue("border-after-color")).toBe("black");
  expect(rule.getPropertyValue("border-start-color")).toBe("black");
});

test("border each(shorthand)", () => {
  const shorthand = "4px double #f00";
  const rule = Nehan.CssParser.parseRule("body", { "border-start": shorthand })[0];
  expect(rule.getPropertyValue("border-start-width")).toBe("4px");
  expect(rule.getPropertyValue("border-start-style")).toBe("double");
  expect(rule.getPropertyValue("border-start-color")).toBe("#f00");
});

test("border each(shorthand2)", () => {
  const shorthand = "double #f00";
  const rule = Nehan.CssParser.parseRule("body", { "border-start": shorthand })[0];
  expect(rule.getPropertyValue("border-start-width")).toBe("medium");
  expect(rule.getPropertyValue("border-start-style")).toBe("double");
  expect(rule.getPropertyValue("border-start-color")).toBe("#f00");
});

test("border each(shorthand3)", () => {
  const shorthand = "thick";
  const rule = Nehan.CssParser.parseRule("body", { "border-start": shorthand })[0];
  expect(rule.getPropertyValue("border-start-width")).toBe("thick");
  expect(rule.getPropertyValue("border-start-style")).toBe("none");
  expect(rule.getPropertyValue("border-start-color")).toBe("currentcolor");
});

test("border each(shorthand4)", () => {
  const shorthand = "10px";
  const rule = Nehan.CssParser.parseRule("body", { "border-start": shorthand })[0];
  expect(rule.getPropertyValue("border-start-width")).toBe("10px");
  expect(rule.getPropertyValue("border-start-style")).toBe("none");
  expect(rule.getPropertyValue("border-start-color")).toBe("currentcolor");
});

test("border each(shorthand5)", () => {
  const shorthand = "blue";
  const rule = Nehan.CssParser.parseRule("body", { "border-start": shorthand })[0];
  expect(rule.getPropertyValue("border-start-width")).toBe("medium");
  expect(rule.getPropertyValue("border-start-style")).toBe("none");
  expect(rule.getPropertyValue("border-start-color")).toBe("blue");
});

test("border each(shorthand6)", () => {
  const shorthand = "1px solid rgba(0,0,0,0.5)";
  const rule = Nehan.CssParser.parseRule("body", { "border-start": shorthand })[0];
  expect(rule.getPropertyValue("border-start-width")).toBe("1px");
  expect(rule.getPropertyValue("border-start-style")).toBe("solid");
  expect(rule.getPropertyValue("border-start-color")).toBe("rgba(0,0,0,0.5)");
});

test("margin(shorthand)", () => {
  const rule1 = Nehan.CssParser.parseRule("*", { "margin": "1 2 3 4" })[0];
  expect(rule1.getPropertyValue("margin-before")).toBe("1");
  expect(rule1.getPropertyValue("margin-end")).toBe("2");
  expect(rule1.getPropertyValue("margin-after")).toBe("3");
  expect(rule1.getPropertyValue("margin-start")).toBe("4");

  const rule2 = Nehan.CssParser.parseRule("*", { "margin": "1 2 3" })[0];
  expect(rule2.getPropertyValue("margin-before")).toBe("1");
  expect(rule2.getPropertyValue("margin-after")).toBe("3");
  expect(rule2.getPropertyValue("margin-start")).toBe("2");
  expect(rule2.getPropertyValue("margin-end")).toBe("2");

  const rule3 = Nehan.CssParser.parseRule("*", { "margin": "1 2" })[0];
  expect(rule3.getPropertyValue("margin-before")).toBe("1");
  expect(rule3.getPropertyValue("margin-after")).toBe("1");
  expect(rule3.getPropertyValue("margin-start")).toBe("2");
  expect(rule3.getPropertyValue("margin-end")).toBe("2");

  const rule4 = Nehan.CssParser.parseRule("*", { "margin": "1" })[0];
  expect(rule4.getPropertyValue("margin-before")).toBe("1");
  expect(rule4.getPropertyValue("margin-end")).toBe("1");
  expect(rule4.getPropertyValue("margin-after")).toBe("1");
  expect(rule4.getPropertyValue("margin-start")).toBe("1");
});

test("border-width(shorthand)", () => {
  const rule1 = Nehan.CssParser.parseRule("*", { "border-width": "1 2 3 4" })[0];
  expect(rule1.getPropertyValue("border-before-width")).toBe("1");
  expect(rule1.getPropertyValue("border-end-width")).toBe("2");
  expect(rule1.getPropertyValue("border-after-width")).toBe("3");
  expect(rule1.getPropertyValue("border-start-width")).toBe("4");

  const rule2 = Nehan.CssParser.parseRule("*", { "border-width": "1 2 3" })[0];
  expect(rule2.getPropertyValue("border-before-width")).toBe("1");
  expect(rule2.getPropertyValue("border-start-width")).toBe("2");
  expect(rule2.getPropertyValue("border-end-width")).toBe("2");
  expect(rule2.getPropertyValue("border-after-width")).toBe("3");

  const rule3 = Nehan.CssParser.parseRule("*", { "border-width": "1 2" })[0];
  expect(rule3.getPropertyValue("border-before-width")).toBe("1");
  expect(rule3.getPropertyValue("border-end-width")).toBe("2");
  expect(rule3.getPropertyValue("border-after-width")).toBe("1");
  expect(rule3.getPropertyValue("border-start-width")).toBe("2");

  const rule4 = Nehan.CssParser.parseRule("*", { "border-width": "1" })[0];
  expect(rule4.getPropertyValue("border-before-width")).toBe("1");
  expect(rule4.getPropertyValue("border-end-width")).toBe("1");
  expect(rule4.getPropertyValue("border-after-width")).toBe("1");
  expect(rule4.getPropertyValue("border-start-width")).toBe("1");

});

test("border-color(shorthand)", () => {
  const rule = Nehan.CssParser.parseRule("*", { "border-color": "red blue yellow orange" })[0];
  expect(rule.getPropertyValue("border-before-color")).toBe("red");
  expect(rule.getPropertyValue("border-end-color")).toBe("blue");
  expect(rule.getPropertyValue("border-after-color")).toBe("yellow");
  expect(rule.getPropertyValue("border-start-color")).toBe("orange");
});

test("border-radius(shorthand)", () => {
  const rule1 = Nehan.CssParser.parseRule("*", {
    "border-radius": "1 2 3 4/5 6 7 8"
  })[0];
  expect(rule1.getPropertyValue("border-before-start")).toBe("1 5");
  expect(rule1.getPropertyValue("border-before-end")).toBe("2 6");
  expect(rule1.getPropertyValue("border-after-end")).toBe("3 7");
  expect(rule1.getPropertyValue("border-after-start")).toBe("4 8");

  const rule2 = Nehan.CssParser.parseRule("*", {
    "border-radius": "1 2 3 4/5"
  })[0];
  expect(rule2.getPropertyValue("border-before-start")).toBe("1 5");
  expect(rule2.getPropertyValue("border-before-end")).toBe("2 5");
  expect(rule2.getPropertyValue("border-after-end")).toBe("3 5");
  expect(rule2.getPropertyValue("border-after-start")).toBe("4 5");

  const rule3 = Nehan.CssParser.parseRule("*", {
    "border-radius": "1 2 3 4/5 6"
  })[0];
  expect(rule3.getPropertyValue("border-before-start")).toBe("1 5");
  expect(rule3.getPropertyValue("border-before-end")).toBe("2 6");
  expect(rule3.getPropertyValue("border-after-end")).toBe("3 5");
  expect(rule3.getPropertyValue("border-after-start")).toBe("4 6");

  const rule4 = Nehan.CssParser.parseRule("*", {
    "border-radius": "1 2 3 4/5 6 7"
  })[0];
  expect(rule4.getPropertyValue("border-before-start")).toBe("1 5");
  expect(rule4.getPropertyValue("border-before-end")).toBe("2 6");
  expect(rule4.getPropertyValue("border-after-end")).toBe("3 6");
  expect(rule4.getPropertyValue("border-after-start")).toBe("4 7");

  const rule5 = Nehan.CssParser.parseRule("*", {
    "border-radius": "1 2 3 4"
  })[0];
  expect(rule5.getPropertyValue("border-before-start")).toBe("1 1");
  expect(rule5.getPropertyValue("border-before-end")).toBe("2 2");
  expect(rule5.getPropertyValue("border-after-end")).toBe("3 3");
  expect(rule5.getPropertyValue("border-after-start")).toBe("4 4");

  const rule6 = Nehan.CssParser.parseRule("*", {
    "border-radius": "1 2 3"
  })[0];
  expect(rule6.getPropertyValue("border-before-start")).toBe("1 1");
  expect(rule6.getPropertyValue("border-before-end")).toBe("2 2");
  expect(rule6.getPropertyValue("border-after-end")).toBe("2 2");
  expect(rule6.getPropertyValue("border-after-start")).toBe("3 3");

  const rule7 = Nehan.CssParser.parseRule("*", {
    "border-radius": "1 2"
  })[0];
  expect(rule7.getPropertyValue("border-before-start")).toBe("1 1");
  expect(rule7.getPropertyValue("border-before-end")).toBe("2 2");
  expect(rule7.getPropertyValue("border-after-end")).toBe("1 1");
  expect(rule7.getPropertyValue("border-after-start")).toBe("2 2");

  const rule8 = Nehan.CssParser.parseRule("*", {
    "border-radius": "1"
  })[0];
  expect(rule8.getPropertyValue("border-before-start")).toBe("1 1");
  expect(rule8.getPropertyValue("border-before-end")).toBe("1 1");
  expect(rule8.getPropertyValue("border-after-end")).toBe("1 1");
  expect(rule8.getPropertyValue("border-after-start")).toBe("1 1");
});
