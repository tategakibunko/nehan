export enum SelectorTokenType {
  UNIVERSAL_SELECTOR,
  TYPE_SELECTOR,
  CLASS_SELECTOR,
  ID_SELECTOR,
  ATTR_SELECTOR,
  PSEUDO_CLASS,
  PSEUDO_ELEMENT,
  COMBINATOR
}

export interface SelectorToken {
  type: SelectorTokenType,
  value: string
}
