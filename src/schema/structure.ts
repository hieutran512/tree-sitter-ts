// ---------------------------------------------------------------------------
// Level 2: Structure Detection
//
// Identifies top-level constructs (functions, classes, etc.) from the
// token stream WITHOUT a full grammar. Enables RAG chunking, code
// folding, and symbol outline.
// ---------------------------------------------------------------------------

import type { SymbolKind } from "./common.js";

// ---------------------------------------------------------------------------
// Structure config
// ---------------------------------------------------------------------------

/** Structure detection configuration */
export interface StructureConfig {
  /** Block delimiter pairs for nesting detection */
  blocks: BlockRule[];

  /** Symbol detection rules - identify functions, classes, etc. */
  symbols: SymbolRule[];

  /** Folding region rules for editors */
  folding?: FoldingRule[];
}

// ---------------------------------------------------------------------------
// Block rules
// ---------------------------------------------------------------------------

/** Block delimiter pair for bracket/brace matching */
export interface BlockRule {
  /** Descriptive name (e.g., 'braces', 'parens', 'brackets') */
  name: string;
  /** Opening delimiter token value */
  open: string;
  /** Closing delimiter token value */
  close: string;
}

// ---------------------------------------------------------------------------
// Symbol rules
// ---------------------------------------------------------------------------

/**
 * Symbol detection rule.
 * Matches a sequence of token patterns to identify a language construct
 * (function, class, method, etc.) from the token stream.
 *
 * @example // JavaScript function declaration
 * {
 *   name: 'function_declaration',
 *   kind: 'function',
 *   pattern: [
 *     { token: 'keyword', value: 'function' },
 *     { token: 'identifier', capture: 'name' }
 *   ],
 *   hasBody: true,
 *   bodyStyle: 'braces'
 * }
 *
 * @example // Python class with indentation body
 * {
 *   name: 'class_definition',
 *   kind: 'class',
 *   pattern: [
 *     { token: 'keyword', value: 'class' },
 *     { token: 'identifier', capture: 'name' }
 *   ],
 *   hasBody: true,
 *   bodyStyle: 'indentation'
 * }
 */
export interface SymbolRule {
  /** Rule name (becomes the node type, compatible with tree-sitter names) */
  name: string;
  /** Symbol kind for classification */
  kind: SymbolKind;
  /** Token pattern to detect this symbol */
  pattern: TokenPatternStep[];
  /** Whether this symbol has a body (block) */
  hasBody?: boolean;
  /** How the body is delimited */
  bodyStyle?: "braces" | "indentation" | "end-keyword";
  /** End keyword for bodyStyle 'end-keyword' (e.g., Ruby: 'end') */
  endKeyword?: string;
  /** Can this symbol appear inside another symbol? */
  nested?: boolean;
}

// ---------------------------------------------------------------------------
// Token pattern steps
// ---------------------------------------------------------------------------

/**
 * A step in a token pattern match.
 * Steps are matched sequentially against the token stream.
 */
export type TokenPatternStep =
  | TokenMatchStep
  | TokenSkipStep
  | TokenOptionalStep
  | TokenAnyOfStep;

/** Match a specific token type and optionally a value */
export interface TokenMatchStep {
  /** Token type to match (e.g., 'keyword', 'identifier') */
  token: string;
  /** Optional: specific token value to match */
  value?: string;
  /** Optional: capture this token's value under a name (e.g., 'name') */
  capture?: string;
}

/** Skip any tokens until the next step matches */
export interface TokenSkipStep {
  skip: true;
  /** Maximum tokens to skip before giving up (prevents runaway matching) */
  maxTokens?: number;
}

/** Optional step - matches if possible, skips if not */
export interface TokenOptionalStep {
  optional: TokenPatternStep;
}

/** Choice - match any one of the alternatives */
export interface TokenAnyOfStep {
  anyOf: TokenPatternStep[];
}

// ---------------------------------------------------------------------------
// Folding rules
// ---------------------------------------------------------------------------

/** Folding region definition for editors */
export interface FoldingRule {
  /** What opens a foldable region */
  open: { token: string; value?: string };
  /** What closes it */
  close: { token: string; value?: string };
}
