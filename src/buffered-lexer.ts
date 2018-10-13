import {
  Lexer
} from "./public-api";

export class BufferedLexer<T> extends Lexer {
  public tokens: T [];
  public pos : number;

  constructor(str: string, args = {}){
    super(str);
    this.pos = 0;
    this.tokens = [];
    this.setupTokens(args);
  }

  public get length(): number {
    return this.tokens.length;
  }

  public get progress(): number {
    if(this.tokens.length === 0){
      return 1;
    }
    return this.pos / this.tokens.length;
  }

  public hasNext(): boolean {
    let has_next = this.pos < this.tokens.length;
    return has_next;
  }

  public getNext(): T {
    let token = this.tokens[this.pos++];
    return token;
  }

  protected setupTokens(args: any) : T [] {
    while(this.hasNextBuff()){
      this.addToken(this.createToken(args));
    }
    return this.tokens;
  }

  protected addToken(token: T){
    this.tokens.push(token);
  }

  protected createToken(args: any) : T {
    throw new Error("BufferedLexer.createToken must be overrided");
  }

  protected hasNextBuff() : boolean {
    let has_next = this.buff !== "";
    return has_next;
  }

  public peek(count = 0): T | null {
    return this.tokens[this.pos + count] || null;
  }

  public step(): number {
    this.pos++;
    return this.pos;
  }

  public pushBack(){
    this.pos--;
  }

  public getPos(): number{
    return this.pos;
  }

  public setPos(pos: number){
    this.pos = Math.max(0, pos);
  }
}
