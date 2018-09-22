// https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList
export class DomTokenList {
  protected tokens: string [];

  constructor(items?: string[]){
    this.tokens = items || [];
  }

  public get length(): number {
    return this.tokens.length;
  }

  public item(index: number): string | undefined {
    return this.tokens[index];
  }

  public contains(token: string): boolean {
    return this.tokens.some((t) => {
      return t === token;
    });
  }

  public add(token: string) {
    this.tokens.push(token);
  }

  public remove(token: string){
    return this.tokens = this.tokens.filter((t) => {
      return t !== token;
    });
  }

  public replace(old_token: string, new_token: string){
    return this.tokens = this.tokens.map((t) => {
      return (t === old_token)? new_token : t;
    });
  }

  public supports(token: string): boolean{
    throw new Error("Sorry, not implemented yet");
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
  public toggle(token: string, force?: boolean): boolean {
    let contains = this.contains(token);

    // if force is true, add if it does'nt exsits, but never remove.
    if(force === true){
      if(contains === false){
	this.add(token);
      }
      return true;
    }
    // if force is false, remove if it exists, but never add.
    if(force === false){
      if(contains === true){
	this.remove(token);
      }
      return false;
    }
    if(contains === true){
      this.remove(token);
      return false;
    }
    this.add(token);
    return true;
  }

  public entries(): string [] {
    return this.tokens;
  }

  public keys(): string [] {
    return Object.keys(this.tokens);
  }

  public values(): string [] {
    return this.tokens;
  }

  public forEach(callback: (cur:string, index?:number, list?:string []) => void) {
    Array.prototype.forEach.call(this.tokens, callback);
  }
}
