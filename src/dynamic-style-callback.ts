import {
  DynamicStyleContext,
  CssDeclarationBlock
} from "./public-api";

export type DynamicStyleCallback = (context: DynamicStyleContext) => CssDeclarationBlock;
