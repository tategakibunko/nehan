import {
  DynamicStyleContext,
  DynamicStyleCallback,
  CssDeclarationBlock,
  HtmlElement,
  ILayoutFormatContext,
  FlowFormatContext,
  WhiteSpace,
  ReplacedElement,
  PhysicalSize,
} from "./public-api";

export class DynamicStyleUtils {
  // page break before if rest extent is smaller than [size].
  static requiredExtent(requiredExtent: number): DynamicStyleCallback {
    return (ctx: DynamicStyleContext): CssDeclarationBlock => {
      if (!ctx.parentContext) {
        return {};
      }
      if (ctx.parentContext.restExtent < requiredExtent) {
        return { "page-break-before": "always" };
      }
      return { "page-break-before": "auto" };
    };
  }

  // 1. calc margin by em, rem relative.
  // 2. clear header margin before if header is displayed block head pos of each page.
  static smartHeader(ctx: DynamicStyleContext): CssDeclarationBlock {
    let parentCtx: ILayoutFormatContext | undefined = ctx.parentContext;
    if (parentCtx instanceof FlowFormatContext && parentCtx.env.display.isInlineLevel()) {
      parentCtx = parentCtx.parentBlock;
    }
    if (!parentCtx) {
      return {};
    }
    const marginBefore = 2 * ctx.remSize - 0.14285714 * ctx.emSize;
    const style: CssDeclarationBlock = {
      marginBefore: marginBefore + "px",
      marginStart: "0px",
      marginEnd: "0px",
      marginAfter: "1rem"
    };
    // if it's first header block or margin-before will cause page-break, set margin-before to zero.
    if (parentCtx.globalPos.before === 0 || parentCtx.restExtent < marginBefore) {
      style.marginBefore = "0px";
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

