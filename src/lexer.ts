export class Lexer {
  public src: string;
  protected buff: string;

  protected constructor(src: string){
    this.src = this.normalize(src);
    this.buff = this.src;
  }

  protected normalize(str: string){
    return str;
  }

  protected stepBuff(count: number){
    this.buff = this.buff.substring(count);
  }

  protected getChar(){
    let c1 = this.peekChar();
    this.stepBuff(1);
    return c1;
  }

  protected peekChar(): string{
    return this.buff.substring(0, 1);
  }
}
