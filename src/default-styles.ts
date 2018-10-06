import {
  Config,
  CssRules,
  DynamicStyleContext
} from "./public-api";

// https://www.w3.org/TR/CSS2/sample.html
export let DefaultStyles: CssRules = {
  "*[dir=ltr]":{
    "direction":"ltr",
    "unicode-bidi":"embed"
  },
  "*[dir=rtl]":{
    "direction":"rtl",
    "unicode-bidi":"embed"
  },
  "a":{
    "display":"inherit"
  },
  "abbr":{
  },
  "address":{
    "display":"block",
    "font-style":"italic"
  },
  "area":{
    "display":"none"
  },
  "article":{
    "display":"block"
  },
  "aside":{
    "display":"block"
  },
  "b":{
    "display":"inline",
    "font-weight":"bold"
  },
  "base":{
  },
  /* deprecated
     "basefont":{
     },*/
  "bdi":{
  },
  "bdo":{
    "display":"inline",
    "unicode-bidi":"bidi-override"
  },
  "bdo[dir=ltr]":{
    "direction":"ltr",
    "unicode-bidi":"bidi-override"
  },
  "bdo[dir=rtl]":{
    "direction":"rtl",
    "unicode-bidi":"bidi-override"
  },
  /* deprecated
     "big":{
     "display":"inline",
     "font-size":"1.17em"
     },*/
  "blockquote":{
    "display":"block",
    "margin":"1.12em 40px"
  },
  "body":{
    "display":"block",
    "text-align":"justify",
    "font-size":"16px",
    "overflow-wrap":"break-word",
    "measure":Config.defaultBodyMeasure + "px",
    "extent":Config.defaultBodyExtent + "px",
    "margin":"0"
  },
  "br":{
    "display":"inline"
  },
  "br::before":{
    "content":"\A",
    "white-space":"pre-line"
  },
  "button":{
  },
  "canvas":{
  },
  "caption":{
    "display":"table-caption",
    "text-align":"center"
  },
  /* deprecated
     "center":{
     "display":"block",
     "unicode-bidi":"embed",
     "text-align":"center"
     },*/
  "cite":{
    "display":"inline",
    "font-style":"italic"
  },
  "code":{
    "display":"inline",
    "font-family":"monospace"
  },
  "col":{
    "display":"table-column"
  },
  "colgroup":{
    "display":"table-column-group"
  },
  "datalist":{
    "display":"none"
  },
  "dd":{
    "display":"block",
    "margin-start":"40px"
  },
  "del":{
    "text-decoration":"line-through"
  },
  "details":{
    "display":"block"
  },
  "dfn":{
    "display":"inline",
    "font-style":"italic"
  },
  "dialog":{
  },
  /* deprecated
     "dir":{
     "display":"block",
     "unicode-bidi":"embed"
     },*/
  "div":{
    "display":"block"
  },
  "dl":{
    "display":"block",
    "unicode-bidi":"embed",
    "margin":"1em 0"
  },
  "dt":{
    "display":"block",
    "unicode-bidi":"embed"
  },
  "em":{
    "display":"inline",
    "font-style":"italic"
  },
  "fieldset":{
    "display":"block",
    "unicode-bidi":"embed",
    "margin":"0 2px",
    "padding":"0.35em 0.75em 0.625em",
    "border":"2px solid #ccc" // nehan.js original
  },
  "figcaption":{
    "display":"block"
  },
  "figure":{
    "display":"block",
    "margin":"1em 40px"
  },
  /* deprecated
     "font":{
     "display":"inline"
     },*/
  "footer":{
    "display":"block"
  },
  "form":{
    "display":"none",
    "unicode-bidi":"embed",
    "margin-before":"0"
  },
  /* deprecated
     "frame":{
     "display":"block",
     "unicode-bidi":"embed"
     },*/
  /* deprecated
     "frameset":{
     "display":"block",
     "unicode-bidi":"embed"
     },*/
  "h1":{
    "display":"block",
    "text-align":"start",
    "unicode-bidi":"embed",
    "font-size":"2em",
    "font-weight":"bold",
    "margin":".67em 0"
  },
  "h2":{
    "display":"block",
    "text-align":"start",
    "unicode-bidi":"embed",
    "font-size":"1.5em",
    "font-weight":"bold",
    "margin":"0.75em 0"
  },
  "h3":{
    "display":"block",
    "text-align":"start",
    "unicode-bidi":"embed",
    "font-size":"1.17em",
    "font-weight":"bold",
    "margin":".83em 0"
  },
  "h4":{
    "display":"block",
    "text-align":"start",
    "unicode-bidi":"embed",
    "font-weight":"bold",
    "margin":"1.12em 0"
  },
  "h5":{
    "display":"block",
    "text-align":"start",
    "unicode-bidi":"embed",
    "font-size":".83em",
    "font-weight":"bold",
    "margin":"1.5em 0"
  },
  "h6":{
    "display":"block",
    "text-align":"start",
    "unicode-bidi":"embed",
    "font-size":".75em",
    "font-weight":"bold",
    "margin":"1.67em 0"
  },
  "head":{
    "display":"none"
  },
  "header":{
    "display":"block"
  },
  "hr":{
    "display":"block",
    "unicode-bidi":"embed",
    "margin":"0.5em auto",
    "border-after-width":"1px",
    "border-after-style":"inset",
  },
  "html":{
    "display":"block"
  },
  "i":{
    "display":"inline",
    "font-style":"italic"
  },
  "iframe":{
    "display":"none"
  },
  "img":{
    "display":"inline"
  },
  "input":{
    "display":"none" // not supported yet
  },
  "ins":{
    "text-decoration":"underline"
  },
  "kbd":{
    "display":"inline",
    "font-family":"monospace"
  },
  "label":{
    "display":"inline",
    "cursor":"default"
  },
  "legend":{
    "display":"block",
    "padding-start":"2px",
    "padding-end":"2px",
    "border":"none"
  },
  "li":{
    "display":"list-item"
  },
  "li::marker":{
    "margin-end":"0.5em",
    "!dynamic":(context: DynamicStyleContext) => {
      let parent_ctx = context.parentContext;
      if(!parent_ctx){
	return {};
      }
      let parent_env = parent_ctx.env;
      let element = context.element;
      if(!element.parent){
	return {};
      }
      let content = parent_env.content;
      let writing_mode = parent_env.writingMode;
      let list_style = parent_env.listStyle;
      let is_vert = writing_mode.isTextVertical();

      // if content is defined, replace old marker content with it.
      if(content.value && element.firstChild){
	let content_text_node = element.root.createTextNode(content.value);
	element.replaceChild(content_text_node, element.firstChild);
      }
      let text_combine_upright = (is_vert && list_style.isTcyMarker())? "all": "none";
      return {
	"display":"inline",
	"text-combine-upright":text_combine_upright
      };
    }
  },
  "link":{
    "display":"none"
  },
  "main":{
    "display":"block"
  },
  "map":{
    "display":"inline"
  },
  "mark":{
    "background-color":"yellow",
    "color":"black"
  },
  "menu":{
    "display":"block",
    "unicode-bidi":"embed",
    "list-style-type":"disc",
    "margin":"1.12em 0",
    "padding-start":"40px"
  },
  "menuitem":{
  },
  "meta":{
    "display":"none"
  },
  "meter":{
  },
  "nav":{
    "display":"block"
  },
  "noscript":{
    "display":"none"
  },
  /* deprecated
     "noframes":{
     "display":"none",
     },
  */
  "object":{
  },
  "ol":{
    "display":"block",
    "unicode-bidi":"embed",
    "list-style-type":"decimal",
    "margin":"1em 0",
    "padding-start":"1em"
  },
  "ol ul, ul ol, ul ul, ol ol":{
    "margin-before":"0",
    "margin-after":"0"
  },
  "optgroup":{
  },
  "option":{
  },
  "output":{
    "display":"inline"
  },
  "p":{
    "display":"block",
    "unicode-bidi":"embed",
    "margin":"1.12em 0"
  },
  "param":{
    "display":"none"
  },
  "picture":{
  },
  "pre":{
    "display":"block",
    "unicode-bidi":"embed",
    "white-space":"pre",
    "margin":"1em 0"
  },
  "progress":{
  },
  "q":{
    "display":"inline"
  },
  "q::before":{
    "content":"open-quote"
  },
  "q::after":{
    "content":"close-quote"
  },
  "rb":{
    "display":"ruby-base",
    "white-space":"nowrap",
    "line-height":"1"
  },
  "rbc":{
    "display":"ruby-base-container"
  },
  "rp":{
    "display":"none"
  },
  "rt":{
    "display":"ruby-text",
    "font-size":"0.5em",
    "line-height":"1"
  },
  "rtc":{
    "display":"ruby-text-container"
  },
  "ruby":{
    "display":"ruby"
  },
  /* deprecated
     "s":{
     "display":"inline",
     "text-decoration":"line-through"
     },
  */
  "samp":{
    "display":"inline",
    "font-family":"monospace"
  },
  "script":{
    "display":"none"
  },
  "section":{
    "display":"block"
  },
  "select":{
    "display":"inline"
  },
  "small":{
    "display":"inline",
    "font-size":"smaller"
  },
  "source":{
  },
  "span":{
    "display":"inline"
  },
  /* deprecated
     "strike":{ 
     "display":"inline",
     "text-decoration":"line-through"
     },
  */
  "strong":{
    "display":"inline",
    "font-weight":"bold"
  },
  "style":{
    "display":"none"
  },
  "sub":{
    "display":"inline",
    "vertical-align":"sub",
    "font-size":"smaller"
  },
  "summary":{
    "display":"block"
  },
  "sup":{
    "display":"inline",
    "vertical-align":"super",
    "font-size":"smaller"
  },
  "svg":{
    "display":"none" // not supported yet.
  },
  "table":{
    "display":"table",
    "border-collapse":"collapse", // 'separate' is not supported yet.
    "border-spacing":"2px",
    "border-color":Config.defaultBorderColor,
    "border-width":"1px",
    "border-style":"solid",
    "margin-after":"1em",
  },
  "tbody":{
    "display":"table-row-group",
    "vertical-align":"middle",
    "border-color":"inherit",
    "border-width":"1px",
    "border-style":"solid",
  },
  "td":{
    "display":"table-cell",
    "vertical-align":"inherit",
    "border-width":"1px",
    "border-style":"solid",
  },
  "template":{
  },
  "textarea":{
    "display":"inline"
  },
  "tfoot":{
    "display":"table-footer-group",
    "vertical-align":"middle",
    "border-color":"inherit",
    "border-width":"1px",
    "border-style":"solid",
  },
  "th":{
    "display":"table-cell",
    "vertical-align":"inherit",
    "font-weight":"bold",
    "text-align":"center",
    "border-width":"1px",
    "border-style":"solid",
  },
  "thead":{
    "display":"table-header-group",
    "vertical-align":"middle",
    "border-color":"inherit",
    "border-width":"1px",
    "border-style":"solid",
  },
  "time":{
  },
  "title":{
    "display":"none"
  },
  "tr":{
    "display":"table-row",
    "vertical-align":"middle",
    "border-color":"inherit",
    "border-width":"1px",
    "border-style":"solid",
  },
  "track":{
  },
  /* deprecated
     "tt":{
     "display":"none"
     },
  */
  /* deprecated
     "u":{
     "display":"inline",
     "text-decoration":"underline"
     },
  */
  "ul":{
    "display":"block",
    "unicode-bidi":"embed",
    "list-style-type":"disc",
    "margin":"1em 0",
    "padding-start":"1em"
  },
  "var":{
    "display":"inline",
    "font-style":"italic"
  },
  "video":{
  },
  "wbr":{
  },
  "::first-line":{
    "display":"block"
  }
}; // DefaultStyles

export class DefaultStyle {
  static get(tag_name: string, prop: string): string {
    let entry = DefaultStyles[tag_name];
    return entry[prop] as string;
  }
}
