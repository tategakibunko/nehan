import {
  PropValue,
  Utils
} from "./public-api";

export class CssText {
  public value: string;

  constructor(prop_value: PropValue<string, string>){
    this.value = this.getValue(prop_value);
  }

  // if prop is 'content', it's not normalized.
  protected getValue(prop_value: PropValue<string, string>): string {
    switch(prop_value.prop){
    case "content": return prop_value.value;
    default: return CssText.normalize(prop_value.value);
    }
  }

  public split(splitter: string | RegExp = /\s/): string []{
    return this.value.split(splitter);
  }

  static normalize(str: string){
    let norm = str.trim();
    norm = norm.replace(/[\n\t]/g, "");
    norm = norm.replace(/!important/g, ""); // !important is supported by dynamic style.
    norm = Utils.String.multiSpaceToSingle(norm);
    norm = Utils.String.cutSpaceAround(norm, ",");
    norm = Utils.String.cutSpaceAround(norm, "/");
    norm = Utils.String.cutSpaceAround(norm, ";"); // for inline style text
    return norm;
  }

  static getValue4D(value: string): string [] {
    let vs = value.split(/\s/);
    switch(vs.length){
    case 1: return [vs[0], vs[0], vs[0], vs[0]];
    case 2: return [vs[0], vs[1], vs[0], vs[1]];
    case 3: return [vs[0], vs[1], vs[2], vs[1]];
    case 4: return [vs[0], vs[1], vs[2], vs[3]];
    }
    throw new Error("invalid shorthanded 4d value:" + value);
  }

  static getValue4D2(value: string): string [][] {
    let vss = value.split("/").map((text) => {
      return CssText.getValue4D(text);
    });
    if(vss.length === 1){
      vss.push(vss[0]);
    }
    return vss;
  }
}

