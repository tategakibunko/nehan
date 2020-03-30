import { UniversalSelector } from "./universal-selector";
import { IdSelector } from "./id-selector";
import { TypeSelector } from "./type-selector";
import { AttrSelector } from "./attr-selector";
import { ClassSelector } from "./class-selector";
import { PseudoClassSelector } from "./pseudo-class-selector";
import { PseudoElementSelector } from "./pseudo-element-selector";

export interface SimpleSelectors {
  univSelector?: UniversalSelector,
  idSelector?: IdSelector,
  typeSelector?: TypeSelector,
  attrSelector?: AttrSelector,
  classSelectors: ClassSelector[],
  pseudoClasses: PseudoClassSelector[],
  pseudoElement?: PseudoElementSelector
}
