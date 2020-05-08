import {
  Config,
  ICharacter,
  ILogicalNode,
  LogicalLineNode,
  LogicalTextNode,
  LogicalInlineNode,
} from './public-api';

export interface ILogicalTextJustifier {
  justify: (line: LogicalLineNode) => void;
}

export class LogicalTextJustifier implements ILogicalTextJustifier {
  static instance = new LogicalTextJustifier();
  private constructor() { }

  private getJustifyTargetChars(children: ILogicalNode[]): ICharacter[] {
    return children.reduce((chars, child) => {
      if (child instanceof LogicalTextNode) {
        return chars.concat(child.children);
      }
      if (child instanceof LogicalInlineNode) {
        return chars.concat(this.getJustifyTargetChars(child.children));
      }
      return chars; // ignore ruby, re-inline, iblock etc
    }, [] as ICharacter[]);
  }

  justify(line: LogicalLineNode) {
    const minJustifySpaceSize = line.env.font.size / 4;
    const maxJustifySpaceSize = line.env.font.size;
    const spaceSize = line.size.measure - line.autoSize.measure;
    if (spaceSize < minJustifySpaceSize || spaceSize > maxJustifySpaceSize) {
      // console.log("space size(%d) too low, skip justify space", spaceSize);
      return;
    }
    const targetChars = this.getJustifyTargetChars(line.children);
    if (targetChars.length <= 1) {
      return;
    }
    const charSpacingSize = spaceSize / (targetChars.length - 1);
    if (charSpacingSize >= Config.maxJustifyGap) {
      // console.log("too large spacing size:", charSpacingSize);
      return;
    }
    // console.log("targetChars: %d, spaceSize: %d, charSpacingSize:%fpx", targetChars.length, spaceSize, charSpacingSize);
    targetChars.forEach(char => char.spacing = charSpacingSize);
  }
}