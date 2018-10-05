import {
  Anchor,
  HtmlDocument,
  BodyGenerator,
  LayoutEvaluator,
  LayoutOutlineCallbacks,
  LogicalPage,
  LogicalBox,
} from "./public-api";

export class PageGenerator {
  protected document: HtmlDocument;
  protected generator: BodyGenerator;
  protected evaluator: LayoutEvaluator;
  protected iterator: IterableIterator<LogicalPage>;

  constructor(document: HtmlDocument){
    this.document = document;
    this.generator = this.document.createBodyGenerator();
    this.evaluator = this.generator.createEvaluator();
    this.iterator = this.createIterator();
  }

  public getNext(evaluate = false): IteratorResult<LogicalPage> {
    let next = this.iterator.next();
    if(!next.done && next.value && evaluate === true){
      next.value.dom = this.evalPageBox(next.value.box);
    }
    return next;
  }

  public getAnchor(anchor_name: string): Anchor | null {
    return this.generator.getAnchor(anchor_name);
  }

  public createOutlineElement(callbacks?: LayoutOutlineCallbacks): HTMLElement {
    return this.generator.createOutlineElement(callbacks);
  }

  public evalPageBox(box: LogicalBox): HTMLElement {
    return this.evaluator.eval(box);
  }

  protected* createIterator(): IterableIterator<LogicalPage> {
    let index = 0;
    while(this.generator.hasNext()){
      let next = this.generator.getNext();
      if(next.done || !next.value){
	break;
      }
      let values = next.value;
      let boxes: LogicalBox [] = values.filter(val => val.isBox()).map(val => val.getAsBox());
      for(let i = 0; i < boxes.length; i++){
	let box = boxes[i];
	let page: LogicalPage = {
	  index:index,
	  charCount:box.charCount,
	  box:box,
	  dom:null
	};
	yield page;
	index++;
      }
    }
  }
}

