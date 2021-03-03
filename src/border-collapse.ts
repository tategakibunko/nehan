import {
  NehanElement,
  CssCascade
} from "./public-api";

export type BorderCollapseValue = "collapse" | "separate";

export class BorderCollapse {
  public value: BorderCollapseValue;

  constructor(value: BorderCollapseValue) {
    this.value = value;
  }

  public isCollapse(): boolean {
    return this.value === "collapse";
  }

  public isSeparate(): boolean {
    return this.value === "separate";
  }

  static load(element: NehanElement) {
    const value = CssCascade.getValue(element, "border-collapse");
    return new BorderCollapse(value as BorderCollapseValue);
  }
}
