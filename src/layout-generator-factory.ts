import {
  LayoutGenerator,
  LayoutSection,
  Image,
  LogicalSize,
  LogicalFloat,
  LogicalClear,
  PseudoElement,
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

export class LayoutGeneratorFactory {
  static createGenerator(parent_ctx: FlowContext, element: HtmlElement): LayoutGenerator {
    CssLoader.load(element, parent_ctx);
    let display = Display.load(element);
    if(display.isNone()){
      if(Config.debugLayout){
	console.log("[%s] empty box(display:none)", element.toString());
      }
      return this.createEmptyBoxGenerator(parent_ctx, element);
    }
    let fixed_size = LogicalSize.load(element);
    if(fixed_size && fixed_size.isZero()){
      if(Config.debugLayout){
	console.log("[%s] empty box(zero size)", element.toString());
      }
      return this.createEmptyBoxGenerator(parent_ctx, element);
    }
    let float = LogicalFloat.load(element);
    if(float.isNone()){
      parent_ctx.setRegionMarginAuto(element);
    }
    let page_break_before = PageBreakBefore.load(element);
    if(page_break_before.isAlways() && parent_ctx.isNotPageBroken()){
      return this.createPageBreakBeforeGenerator(parent_ctx, element);
    }
    let clear = LogicalClear.load(element);
    if(!clear.isNone() && parent_ctx.isFloatClient()){
      parent_ctx.clearRegionFloat(clear);
    }
    // element of empty content except text or replaced-element.
    if(element.isTextElement() === false &&
       ReplacedElement.isReplacedElement(element) === false &&
       element.tagName !== "hr" &&
       element.firstChild === null &&
       Content.load(element).isEmpty()){
      if(Config.debugLayout){
	console.log("empty box:[%s], empty element", element.toString());
      }
      return this.createEmptyBoxGenerator(parent_ctx, element);
    }
    // white space element
    if(element.isTextElement() &&
       element.isOnlyChild() &&
       WhiteSpace.isWhiteSpaceElement(element)){
      if(Config.debugLayout){
	console.log("empty box:[%s], white-space only", element.toString());
      }
      return this.createEmptyBoxGenerator(parent_ctx, element);
    }
    if(PseudoElement.isFirstLine(element)){
      return new FlowGenerator(new FirstLineContext(element, parent_ctx));
    }
    switch(element.tagName){
    case "(text)":
      return new TextGenerator(new TextContext(element, parent_ctx));
    case "br":
      let line_break = LayoutControl.createLineBreak();
      return new ConstantGenerator(new ControlContext(element, parent_ctx, line_break));
    case "hr":
      return new ConstantGenerator(new HrContext(element, parent_ctx));
    case "img":
      return this.createImageGenerator(parent_ctx, element);
    }
    if(display.isFlowRuby()){
      return new RubyGenerator(new RubyContext(element, parent_ctx));
    }
    if(display.isListItem()){
      if(parent_ctx.isListItem() === false){
	//let marker = PseudoElement.addMarker(element);
	PseudoElement.addMarker(element);
      }
      return new FlowGenerator(new ListItemContext(element, parent_ctx));
    }
    if(display.isTable()){
      return new FlowGenerator(new TableContext(element, parent_ctx));
    }
    if(display.isTableRowGroup()){
      return new TableRowGroupGenerator(new TableRowGroupContext(element, parent_ctx));
    }
    if(display.isTableRow()){
      return new TableRowGenerator(new TableRowContext(element, parent_ctx));
    }
    // td(flow-root)
    if(display.isTableCell()){
      return new TableCellGenerator(new TableCellContext(element, parent_ctx));
    }
    // blockquote, fieldset, figure
    if(display.isFlowRoot() || LayoutSection.isSectioningRootElement(element)){
      return new FlowGenerator(new FlowRootContext(element, parent_ctx));
    }
    if(display.isFlow()){
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

  static createPageBreakBeforeElement(element: HtmlElement): HtmlElement {
    let hr = element.root.createElement("hr");
    hr.setAttribute("style", "page-break-before:always; extent:0; margin:0; border:0");
    if(element.parent){
      element.parent.insertBefore(hr, element);
    }
    if(Config.debugLayout){
      console.log("inserted dynamic page-break before [%s]", element.toString());
    }
    return hr;
  }

  static createPageBreakBeforeGenerator(parent_ctx: FlowContext, element: HtmlElement):
  ConstantGenerator {
    parent_ctx.incPageBreak(); // to block infinite loop
    let break_element = this.createPageBreakBeforeElement(element);
    let page_break = LayoutControl.createPageBreak();
    let context = new ControlContext(break_element, parent_ctx, page_break);
    return new ConstantGenerator(context);
  }

  static createImageGenerator(parent_ctx: FlowContext, element: HtmlElement): LayoutGenerator {
    let alt_text = element.getAttribute("alt") || "";
    if(Image.exists(element) === false && alt_text !== ""){
      let alt_text_node = element.root.createTextNode(alt_text);
      element.appendChild(alt_text_node);
      return new TextGenerator(new TextContext(alt_text_node, parent_ctx));
    }
    return new ReplacedElementGenerator(new ImageContext(element, parent_ctx));
  }
}
