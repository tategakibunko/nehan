import {
  Config,
  CssStyleDeclaration,
  CssRule,
  CssProp,
  CssText,
  CssMacro,
  CssMacroValue,
  PropValue,
  SelectorText,
  SelectorParser,
  DynamicStyle,
  DynamicStyleCallback,
  DomCallback,
  DomCallbackValue,
  Font,
  ListStyle,
  LogicalMargin,
  LogicalPadding,
  LogicalBorder,
  LogicalBorderWidth,
  LogicalBorderColor,
  LogicalBorderStyle,
  LogicalBorderRadius,
  TextEmphasis
} from "./public-api";

export type CssValue = string | number | CssMacroValue | DynamicStyleCallback | DomCallbackValue;
export type CssDeclaration = { prop: string, value: CssValue }; // PropValue<string, CssValue>
export type CssDeclarationBlockItem = { [prop: string]: CssValue };
export type CssDeclarationBlock = Partial<CssDeclarationBlockItem>; // allow {} by Partial
export type CssRules = { [selector: string]: CssDeclarationBlock };

/*
  type css_rules = {[selector: string]: css_declr_block}
  and css_declr_block = {[prop: string]: CssValue}
  and css_declr = {prop: string, value: CssValue}
  and css_value = (css_text: string) | css_macro | dynamic_style | dom_callback
  and css_macro = (selector: string) -> css_text

  and dynamic_style = {
    selector: string,
    name: string,
    element: HtmlElement,
    parentContext: FlowContext
  } -> css_declr_block

  and dom_callback = {
    selector:string,
    box:LogicalBox,
    dom:HTMLElement
  } -> unit

  [example]

  let rules = {
    "body":{
      "margin":"1em",
      "!dynamic":(context: DynamicStyleContext) => {
        return {"font-size":"20px"};
      },
      "@oncreate":(context: DomCallbackContext) => {
        context.dom.onclick = () => {
          alert("click!");
        }
      }
    },
    "div.foo":{
      "font-size":"1em",
      // this is macro
      "color":(selector: string) => {
        return "red";
      },
      "margin":"1em 2em"
    }
  }
*/

export class CssParser {
  /*
    "font-size:1em; margin:1em" => [
      {prop:"font-size",     value:"1em"}, // CssDeclaration
      {prop:"margin-before", value:"1em"}, // CssDeclaration
      ...
      {prop:"margin-start",   value:"1em"} // CssDeclaration
    ]
  */
  static parseInlineStyle(inlineStyle: string): CssStyleDeclaration {
    return CssText.normalize(inlineStyle).split(";").reduce((acm, stext) => {
      const nvs = stext.split(":");
      if (nvs.length === 2 && nvs[0] !== "" && nvs[1] !== "") {
        const cssProp = new CssProp(nvs[0]);
        if (Config.IgnoredInlineStyleProps.indexOf(cssProp.value) >= 0) {
          return acm;
        }
        const cssText = new CssText({ prop: cssProp.value, value: nvs[1] });
        CssParser.parseDeclaration(cssProp, cssText).forEach((declr) => {
          acm.setProperty(declr.prop, declr.value);
        });
      }
      return acm;
    }, new CssStyleDeclaration());
  }

  /*
    notice that selector can be many if separated by comma.

    "selector1, selector2" -> [
      CssRule(selector1, CssStyleDeclaration(("font-size", ..)),
      CssRule(selector2, CssStyleDeclaration(("font-size", ..))
    ]
  */
  static parseRule(selectorSrc: string, declrBlock: CssDeclarationBlock): CssRule[] {
    return new SelectorText(selectorSrc).split().map((stext) => {
      let selector = SelectorParser.parse(stext);
      let declrs = this.parseDeclarationBlock(stext, declrBlock);
      return new CssRule(selector, declrs);
    });
  }

  /*
  // declaration block: CssStyleDeclaration
  {
    "font-size":"1em", // declaration
    "color":"red", // declaration
    "width":(selector) => { return "100px" }, // declaration (as macro)
    "!dynamic":(ctx) => { // dynamic style
      return {"font-weight":"bold"}
    },
    "@oncreate":(ctx) => { // callback for dom creation
      ctx.dom.onclick = (e) => { console.log("onclick:" + selector) }
    }
  } 
  */
  static parseDeclarationBlock(selector: string, declrBlock: CssDeclarationBlock): CssStyleDeclaration {
    return Object.keys(declrBlock).reduce((acm, prop) => {
      let objValue = declrBlock[prop];
      let cssProp = new CssProp(prop);

      // [example]
      // "color":"red"
      if (typeof objValue === "string") {
        return acm.setProperty(cssProp.value, objValue);
      }
      // [example]
      // "line-height":1.6
      if (typeof objValue === "number") {
        return acm.setProperty(cssProp.value, String(objValue));
      }
      if (typeof objValue === "function") { // macro or dynamic style.
        // [example]
        // "!dynamic": function(ctx) => { ... }
        if (cssProp.isDynamicStyleProp()) {
          let name = cssProp.getDynamicStylePropName();
          let callback = objValue as DynamicStyleCallback;
          return acm.addDynamicStyle(new DynamicStyle(selector, name, callback));
        }
        // [example]
        // "@oncreate": function(ctx) => { ... }
        if (cssProp.isDomCallback()) {
          let name = cssProp.getDomCallbackName();
          let callback = objValue as DomCallbackValue;
          return acm.addDomCallback(new DomCallback(selector, name, callback));
        }
        // [example]
        // "font-size": function(ctx) => { return "1.5em" }
        // If macro, just call and set.
        let macro = new CssMacro(objValue as CssMacroValue);
        let macroValue = macro.call(selector);
        if (macroValue !== "") {
          let cssText = new CssText({ prop: cssProp.value, value: macroValue });
          return acm.setProperty(cssProp.value, cssText.value);
        }
      }
      return acm;
    }, new CssStyleDeclaration());
  }

  /*
    [example]

    notice that shorthaned css-prop makes many properties.

    let css_prop = new CssProp("font");
    let css_text = new CssText("italic small-caps bold 1em/1.5 serif");
    Nehan.CssParser.parseDeclaration(css_prop, css_text);

    // this process is called 'Reification' in css.
    => [
      {prop:"font-style",   value:"italic"},
      {prop:"font-variant", value:"small-caps"},
      {prop:"font-weight",  value:"bold"},
      {prop:"font-size",    value:"1em"},
      {prop:"line-height",  value:"1.5"},
      {prop:"font-family",  value:"serif"}
    ]
  */
  static parseDeclaration(cssProp: CssProp, cssText: CssText): PropValue<string, string>[] {
    switch (cssProp.value) {
      case "border":
        return LogicalBorder.parseShorthand(cssText);
      case "border-before":
        return LogicalBorder.parseShorthandEach(cssText, "before");
      case "border-end":
        return LogicalBorder.parseShorthandEach(cssText, "end");
      case "border-after":
        return LogicalBorder.parseShorthandEach(cssText, "after");
      case "border-start":
        return LogicalBorder.parseShorthandEach(cssText, "start");
      case "border-radius":
        return LogicalBorderRadius.parseShorthand(cssText);
      case "font":
        return Font.parseShorthand(cssText);
      case "list-style":
        return ListStyle.parseShorthand(cssText);
      case "margin":
        return LogicalMargin.parseShorthand(cssText);
      case "padding":
        return LogicalPadding.parseShorthand(cssText);
      case "border-width":
        return LogicalBorderWidth.parseShorthand(cssText);
      case "border-color":
        return LogicalBorderColor.parseShorthand(cssText);
      case "border-style":
        return LogicalBorderStyle.parseShorthand(cssText);
      case "text-emphasis":
        return TextEmphasis.parseShorthand(cssText);
    }
    return [{
      prop: cssProp.value,
      value: cssText.value
    }];
  }
}
