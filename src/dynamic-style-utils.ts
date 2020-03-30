import {
  DynamicStyleContext,
  DynamicStyleCallback,
  CssDeclarationBlock,
  HtmlElement,
  ILayoutFormatContext,
} from "./public-api";

function getRestExtent(parentContext: any): number {
  // version <= 6
  if (parentContext.region) {
    return parentContext.region.restContextBoxExtent;
  }
  // version >= 7
  return parentContext.restExtent;
}

export class DynamicStyleUtils {
  // page break before if rest extent is smaller than [size].
  static requiredExtent(requiredExtent: number): DynamicStyleCallback {
    return (ctx: DynamicStyleContext): CssDeclarationBlock => {
      if (!ctx.parentContext) {
        return {};
      }
      const restExtent = getRestExtent(ctx.parentContext);
      if (restExtent < requiredExtent) {
        return { "page-break-before": "always" };
      }
      return { "page-break-before": "auto" };
    };
  }

  // 1. calc margin by em, rem relative.
  // 2. clear header margin before if header is displayed block head pos of each page.
  static smartHeader(ctx: DynamicStyleContext): CssDeclarationBlock {
    let parentCtx = ctx.parentContext;
    if (!parentCtx) {
      return {};
    }
    // ver >= 7
    if (parentCtx.cursorPos) {
      const pctx: ILayoutFormatContext = ctx.parentContext;
      const style: CssDeclarationBlock = {
        marginBefore: (2 * ctx.remSize - 0.14285714 * ctx.emSize) + "px",
        marginStart: "0px",
        marginEnd: "0px",
        marginAfter: "1rem"
      };
      if (pctx.cursorPos.before === 0) {
        style.marginBefore = "0px";
      }
      return style;
    }
    // ver <= 6
    const isBlockHead = parentCtx.isBlockHead();
    const style: CssDeclarationBlock = {
      marginBefore: (2 * ctx.remSize - 0.14285714 * ctx.emSize) + "px",
      marginStart: "0px",
      marginEnd: "0px",
      marginAfter: "1rem"
    };
    if (isBlockHead || ctx.element.isFirstChild()) {
      style.marginBefore = "0px";
    }
    if (ctx.element.isLastChild()) {
      style.marginAfter = "0px";
    }
    return style;
  }

  // just set the break point when dynamic style is loaded.
  static breakPoint(ctx: DynamicStyleContext): CssDeclarationBlock {
    debugger;
    return {};
  }

  static replaceContent(fn_replace: (content: string, ctx: DynamicStyleContext) => string):
    (ctx: DynamicStyleContext) => CssDeclarationBlock {
    return (ctx: DynamicStyleContext) => {
      let old_content = ctx.element.textContent;
      let new_content = fn_replace(old_content, ctx);
      let doc = new DOMParser().parseFromString(new_content, "text/html");
      if (!doc.body) {
        return {};
      }
      ctx.element.childNodes = [];
      let children = doc.body.childNodes, root = ctx.element.root;
      for (let i = 0; i < children.length; i++) {
        ctx.element.appendChild(new HtmlElement(children[i], root));
      }
      return {};
    };
  }
}

