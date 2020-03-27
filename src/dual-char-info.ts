export type ParenType =
  "open" | // open mark like left bracket.
  "close" | // close mark like right bracket.
  "none"

export type KinsokuPos =
  "head" |  // unable to place line head.
  "tail" |   // unable to place line tail.
  "none"

export interface DualCharInfo {
  readonly parenType: ParenType,
  readonly kinsokuPos: KinsokuPos,
  readonly kernEnable: boolean,
  readonly hangEnable: boolean, // is BURA-SAGARI(hanging punctuation) enable?

  // In some like windows 10 or old android,
  // some vertical glyphs is not placed properly.
  // So if we can substitute some glyphs by rotation,
  // we rotate it by setting rotatable = true.
  readonly rotatable: boolean,
  readonly isSmall: boolean
}
