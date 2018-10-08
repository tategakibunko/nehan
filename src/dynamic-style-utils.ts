import {
  DynamicStyleContext,
  DynamicStyleCallback,
  CssDeclarationBlock
} from "./public-api";

export class DynamicStyleUtils {
  // page break before if rest extent is smaller than [size].
  static requiredExtent(required_extent: number): DynamicStyleCallback {
    return (ctx: DynamicStyleContext): CssDeclarationBlock => {
      if(!ctx.parentContext){
	return {};
      }
      let rest_extent = ctx.parentContext.region.restContextBoxExtent;
      if(rest_extent < required_extent){
	return {"page-break-before":"always"};
      }
      return {"page-break-before":"auto"};
    };
  }

  // 1. calc margin by em, rem relative.
  // 2. clear header margin before if header is displayed block head pos of each page.
  static smartHeader(ctx: DynamicStyleContext): CssDeclarationBlock {
    let parent_ctx = ctx.parentContext;
    if(!parent_ctx){
      return {};
    }
    let is_block_head = parent_ctx.isBlockHead();
    let style: CssDeclarationBlock = {
      marginBefore:(2 * ctx.remSize - 0.14285714 * ctx.emSize) + "px",
      marginStart:"0px",
      marginEnd:"0px",
      marginAfter:"1rem"
    };
    if(is_block_head || ctx.element.isFirstChild()){
      style.marginBefore = "0px";
    }
    if(ctx.element.isLastChild()){
      style.marginAfter = "0px";
    }
    return style;
  }

  // just set the break point when dynamic style is loaded.
  static breakPoint(ctx: DynamicStyleContext): CssDeclarationBlock {
    debugger;
    return {};
  }
}

