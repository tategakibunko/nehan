import {
  NehanElement,
  NativeStyleMap,
  CssCascade,
  ILogicalCssEvaluator,
} from "./public-api";

export class LogicalBackgroundPos {
  public value: string;

  constructor(value: string) {
    this.value = value;
  }

  static load(element: NehanElement): LogicalBackgroundPos {
    const value = CssCascade.getValue(element, "background-position");
    return new LogicalBackgroundPos(value);
  }

  public acceptCssEvaluator(visitor: ILogicalCssEvaluator): NativeStyleMap {
    return visitor.visitBackgroundPos(this);
  }
}

