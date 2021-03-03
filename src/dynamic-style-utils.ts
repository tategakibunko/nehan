import {
  DynamicStyleContext,
  DynamicStyleCallback,
  CssDeclarationBlock,
  NehanElement,
  ILayoutFormatContext,
  FlowFormatContext,
  ReplacedElement,
  PhysicalSize,
  LogicalBoxEdge,
  WritingMode,
} from "./public-api";

function getAtomExtent(atomElement: NehanElement, lineExtent: number, writingMode: WritingMode): number {
  if (atomElement.isTextElement()) {
    return lineExtent;
  }
  if (ReplacedElement.isReplacedElement(atomElement)) {
    return PhysicalSize.load(atomElement).getLogicalSize(writingMode).extent;
  }
  return 0; // never
}

export class DynamicStyleUtils {
  // page break before if rest extent is smaller than [size].
  static requiredExtent(requiredExtent: number): DynamicStyleCallback {
    return (ctx: DynamicStyleContext): CssDeclarationBlock | undefined => {
      if (!ctx.parentContext) {
        return undefined;
      }
      if (ctx.parentContext.restExtent < requiredExtent) {
        return { "page-break-before": "always" };
      }
      return { "page-break-before": "auto" };
    };
  }

  // 1. calc margin by em, rem relative.
  // 2. clear header margin before if header is displayed block head pos of each page.
  static smartHeader(ctx: DynamicStyleContext): CssDeclarationBlock | undefined {
    let parentCtx: ILayoutFormatContext | undefined = ctx.parentContext;
    if (parentCtx instanceof FlowFormatContext && parentCtx.env.display.isInlineLevel()) {
      parentCtx = parentCtx.parentBlock;
    }
    if (!parentCtx) {
      return undefined;
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

  // Break page before if
  //   1. border-before-width is not zero
  //   2. restExtent < (firstAtomElement.extent + border-width-before + padding-before)
  // where firstAtomElement is
  //   1. text-element that does not consist of only whitespace.
  //   2. replaced-element with some extent > 0.
  // This style prevents element from being created that consists only of border-before.
  static smartBorderBreak(ctx: DynamicStyleContext): CssDeclarationBlock | undefined {
    const edge = LogicalBoxEdge.load(ctx.element);
    if (edge.border.width.before <= 0) {
      return undefined;
    }
    if (!ctx.parentContext) {
      return undefined;
    }
    const firstAtomElement = ctx.element.firstAtomChild;
    if (!firstAtomElement) {
      return undefined;
    }
    const restExtent = ctx.parentContext.restExtent;
    const lineExtent = ctx.parentContext.env.font.lineExtent;
    const writingMode = ctx.parentContext.env.writingMode;
    const minExtent = getAtomExtent(firstAtomElement, lineExtent, writingMode) + edge.before;
    if (restExtent < minExtent) {
      return { "page-break-before": "always" };
    }
    return undefined;
  }

  // just set the break point when dynamic style is loaded.
  static breakPoint(ctx: DynamicStyleContext): CssDeclarationBlock | undefined {
    debugger;
    return undefined;
  }

  static replaceContent(fn_replace: (content: string, ctx: DynamicStyleContext) => string):
    (ctx: DynamicStyleContext) => CssDeclarationBlock | undefined {
    return (ctx: DynamicStyleContext) => {
      let old_content = ctx.element.textContent;
      let new_content = fn_replace(old_content, ctx);
      let doc = new DOMParser().parseFromString(new_content, "text/html");
      if (!doc.body) {
        return undefined;
      }
      ctx.element.childNodes = [];
      let children = doc.body.childNodes, root = ctx.element.root;
      for (let i = 0; i < children.length; i++) {
        ctx.element.appendChild(new NehanElement(children[i], root));
      }
      return undefined;
    };
  }
}

