export class Lexer<T> {
  public tokens: T[];
  public src: string;
  public pos: number;
  protected buff: string;

  constructor(src: string, args = {}) {
    this.src = this.normalize(src, args);
    this.buff = this.src;
    this.pos = 0;
    this.tokens = [];
    this.setupTokens(args);
  }

  protected normalize(src: string, args = {}): string {
    return src;
  }

  protected stepBuff(count: number) {
    this.buff = this.buff.substring(count);
  }

  protected getChar() {
    let c1 = this.peekChar();
    this.stepBuff(1);
    return c1;
  }

  protected peekChar(): string {
    return this.buff.substring(0, 1);
  }

  public get length(): number {
    return this.tokens.length;
  }

  public get progress(): number {
    if (this.tokens.length === 0) {
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

  protected setupTokens(args: any): T[] {
    while (this.hasNextBuff()) {
      this.addToken(this.createToken(args));
    }
    return this.tokens;
  }

  protected addToken(token: T) {
    this.tokens.push(token);
  }

  protected createToken(args: any): T {
    throw new Error("BufferedLexer.createToken must be overrided");
  }

  protected hasNextBuff(): boolean {
    return this.buff !== "";
  }

  public peek(count = 0): T | null {
    return this.tokens[this.pos + count] || null;
  }

  public step(): number {
    this.pos++;
    return this.pos;
  }

  public pushBack() {
    this.pos--;
  }

  public getPos(): number {
    return this.pos;
  }

  public setPos(pos: number) {
    this.pos = Math.max(0, pos);
  }
}
