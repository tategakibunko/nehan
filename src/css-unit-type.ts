export enum CssUnitTypeName {
  EM,
  REM,
  EX,
  PX,
  PT,
  PERCENT,
  VW,
  VH,
  NONE
}

export class CssUnitType {
  static inferName(css_text: string): CssUnitTypeName {
    if(css_text.indexOf("rem") >= 0){
      return CssUnitTypeName.REM;
    }
    if(css_text.indexOf("em") >= 0){
      return CssUnitTypeName.EM;
    }
    if(css_text.indexOf("ex") >= 0){
      return CssUnitTypeName.EX;
    }
    if(css_text.indexOf("pt") >= 0){
      return CssUnitTypeName.PT;
    }
    if(css_text.indexOf("px") >= 0){
      return CssUnitTypeName.PX;
    }
    if(css_text.indexOf("vw") >= 0){
      return CssUnitTypeName.VW;
    }
    if(css_text.indexOf("vh") >= 0){
      return CssUnitTypeName.VH;
    }
    if(css_text.indexOf("%") >= 0){
      return CssUnitTypeName.PERCENT;
    }
    return CssUnitTypeName.NONE;
  }
}
