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
  static parseInlineStyle(inline_style: string): CssStyleDeclaration {
    return CssText.normalize(inline_style).split(";").reduce((acm, stext) => {
      let nvs = stext.split(":");
      if (nvs.length === 2 && nvs[0] !== "" && nvs[1] !== "") {
        let css_prop = new CssProp(nvs[0]);
        if (Config.IgnoredInlineStyleProps.indexOf(css_prop.value) >= 0) {
          return acm;
        }
        let css_text = new CssText({ prop: css_prop.value, value: nvs[1] });
        CssParser.parseDeclaration(css_prop, css_text).forEach((declr) => {
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
  static parseRule(selector_src: string, declr_block: CssDeclarationBlock): CssRule[] {
    return new SelectorText(selector_src).split().map((stext) => {
      let selector = SelectorParser.parse(stext);
      let declrs = this.parseDeclarationBlock(stext, declr_block);
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
  static parseDeclarationBlock(selector: string, declr_block: CssDeclarationBlock):
    CssStyleDeclaration {
    return Object.keys(declr_block).reduce((acm, prop) => {
      let obj_value = declr_block[prop];
      let css_prop = new CssProp(prop);

      // [example]
      // "color":"red"
      if (typeof obj_value === "string") {
        return acm.setProperty(css_prop.value, obj_value);
      }
      // [example]
      // "line-height":1.6
      if (typeof obj_value === "number") {
        return acm.setProperty(css_prop.value, String(obj_value));
      }
      if (typeof obj_value === "function") { // macro or dynamic style.
        // [example]
        // "!dynamic": function(ctx) => { ... }
        if (css_prop.isDynamicStyleProp()) {
          let name = css_prop.getDynamicStylePropName();
          let callback = obj_value as DynamicStyleCallback;
          return acm.addDynamicStyle(new DynamicStyle(selector, name, callback));
        }
        // [example]
        // "@oncreate": function(ctx) => { ... }
        if (css_prop.isDomCallback()) {
          let name = css_prop.getDomCallbackName();
          let callback = obj_value as DomCallbackValue;
          return acm.addDomCallback(new DomCallback(selector, name, callback));
        }
        // [example]
        // "font-size": function(ctx) => { return "1.5em" }
        // If macro, just call and set.
        let macro = new CssMacro(obj_value as CssMacroValue);
        let macro_value = macro.call(selector);
        if (macro_value !== "") {
          let css_text = new CssText({ prop: css_prop.value, value: macro_value });
          return acm.setProperty(css_prop.value, css_text.value);
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
  static parseDeclaration(css_prop: CssProp, css_text: CssText): PropValue<string, string>[] {
    switch (css_prop.value) {
      case "border":
        return LogicalBorder.parseShorthand(css_text);
      case "border-before":
        return LogicalBorder.parseShorthandEach(css_text, "before");
      case "border-end":
        return LogicalBorder.parseShorthandEach(css_text, "end");
      case "border-after":
        return LogicalBorder.parseShorthandEach(css_text, "after");
      case "border-start":
        return LogicalBorder.parseShorthandEach(css_text, "start");
      case "border-radius":
        return LogicalBorderRadius.parseShorthand(css_text);
      case "font":
        return Font.parseShorthand(css_text);
      case "list-style":
        return ListStyle.parseShorthand(css_text);
      case "margin":
        return LogicalMargin.parseShorthand(css_text);
      case "padding":
        return LogicalPadding.parseShorthand(css_text);
      case "border-width":
        return LogicalBorderWidth.parseShorthand(css_text);
      case "border-color":
        return LogicalBorderColor.parseShorthand(css_text);
      case "border-style":
        return LogicalBorderStyle.parseShorthand(css_text);
      case "text-emphasis":
        return TextEmphasis.parseShorthand(css_text);
    }
    return [{
      prop: css_prop.value,
      value: css_text.value
    }];
  }
}
