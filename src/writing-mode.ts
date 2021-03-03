import {
  NehanElement,
  CssCascade,
  LogicalEdgeDirection,
  PhysicalEdgeDirection,
} from "./public-api";

export type WritingModeValue = 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';

export class WritingMode {
  public value: WritingModeValue;

  constructor(value: WritingModeValue) {
    this.value = value;
  }

  static load(element: NehanElement): WritingMode {
    let value = CssCascade.getValue(element, "writing-mode");
    return new WritingMode(value as WritingModeValue);
  }

  public isVerticalRl(): boolean {
    return this.value === 'vertical-rl';
  }

  public isVerticalLr(): boolean {
    return this.value === 'vertical-lr';
  }

  public isTextVertical(): boolean {
    return this.value.indexOf("vertical") === 0;
  }

  public isTextHorizontal(): boolean {
    return this.value.indexOf("horizontal") === 0;
  }
}
