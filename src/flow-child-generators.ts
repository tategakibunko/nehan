import {
  FlowContext,
  LayoutGenerator,
  ResumedGenerators,
  LayoutValue,
  HtmlElement,
  Config
} from "./public-api";

// parent must be FlowContext
// but children are LayoutGenerator (FlowGenerator | TextGenerator | ConstantGenerator)
export class FlowChildGenerators {
  protected parent: FlowContext;
  protected active?: LayoutGenerator;
  protected lead?: LayoutGenerator; // active generator at lead-pos(curMeasure=0)
  protected resumedGenerators: ResumedGenerators;

  constructor(parent: FlowContext, first_gen?: LayoutGenerator){
    this.parent = parent;
    if(first_gen){
      this.updateActive(first_gen);
      this.updateLead(first_gen);
    }
    this.resumedGenerators = new ResumedGenerators(parent.element.toString() + "@resume");
  }

  public getProgress(parent_unit_progress: number): number {
    if(!this.active){
      return 0;
    }
    return parent_unit_progress * (this.active.element.index + this.active.progress);
  }

  public hasNext(): boolean {
    if(this.hasNextActive()){
      return true;
    }
    if(this.hasNextResume()){
      return true;
    }
    return false;
  }

  public getNext(): IteratorResult<LayoutValue []> {
    if(this.resumedGenerators && this.resumedGenerators.isRunning()){
      return this.resumedGenerators.getNext();
    }
    if(this.active && this.active.hasNext()){
      let next = this.active.getNext();

      // If active generator is float-generator, yield once and pause.
      // It will be resumed later if neccesarry.
      if(this.active.isFloat()){
	this.resumedGenerators.register(this.active);
      }
      return next;
    }
    throw new Error("no more next");
  }

  public hasActive(): boolean {
    return this.active? true : false;
  }

  public hasNextActive(): boolean {
    if(this.active){
      return this.active.hasNext();
    }
    return false;
  }

  protected hasNextResume(): boolean {
    return this.resumedGenerators && this.resumedGenerators.isRunning();
  }

  public resume(): boolean {
    return this.resumedGenerators.resume();
  }

  public rollback(){
    if(this.resumedGenerators.isRunning()){
      this.resumedGenerators.rollback();
    } else if(this.lead){
      this.lead.rollback();
      this.updateActive(this.lead);
    }
  }

  public rollbackActive(){
    if(this.active){
      this.active.rollback();
    }
  }

  // active <- lead
  public setLeadAsActive(){
    if(this.lead){
      this.updateActive(this.lead);
    }
  }

  // lead <- active
  public setActiveAsLead(){
    if(this.active){
      this.updateLead(this.active);
      if(this.lead){
	this.lead.updateLead();
      }
    }
  }

  public getNextSibling(): HtmlElement | null {
    if(!this.active){
      throw new Error("active generator is not available");
    }
    return this.active.element.nextSibling;
  }

  public abortActive(){
    if(this.active){
      this.active.abort();
    }
  }

  public commit(){
    if(this.resumedGenerators.isRunning()){
      this.resumedGenerators.commit();
    } else if(this.active){
      this.active.commit();
    }
  }

  public updateStyle(){
    if(this.active && this.active.isLayout()){
      this.active.updateStyle();
    }
  }

  public updateActive(generator: LayoutGenerator){
    //console.log("[%s] current active:[%s]", this.parent.name, generator.name);
    if(Config.debugLayout){
      let old_name = this.active? this.active.name : "";
      let new_name = generator.name;
      if(old_name === ""){
	console.log("new active:%s", new_name);
      } else if(old_name !== new_name){
	console.log("update active [%s] -> [%s]", old_name, new_name);
      }
    }
    this.active = generator;
  }

  public updateLead(generator: LayoutGenerator){
    // generators associated with none layout, can't be lead generator.
    if(!generator.isLayout()){
      return;
    }
    // absolute positioned layout doesn't overflow, so can't be lead gen.
    if(generator.isPositionAbsolute()){
      return;
    }
    if(Config.debugLayout){
      let old_name = this.lead? this.lead.name : "";
      let new_name = generator.name;
      if(old_name === ""){
	console.log(
	  "%c[%s] new lead:[%s]",
	  "color:darkorange", this.parent.name, new_name
	);
      } else if(old_name !== new_name){
	console.log(
	  "%c[%s] update lead [%s] -> [%s]",
	  "color:darkorange; font-weight:bold", this.parent.name, old_name, new_name
	);
      }
    }
    this.lead = generator;
  }
}
