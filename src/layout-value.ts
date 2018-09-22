import {
  LayoutControl,
  Character,
  isCharacter,
  Ruby,
  BoxContent,
  LogicalBox,
} from "./public-api";

export type LayoutValueType = LayoutControl | BoxContent;

export class LayoutValue {
  public value: LayoutValueType;
  
  constructor(value: LayoutValueType){
    this.value = value;
  }

  public isBox(): boolean {
    return this.value instanceof LogicalBox;
  }

  public isCharacter(): boolean {
    return isCharacter(this.value);
  }

  public isRuby(): boolean {
    return this.value instanceof Ruby;
  }

  public isControl(): boolean {
    return this.value instanceof LayoutControl;
  }

  public isLineBreak(): boolean {
    return this.isControl() && this.getAsControl().isLineBreak();
  }

  public isPageBreak(): boolean {
    return this.isControl() && this.getAsControl().isPageBreak();
  }

  public getAsBox(): LogicalBox {
    return this.value as LogicalBox;
  }

  public getAsCharacter(): Character {
    return this.value as Character;
  }

  public getAsRuby(): Ruby {
    return this.value as Ruby;
  }

  public getAsControl(): LayoutControl {
    return this.value as LayoutControl;
  }
}
