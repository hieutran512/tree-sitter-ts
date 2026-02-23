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
  | "datetime" // date/time literals (e.g., TOML/YAML timestamps)
  | "number" // numeric literals
  | "comment" // comments (line and block)
  | "operator" // operators (+, -, =, etc.)
  | "punctuation" // brackets, semicolons, commas
  | "type" // type names
  | "decorator" // decorators/annotations (@)
  | "tag" // HTML/JSX tags
  | "attribute" // HTML/JSX attributes
  | "heading" // markdown/org headings
  | "link" // links/URLs/references
  | "key" // mapping/object keys (JSON/YAML/TOML)
  | "meta" // preprocessor, shebang, etc.
  | "regexp" // regular expression literals
  | "escape" // escape sequences in strings
  | "variable" // special variables ($var, etc.)
  | "constant" // built-in constants (true, false, null)
  | "whitespace"
  | "newline"
  | "error"
  | "plain"; // fallback / unknown

/**
 * Symbol kinds for structure classification.
 * Compatible with ragts CodeSymbol.kind and extends VS Code/LSP SymbolKind
 * with markup/data/database-specific kinds.
 * Use "other" only when no specific kind applies.
 */
export type SymbolKind =
  // Core / LSP-aligned kinds
  | "file"
  | "function"
  | "class"
  | "method"
  | "constructor"
  | "object"
  | "package"
  | "interface"
  | "struct"
  | "type"
  | "typeParameter"
  | "enum"
  | "enumMember"
  | "module"
  | "variable"
  | "field"
  | "parameter"
  | "import"
  | "export"
  | "namespace"
  | "key"
  | "property"
  | "constant"
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "null"
  | "operator"
  | "event"
  | "label"
  | "directive"
  | "decorator"
  // Markup / document kinds
  | "document"
  | "section"
  | "heading"
  | "blockquote"
  | "list"
  | "listItem"
  | "link"
  | "image"
  | "codeBlock"
  | "element"
  | "attribute"
  | "doctype"
  | "entity"
  | "processingInstruction"
  | "cdata"
  // Data format kinds
  | "pair"
  | "mapping"
  | "sequence"
  | "table"
  | "arrayTable"
  // SQL / database kinds
  | "database"
  | "schema"
  | "view"
  | "index"
  | "trigger"
  | "procedure"
  | "column"
  | "other";
