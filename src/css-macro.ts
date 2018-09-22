export type CssMacroValue = (selector: string) => string

export class CssMacro {
  public macro: CssMacroValue;

  constructor(macro: CssMacroValue){
    this.macro = macro;
  }

  public call(selector: string): string {
    return this.macro(selector);
  }
}
