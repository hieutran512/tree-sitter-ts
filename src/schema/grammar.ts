// ---------------------------------------------------------------------------
// Level 3: Full Grammar (PEG-style)
//
// For complete AST construction and syntax validation. Optional - most
// use cases only need Level 1 (lexer) + Level 2 (structure).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Grammar config
// ---------------------------------------------------------------------------

/** Full grammar configuration for AST construction */
export interface GrammarConfig {
  /** Entry rule name (top-level production) */
  entry: string;
  /** Grammar production rules */
  rules: Record<string, GrammarRule>;
  /** Operator precedence levels (lowest to highest) */
  precedence?: PrecedenceLevel[];
  /** Error recovery strategies */
  recovery?: RecoveryStrategy[];
}

// ---------------------------------------------------------------------------
// Grammar rules
// ---------------------------------------------------------------------------

/** A grammar rule with one or more alternative productions */
export interface GrammarRule {
  /** Alternative productions (tried in order) */
  alternatives: Production[];
  /** If true, this rule's node is inlined into parent (no separate AST node) */
  inline?: boolean;
}

/** A production is a sequence of elements that form a complete match */
export type Production = ProductionElement[];

/**
 * An element within a production.
 * Elements compose to describe the full syntax of a language construct.
 */
export type ProductionElement =
  | TokenElement
  | RuleElement
  | OptionalElement
  | RepeatElement
  | ChoiceElement
  | PrecElement;

/** Match a specific token type (terminal) */
export interface TokenElement {
  /** Token type to match */
  token: string;
  /** Optional: specific token value */
  value?: string;
  /** Optional: field name for the AST node */
  field?: string;
}

/** Match another grammar rule (non-terminal) */
export interface RuleElement {
  /** Rule name to match */
  rule: string;
  /** Optional: field name for the AST node */
  field?: string;
}

/** Optional element - matches zero or one times */
export interface OptionalElement {
  optional: ProductionElement | Production;
}

/** Repeated element - matches zero or more (min=0) or one or more (min=1) */
export interface RepeatElement {
  repeat: ProductionElement | Production;
  /** Minimum occurrences (0 = *, 1 = +). Default: 0 */
  min?: number;
  /** Optional separator between repetitions (e.g., comma in argument lists) */
  separator?: { token: string; value?: string };
}

/** Choice between alternative productions */
export interface ChoiceElement {
  choice: Production[];
}

/** Precedence annotation for operator expressions */
export interface PrecElement {
  /** Precedence level (higher binds tighter) */
  prec: number;
  /** Associativity */
  assoc?: "left" | "right" | "none";
  /** The element this precedence applies to */
  element: ProductionElement;
}

// ---------------------------------------------------------------------------
// Precedence and error recovery
// ---------------------------------------------------------------------------

/** Operator precedence level */
export interface PrecedenceLevel {
  /** Numeric level (higher = binds tighter) */
  level: number;
  /** How operators at this level associate */
  associativity: "left" | "right" | "none";
  /** Operator token values at this level */
  operators: string[];
}

/** Error recovery strategy for a grammar context */
export interface RecoveryStrategy {
  /** Grammar rule context where this recovery applies */
  context: string;
  /** Tokens to synchronize on when recovering from errors */
  syncTokens: string[];
}
