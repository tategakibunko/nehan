import {
  Config
} from "./public-api";

export class Prefix {
  static add(str: string, prefix = Config.internalPrefix): string {
    if(!str){
      return "";
    }
    return prefix + "-" + str;
  }

  static addInternal(str: string): string {
    return Prefix.add(str, Config.internalPrefix);
  }

  static addExternal(str: string): string {
    return Prefix.add(str, Config.externalPrefix);
  }
}
