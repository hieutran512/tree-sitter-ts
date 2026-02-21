// ---------------------------------------------------------------------------
// Level 1: Lexer Configuration
//
// Defines how source code is tokenized using declarative matchers
// instead of regex. The core innovation of tree-sitter-ts.
// ---------------------------------------------------------------------------

import type { CharClass, TokenCategory } from "./common.js";

// ---------------------------------------------------------------------------
// Lexer config
// ---------------------------------------------------------------------------

/** Complete lexer configuration for a language profile */
export interface LexerConfig {
  /** Reusable named character classes */
  charClasses?: Record<string, CharClass>;

  /** Token type definitions with highlighting category */
  tokenTypes: Record<string, TokenTypeDef>;

  /**
   * Lexer states (modes) for context-dependent tokenization.
   * Each state has its own ordered set of rules.
   */
  states: Record<string, LexerState>;

  /** Which state to start in (must exist in states) */
  initialState: string;

  /** Token types to skip in parser (still emitted in token stream) */
  skipTokens?: string[];

  /** Indentation tracking for Python/YAML-like languages */
  indentation?: IndentationConfig;
}

/** Token type definition with highlighting metadata */
export interface TokenTypeDef {
  /** Primary highlighting category */
  category: TokenCategory;
  /** Optional sub-category for finer-grained highlighting */
  subcategory?: string;
}

// ---------------------------------------------------------------------------
// Lexer states and rules
// ---------------------------------------------------------------------------

/** A lexer state (mode) containing ordered matching rules */
export interface LexerState {
  /** Rules applied in priority order - first match wins */
  rules: LexerRule[];
}

/**
 * A single lexer rule: match a pattern, emit a token, optionally change state.
 *
 * State transitions enable context-dependent tokenization:
 * - push: enter a new state (e.g., entering a template string)
 * - pop: return to the previous state (e.g., closing a template expression)
 * - switchTo: replace current state (e.g., switching from tag to attribute mode)
 */
export interface LexerRule {
  /** Matcher that detects this token */
  match: Matcher;
  /** Token type to emit (must exist in tokenTypes) */
  token: string;
  /** Push a new state onto the state stack */
  push?: string;
  /** Pop the current state from the stack */
  pop?: boolean;
  /** Replace current state (switch without push/pop) */
  switchTo?: string;
}

// ---------------------------------------------------------------------------
// Matchers - declarative token pattern definitions
// ---------------------------------------------------------------------------

/**
 * Matcher types - the heart of the lexer.
 *
 * Each type describes a common tokenization pattern declaratively.
 * The engine compiles these to efficient character-level scanners.
 *
 * Key advantages over regex:
 * - Readable and self-documenting
 * - State machine handles nesting (template literals, JSX)
 * - No regex pitfalls (catastrophic backtracking, etc.)
 * - Can be statically analyzed and optimized
 */
export type Matcher =
  | StringMatcher
  | KeywordsMatcher
  | DelimitedMatcher
  | LineMatcher
  | CharSequenceMatcher
  | NumberMatcher
  | SequenceMatcher
  | PatternMatcher;

/**
 * Exact string match. For operators, punctuation, specific tokens.
 * When value is an array, tries each string in order (longest match first recommended).
 *
 * @example { kind: 'string', value: '=>' }
 * @example { kind: 'string', value: ['{', '}', '(', ')'] }
 */
export interface StringMatcher {
  kind: "string";
  value: string | string[];
}

/**
 * Keyword match with word boundary checking.
 * Ensures "if" doesn't match inside "iframe".
 *
 * @example { kind: 'keywords', words: ['if', 'else', 'for', 'while'] }
 */
export interface KeywordsMatcher {
  kind: "keywords";
  words: string[];
}

/**
 * Delimited content match. Handles strings, block comments, raw strings.
 * Supports escape characters, multiline content, and nested delimiters.
 *
 * @example { kind: 'delimited', open: '"', close: '"', escape: '\\' }
 * @example { kind: 'delimited', open: '/''*', close: '*''/', multiline: true }
 * @example { kind: 'delimited', open: '"""', close: '"""', multiline: true }
 */
export interface DelimitedMatcher {
  kind: "delimited";
  /** Opening delimiter string */
  open: string;
  /** Closing delimiter string */
  close: string;
  /** Escape character (e.g., '\\' for backslash escaping) */
  escape?: string;
  /** Whether content can span multiple lines (default: false) */
  multiline?: boolean;
  /** Whether delimiters can nest (e.g., Rust nested block comments) */
  nested?: boolean;
}

/**
 * Line content match. From marker to end of line.
 * For line comments, preprocessor directives, etc.
 *
 * @example { kind: 'line', start: '//' }
 * @example { kind: 'line', start: '#' }
 */
export interface LineMatcher {
  kind: "line";
  /** Starting marker string */
  start: string;
}

/**
 * Character sequence match. Matches sequences of characters from a class.
 * For identifiers, hex numbers, and other character-class-based tokens.
 *
 * @example // Identifier: starts with letter/_, continues with alphanumeric/_
 * { kind: 'charSequence',
 *   first: { union: [{ predefined: 'letter' }, { chars: '_$' }] },
 *   rest:  { union: [{ predefined: 'alphanumeric' }, { chars: '_$' }] } }
 */
export interface CharSequenceMatcher {
  kind: "charSequence";
  /** Character class for the first character */
  first: CharClass;
  /** Character class for subsequent characters (if omitted, matches single char) */
  rest?: CharClass;
}

/**
 * Number literal match. Handles the common numeric literal formats
 * found across programming languages. Compiles to efficient scanning
 * without regex.
 *
 * @example { kind: 'number', integer: true, float: true, hex: true, separator: '_' }
 * @example { kind: 'number', integer: true, float: true, suffix: ['px', 'em', 'rem', '%'] }
 */
export interface NumberMatcher {
  kind: "number";
  /** Match decimal integers: 123 */
  integer?: boolean;
  /** Match floating point: 1.5 */
  float?: boolean;
  /** Match hexadecimal: 0xFF */
  hex?: boolean;
  /** Match octal: 0o77 */
  octal?: boolean;
  /** Match binary: 0b1010 */
  binary?: boolean;
  /** Match scientific notation: 1e10, 1.5e-3 */
  scientific?: boolean;
  /** Digit separator character: '_' for 1_000_000 */
  separator?: string;
  /** Unit suffixes: ['px', 'em', 'rem', '%'] for CSS */
  suffix?: string[];
}

/**
 * Sequence match. All elements must match in order.
 * For composite patterns like decorators (@identifier).
 *
 * @example { kind: 'sequence', elements: [
 *   { kind: 'string', value: '@' },
 *   { kind: 'charSequence', first: { predefined: 'letter' }, rest: { predefined: 'alphanumeric' } }
 * ]}
 */
export interface SequenceMatcher {
  kind: "sequence";
  elements: Matcher[];
}

/**
 * Regex pattern escape hatch. DISCOURAGED - use other matchers when possible.
 * For truly complex edge cases that can't be expressed with other matchers.
 *
 * @example { kind: 'pattern', regex: '\\b0[xX][0-9a-fA-F]+\\b' }
 */
export interface PatternMatcher {
  kind: "pattern";
  /** Regex pattern string (without flags) */
  regex: string;
}

// ---------------------------------------------------------------------------
// Indentation tracking
// ---------------------------------------------------------------------------

/** Configuration for indentation-based block detection (Python, YAML, etc.) */
export interface IndentationConfig {
  /** Token type to emit when indentation increases */
  indentToken: string;
  /** Token type to emit when indentation decreases */
  dedentToken: string;
  /** How to detect indent units */
  unit: "spaces" | "tab" | "detect";
  /** Number of spaces per indent level (when unit is 'spaces') */
  size?: number;
}
