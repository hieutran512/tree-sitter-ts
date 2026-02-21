// ---------------------------------------------------------------------------
// Output types: Token stream
// ---------------------------------------------------------------------------

import type { Range, TokenCategory } from "../schema/common.js";

/** A token emitted by the lexer */
export interface Token {
  /** Token type name (from profile's tokenTypes) */
  type: string;
  /** Token text content */
  value: string;
  /** Highlighting category */
  category: TokenCategory;
  /** Position in source */
  range: Range;
}
