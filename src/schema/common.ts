// ---------------------------------------------------------------------------
// Shared foundation types used across all schema levels
// ---------------------------------------------------------------------------

/** Character position in source code */
export interface Position {
  /** 1-based line number */
  line: number;
  /** 0-based column number */
  column: number;
  /** Byte offset from start of source */
  offset: number;
}

/** Range spanning two positions in source code */
export interface Range {
  start: Position;
  end: Position;
}

// ---------------------------------------------------------------------------
// Character classes - declarative replacement for regex character classes
// ---------------------------------------------------------------------------

/** Predefined character classes covering common patterns */
export type PredefinedCharClass =
  | "letter" // a-z, A-Z, unicode letters
  | "upper" // A-Z
  | "lower" // a-z
  | "digit" // 0-9
  | "hexDigit" // 0-9, a-f, A-F
  | "alphanumeric" // letter | digit
  | "whitespace" // space, tab (NOT newline)
  | "newline" // \n, \r\n, \r
  | "any"; // any character

/**
 * Character class definition.
 * The building block for lexer patterns, replacing regex character classes
 * with declarative, composable definitions.
 */
export type CharClass =
  | { predefined: PredefinedCharClass }
  | { chars: string } // specific characters, e.g. "+-*/"
  | { range: [string, string] } // character range, e.g. ['a', 'z']
  | { union: CharClass[] } // combine multiple classes
  | { negate: CharClass } // everything except
  | { ref: string }; // reference to a named charClass

// ---------------------------------------------------------------------------
// Token categories for syntax highlighting
// ---------------------------------------------------------------------------

/**
 * Standard token categories for syntax highlighting.
 * Maps to VS Code / TextMate scope categories for theme compatibility.
 */
export type TokenCategory =
  | "keyword" // language keywords (if, for, class, etc.)
  | "identifier" // variable/function names
  | "string" // string literals
  | "number" // numeric literals
  | "comment" // comments (line and block)
  | "operator" // operators (+, -, =, etc.)
  | "punctuation" // brackets, semicolons, commas
  | "type" // type names
  | "decorator" // decorators/annotations (@)
  | "tag" // HTML/JSX tags
  | "attribute" // HTML/JSX attributes
  | "meta" // preprocessor, shebang, etc.
  | "regexp" // regular expression literals
  | "escape" // escape sequences in strings
  | "variable" // special variables ($var, etc.)
  | "constant" // built-in constants (true, false, null)
  | "whitespace"
  | "newline"
  | "error"
  | "plain"; // fallback / unknown

// ---------------------------------------------------------------------------
// Symbol kinds for code structure
// ---------------------------------------------------------------------------

/**
 * Symbol kinds for code structure classification.
 * Compatible with ragts CodeSymbol.kind and VS Code SymbolKind.
 */
export type SymbolKind =
  | "function"
  | "class"
  | "method"
  | "object"
  | "interface"
  | "type"
  | "enum"
  | "module"
  | "variable"
  | "import"
  | "export"
  | "namespace"
  | "property"
  | "constant"
  | "other";
