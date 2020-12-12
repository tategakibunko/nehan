
export interface TokenMapper<T> {
  visit: (tokens: T[]) => T[];
}

export interface ILexer<T> {
  tokens: T[];
  src: string;
  hasNext: () => boolean;
  getNext: () => T;
  peek: (offset: number) => T | undefined;
  pushBack: (count: number) => void;
  acceptTokenMapper: (visitor: TokenMapper<T>) => void;
}

export class Lexer<T> implements ILexer<T> {
  public tokens: T[];
  public src: string;
  protected pos: number;
  protected buff: string;

  constructor(src: string, args = {}) {
    this.src = this.normalize(src, args);
    this.buff = this.src;
    this.pos = 0;
    this.tokens = [];
    this.setupTokens(args);
  }

  public acceptTokenMapper(visitor: TokenMapper<T>) {
    this.tokens = visitor.visit(this.tokens);
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

  public peek(offset = 0): T | undefined {
    return this.tokens[this.pos + offset];
  }

  public pushBack(count: number) {
    this.pos = Math.max(0, this.pos - Math.abs(count));
  }
}
