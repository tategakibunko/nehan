export type CssUnitTypeName =
  "em" |
  "rem" |
  "ex" |
  "px" |
  "pt" |
  "percent" |
  "vw" |
  "vh" |
  "none"

export class CssUnitType {
  static inferName(cssText: string): CssUnitTypeName {
    if (cssText.endsWith("rem")) {
      return "rem";
    }
    if (cssText.endsWith("em")) {
      return "em";
    }
    if (cssText.endsWith("ex")) {
      return "ex";
    }
    if (cssText.endsWith("pt")) {
      return "pt";
    }
    if (cssText.endsWith("px")) {
      return "px";
    }
    if (cssText.endsWith("vw")) {
      return "vw";
    }
    if (cssText.endsWith("vh")) {
      return "vh";
    }
    if (cssText.endsWith("%")) {
      return "percent";
    }
    return "none";
  }
}
