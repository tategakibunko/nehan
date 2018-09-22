import * as Nehan from "nehan";

export let create = (html:string, opt?: any): Nehan.PageReader => {
  opt = opt || {
    writingMode:"horizontal-tb",
    measure:"640px",
    extent:"480px",
  };
  return new Nehan.HtmlDocument(html, {
    styleSheets:[
      Nehan.SemanticStyle.create({all:true}), // Apply pre-defined utility styles
      new Nehan.CssStyleSheet({
	"body":{
	  backgroundColor:"#eaeaea",
	  writingMode:opt.writingMode,
	  padding:"1em",
	  measure:opt.measure,
	  extent:opt.extent
	},
	// To remove unnecessary margin-before from header,
	// we use smart-header defined in dynamic-style-utils.ts.
	"h1":{
	  "!dynamic":Nehan.DynamicStyleUtils.smartHeader
	},
	"h2":{
	  "!dynamic":Nehan.DynamicStyleUtils.smartHeader
	},
	"thead":{
	  "background":"wheat"
	},
	"tbody":{
	  "background":"white"
	},
	"td":{
	  "padding":"0.5em"
	},
	"th":{
	  "padding":"0.5em"
	}
      })
    ]
  }).createPageReader();
};
