/*
import {
  LogicalSize,
  ICharacter,
  isCharacter,
  LogicalBox,
  Ruby
} from "./public-api";

export type BoxContent = ICharacter | Ruby | LogicalBox;

export class BoxContentSize {
  static getInlineSize(cont: BoxContent): number {
    return BoxContentSize.getLogicalSize(cont).measure;
  }

  static getBlockSize(cont: BoxContent): number {
    return BoxContentSize.getLogicalSize(cont).extent;
  }

  static getLogicalSize(cont: BoxContent): LogicalSize {
    if (isCharacter(cont)) {
      return (cont as ICharacter).size;
    } else if (cont instanceof Ruby) {
      return cont.size;
    } else if (cont instanceof LogicalBox) {
      return cont.totalSize;
    }
    throw new Error("Invalid argument type for BoxContentSize.getLogicalSize");
  }
}
*/

