import {
  LayoutGenerator,
  LayoutValue,
} from "./public-api";

export class ResumedGenerators {
  public name: string;
  protected generators: LayoutGenerator [];

  constructor(name: string){
    this.generators = [];
    this.name = name;
  }

  public register(generator: LayoutGenerator){
    if(!generator.hasNext()){
      return;
    }
    this.generators.push(generator);
    generator.pause();
  }

  public isRunning(){
    return this.generators.some(gen => gen.isStatusNormal());
  }

  public getNext(): IteratorResult<LayoutValue []> {
    let next = this.activeGenerator.getNext();
    this.activeGenerator.pause();
    return next;
  }

  public rollback(){
    this.activeGenerator.rollback();
    this.activeGenerator.resume();
  }

  protected cleanupEndedGenerators(){
    this.generators = this.generators.filter(gen => gen.hasNext());
  }

  public commit(){
    this.activeGenerator.commit();
    this.cleanupEndedGenerators();
  }

  public resume(): boolean {
    this.generators.forEach(gen => gen.resume());
    this.cleanupEndedGenerators();
    return this.length > 0;
  }

  protected get length(): number {
    return this.generators.length;
  }

  protected get activeGenerator(): LayoutGenerator {
    for(let i = 0; i < this.generators.length; i++){
      let generator = this.generators[i];
      if(generator.isStatusNormal()){
	return generator;
      }
    }
    throw new Error("no more resume");
  }
}
