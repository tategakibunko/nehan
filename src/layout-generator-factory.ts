import {
  LayoutGenerator,
  LayoutSection,
  Image,
  LogicalSize,
  LogicalFloat,
  LogicalClear,
  PseudoElement,
  PageBreakAfter,
  PageBreakBefore,
  ReplacedElement,
  Content,
  Config,
  Display,
  WhiteSpace,
  CssLoader,
  HtmlElement,
  LayoutControl,
  FlowContext,
  FlowRootContext,
  FlowGenerator,
  TextContext,
  TextGenerator,
  ControlContext,
  ConstantGenerator,
  HrContext,
  RubyGenerator,
  RubyContext,
  FirstLineContext,
  TableContext,
  TableRowGroupContext,
  TableRowGroupGenerator,
  TableRowContext,
  TableRowGenerator,
  TableCellContext,
  TableCellGenerator,
  ListItemContext,
  EmptyBoxContext,
  ReplacedElementGenerator,
  ImageContext
} from "./public-api";

/*
  <div>
    <span>
      text1
      <p>foo</p>
      text2
    </span>
  </div>

  =>

  <div>
    <span>text1</span>
    <p>foo</p>
    <span>text2</span>
  </div>
*/
function splitInlineBreak(element: HtmlElement): HtmlElement {
  element.childNodes.forEach((child, index) => {
    if (Display.load(child).isBlockLevel() && element.parent) {
      // console.log('split inline break!');
      const next = element.nextSibling;
      const headChildren = element.childNodes.slice(0, index);
      const restChildren = element.childNodes.slice(index + 1);
      element.childNodes = headChildren;
      headChildren[headChildren.length - 1].nextSibling = null;
      // console.log('%s is sweep out to parent element(%s)!', child.tagName, element.parent.tagName);
      element.parent.insertBefore(child, next);
      let restNode = element.clone();
      restChildren.forEach(child => restNode.appendChild(child));
      // console.log('clone node(%s) with children count = %d', restNode.tagName, restNode.childNodes.length);
      restNode = splitInlineBreak(restNode);
      element.parent.insertBefore(restNode, next);
    }
  });
  return element;
}

export class LayoutGeneratorFactory {
  static createGenerator(parent_ctx: FlowContext, element: HtmlElement): LayoutGenerator {
    if (element.isTextElement()) {
      // white space element
      if (element.isOnlyChild() && WhiteSpace.isWhiteSpaceElement(element)) {
        if (Config.debugLayout) {
          console.log("empty box:[%s], white-space only", element.toString());
        }
        return this.createEmptyBoxGenerator(parent_ctx, element);
      }
      return new TextGenerator(new TextContext(element, parent_ctx));
    }
    if (element.tagName === "br") {
      let line_break = LayoutControl.createLineBreak();
      return new ConstantGenerator(new ControlContext(element, parent_ctx, line_break));
    }
    // CssLoader.load(element, parent_ctx);
    CssLoader.loadDynamic(element, parent_ctx);
    let display = Display.load(element);
    if (display.isInlineLevel()) {
      element = splitInlineBreak(element);
    }
    if (display.isNone()) {
      if (Config.debugLayout) {
        console.log("[%s] empty box(display:none)", element.toString());
      }
      return this.createEmptyBoxGenerator(parent_ctx, element);
    }
    if (display.isFlowRuby()) {
      return new RubyGenerator(new RubyContext(element, parent_ctx));
    }
    if (display.isRubyBase() || display.isRubyText()) {
      return new FlowGenerator(new FlowContext(element, parent_ctx));
    }
    let fixed_size = LogicalSize.load(element);
    if (fixed_size && fixed_size.isZero()) {
      if (Config.debugLayout) {
        console.log("[%s] empty box(zero size)", element.toString());
      }
      return this.createEmptyBoxGenerator(parent_ctx, element);
    }
    let float = LogicalFloat.load(element);
    if (float.isNone()) {
      parent_ctx.setRegionMarginAuto(element);
    }
    let page_break_after = PageBreakAfter.load(element);
    if (page_break_after.isAlways()) {
      let break_element = this.createPageBreakAfterElement(element);
      parent_ctx.element.insertBefore(break_element, element.nextSibling);
    }
    let page_break_before = PageBreakBefore.load(element);
    if (page_break_before.isAlways()) {
      return this.createPageBreakBeforeGenerator(parent_ctx, element);
    }
    let clear = LogicalClear.load(element);
    if (!clear.isNone() && parent_ctx.isFloatClient()) {
      parent_ctx.clearRegionFloat(clear);
    }
    // element of empty content except text or replaced-element.
    if (ReplacedElement.isReplacedElement(element) === false &&
      element.tagName !== "hr" &&
      element.firstChild === null &&
      Content.load(element).isEmpty()) {
      if (Config.debugLayout) {
        console.log("empty box:[%s], empty element", element.toString());
      }
      return this.createEmptyBoxGenerator(parent_ctx, element);
    }
    if (PseudoElement.isFirstLine(element)) {
      return new FlowGenerator(new FirstLineContext(element, parent_ctx));
    }
    switch (element.tagName) {
      case "hr":
        return new ConstantGenerator(new HrContext(element, parent_ctx));
      case "img":
        return this.createImageGenerator(parent_ctx, element);
    }
    if (display.isListItem()) {
      if (parent_ctx.isListItem() === false) {
        PseudoElement.addMarker(element);
      }
      return new FlowGenerator(new ListItemContext(element, parent_ctx));
    }
    if (display.isTable()) {
      return new FlowGenerator(new TableContext(element, parent_ctx));
    }
    if (display.isTableRowGroup()) {
      return new TableRowGroupGenerator(new TableRowGroupContext(element, parent_ctx));
    }
    if (display.isTableRow()) {
      return new TableRowGenerator(new TableRowContext(element, parent_ctx));
    }
    // td(flow-root)
    if (display.isTableCell()) {
      return new TableCellGenerator(new TableCellContext(element, parent_ctx));
    }
    // blockquote, fieldset, figure
    if (display.isFlowRoot() || LayoutSection.isSectioningRootElement(element)) {
      return new FlowGenerator(new FlowRootContext(element, parent_ctx));
    }
    if (display.isFlow()) {
      return new FlowGenerator(new FlowContext(element, parent_ctx));
    }
    console.warn("[%s] display(%o) is not supported yet:", parent_ctx.name, display, element);
    return new FlowGenerator(new FlowContext(element, parent_ctx));
  }

  static createEmptyBoxGenerator(parent_ctx: FlowContext, element: HtmlElement):
    ConstantGenerator {
    let context = new EmptyBoxContext(element, parent_ctx);
    return new ConstantGenerator(context);
  }

  static createPageBreakAfterElement(element: HtmlElement): HtmlElement {
    let hr = element.root.createElement("hr");
    hr.className = "page break before";
    return hr;
  }

  static createPageBreakBeforeElement(element: HtmlElement): HtmlElement {
    let hr = element.root.createElement("hr");
    hr.setAttribute("style", "display:none");
    if (element.parent) {
      element.parent.insertBefore(hr, element);
    }
    if (Config.debugLayout) {
      console.log("inserted dynamic page-break before [%s]", element.toString());
    }
    return hr;
  }

  static createPageBreakBeforeGenerator(parent_ctx: FlowContext, element: HtmlElement):
    ConstantGenerator {
    let page_break = LayoutControl.createPageBreak();
    let break_element = this.createPageBreakBeforeElement(element);
    let context = new ControlContext(break_element, parent_ctx, page_break);
    // page is already broken, so remove.
    element.computedStyle.setProperty("page-break-before", "auto");
    return new ConstantGenerator(context);
  }

  static createImageGenerator(parent_ctx: FlowContext, element: HtmlElement): LayoutGenerator {
    let alt_text = element.getAttribute("alt") || "";
    if (Image.exists(element) === false && alt_text !== "") {
      let alt_text_node = element.root.createTextNode(alt_text);
      element.appendChild(alt_text_node);
      return new TextGenerator(new TextContext(alt_text_node, parent_ctx));
    }
    return new ReplacedElementGenerator(new ImageContext(element, parent_ctx));
  }
}
