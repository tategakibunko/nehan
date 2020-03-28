/*
import {
  Utils
} from "./public-api";

export enum LayoutStatusValue {
  NORMAL = "normal",
  PAUSE = "pause",
  ABORT = "abort"
}

export class LayoutStatus {
  protected value: LayoutStatusValue;
  static values: string [] = Utils.Enum.toValueArray(LayoutStatusValue);

  constructor(){
    this.value = LayoutStatusValue.NORMAL;
  }

  public toString(): string {
    return `status:${this.value}`;
  }

  public setNormal(){
    this.value = LayoutStatusValue.NORMAL;
  }

  public setPause(){
    this.value = LayoutStatusValue.PAUSE;
  }

  public setAbort(){
    this.value = LayoutStatusValue.ABORT;
  }

  public isNormal(){
    return this.value === LayoutStatusValue.NORMAL;
  }

  public isPause(){
    return this.value === LayoutStatusValue.PAUSE;
  }

  public isAbort(){
    return this.value === LayoutStatusValue.ABORT;
  }
}
*/