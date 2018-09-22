export class Specificity {
  public a: number;
  public b: number;
  public c: number;

  constructor(a: number, b: number, c: number){
    this.a = a;
    this.b = b;
    this.c = c;
  }

  static add(spec1: Specificity, spec2: Specificity): Specificity{
    let spec = new Specificity(0, 0, 0);
    spec.a = spec1.a + spec2.a;
    spec.b = spec1.b + spec2.b;
    spec.c = spec1.c + spec2.c;
    return spec;
  }

  static compare(spec1: Specificity, spec2: Specificity): number {
    if(spec1.a > spec2.a){
      return 1;
    }
    if(spec1.a < spec2.a){
      return -1;
    }
    if(spec1.b > spec2.b){
      return 1;
    }
    if(spec1.b < spec2.b){
      return -1;
    }
    if(spec1.c > spec2.c){
      return 1;
    }
    if(spec1.c < spec2.c){
      return -1;
    }
    return 0;
  }

  public incA(): number {
    this.a++;
    return this.a;
  }

  public incB(): number {
    this.b++;
    return this.b;
  }

  public incC(): number {
    this.c++;
    return this.c;
  }
}
