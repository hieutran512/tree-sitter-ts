import type { LanguageProfile } from "../schema/profile.js";

/** Go language profile - Level 1 (Lexer) + Level 2 (Structure) */
export const go: LanguageProfile = {
  name: "go",
  displayName: "Go",
  version: "1.0.0",
  fileExtensions: [".go"],
  mimeTypes: ["text/x-go"],

  lexer: {
    charClasses: {
      identStart: {
        union: [{ predefined: "letter" }, { chars: "_" }],
      },
      identPart: {
        union: [{ predefined: "alphanumeric" }, { chars: "_" }],
      },
    },
    tokenTypes: {
      keyword: { category: "keyword" },
      constant: { category: "constant" },
      builtin: { category: "keyword", subcategory: "builtin" },
      identifier: { category: "identifier" },
      type_name: { category: "type" },
      type_keyword: { category: "type", subcategory: "builtin" },
      string: { category: "string" },
      rune: { category: "string", subcategory: "rune" },
      number: { category: "number" },
      comment: { category: "comment" },
      operator: { category: "operator" },
      punctuation: { category: "punctuation" },
      whitespace: { category: "whitespace" },
      newline: { category: "newline" },
    },
    initialState: "default",
    skipTokens: ["whitespace", "newline", "comment"],
    states: {
      default: {
        rules: [
          // Block comments
          {
            match: {
              kind: "delimited",
              open: "/*",
              close: "*/",
              multiline: true,
            },
            token: "comment",
          },
          // Line comments
          { match: { kind: "line", start: "//" }, token: "comment" },
          // Raw strings (backtick)
          {
            match: {
              kind: "delimited",
              open: "`",
              close: "`",
              multiline: true,
            },
            token: "string",
          },
          // Interpreted strings
          {
            match: { kind: "delimited", open: '"', close: '"', escape: "\\" },
            token: "string",
          },
          // Rune literals
          {
            match: { kind: "delimited", open: "'", close: "'", escape: "\\" },
            token: "rune",
          },
          // Numbers
          {
            match: {
              kind: "number",
              integer: true,
              float: true,
              hex: true,
              octal: true,
              binary: true,
              scientific: true,
              separator: "_",
            },
            token: "number",
          },
          // Keywords
          {
            match: {
              kind: "keywords",
              words: [
                "break", "case", "chan", "const", "continue", "default",
                "defer", "else", "fallthrough", "for", "func", "go",
                "goto", "if", "import", "interface", "map", "package",
                "range", "return", "select", "struct", "switch", "type",
                "var",
              ],
            },
            token: "keyword",
          },
          // Constants
          {
            match: {
              kind: "keywords",
              words: ["true", "false", "nil", "iota"],
            },
            token: "constant",
          },
          // Built-in functions
          {
            match: {
              kind: "keywords",
              words: [
                "append", "cap", "clear", "close", "complex", "copy",
                "delete", "imag", "len", "make", "max", "min", "new",
                "panic", "print", "println", "real", "recover",
              ],
            },
            token: "builtin",
          },
          // Built-in types
          {
            match: {
              kind: "keywords",
              words: [
                "bool", "byte", "complex64", "complex128", "error",
                "float32", "float64", "int", "int8", "int16", "int32",
                "int64", "rune", "string", "uint", "uint8", "uint16",
                "uint32", "uint64", "uintptr", "any", "comparable",
              ],
            },
            token: "type_keyword",
          },
          // Type-like identifiers (PascalCase / exported)
          {
            match: {
              kind: "charSequence",
              first: { range: ["A", "Z"] },
              rest: { ref: "identPart" },
            },
            token: "type_name",
          },
          // Identifiers
          {
            match: {
              kind: "charSequence",
              first: { ref: "identStart" },
              rest: { ref: "identPart" },
            },
            token: "identifier",
          },
          // Multi-char operators
          {
            match: {
              kind: "string",
              value: [
                ":=", "<-", "<<", ">>", "&^", "&&", "||",
                "<=", ">=", "==", "!=", "+=", "-=", "*=", "/=",
                "%=", "&=", "|=", "^=", "<<=", ">>=", "&^=",
                "++", "--", "...",
              ],
            },
            token: "operator",
          },
          // Single-char operators
          {
            match: {
              kind: "string",
              value: ["+", "-", "*", "/", "%", "=", "<", ">", "&", "|", "^", "!", "~"],
            },
            token: "operator",
          },
          // Punctuation
          {
            match: {
              kind: "string",
              value: ["{", "}", "(", ")", "[", "]", ";", ":", ",", "."],
            },
            token: "punctuation",
          },
          // Whitespace
          {
            match: {
              kind: "charSequence",
              first: { predefined: "whitespace" },
              rest: { predefined: "whitespace" },
            },
            token: "whitespace",
          },
          {
            match: { kind: "charSequence", first: { predefined: "newline" } },
            token: "newline",
          },
        ],
      },
    },
  },

  structure: {
    blocks: [
      { name: "braces", open: "{", close: "}" },
      { name: "parens", open: "(", close: ")" },
      { name: "brackets", open: "[", close: "]" },
    ],
    symbols: [
      {
        name: "function_declaration",
        kind: "function",
        pattern: [
          { token: "keyword", value: "func" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "method_declaration",
        kind: "method",
        pattern: [
          { token: "keyword", value: "func" },
          { token: "punctuation", value: "(" },
          { skip: true, maxTokens: 10 },
          { token: "punctuation", value: ")" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "type_declaration",
        kind: "type",
        pattern: [
          { token: "keyword", value: "type" },
          { token: "type_name", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "interface_declaration",
        kind: "interface",
        pattern: [
          { token: "keyword", value: "type" },
          { token: "type_name", capture: "name" },
          { token: "keyword", value: "interface" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "struct_declaration",
        kind: "class",
        pattern: [
          { token: "keyword", value: "type" },
          { token: "type_name", capture: "name" },
          { token: "keyword", value: "struct" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "import_declaration",
        kind: "import",
        pattern: [{ token: "keyword", value: "import" }],
        hasBody: false,
      },
      {
        name: "var_declaration",
        kind: "variable",
        pattern: [
          { token: "keyword", value: "var" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: false,
      },
      {
        name: "const_declaration",
        kind: "constant",
        pattern: [
          { token: "keyword", value: "const" },
          {
            anyOf: [
              { token: "identifier", capture: "name" },
              { token: "punctuation", value: "(" },
            ],
          },
        ],
        hasBody: false,
      },
    ],
    folding: [
      { open: { token: "punctuation", value: "{" }, close: { token: "punctuation", value: "}" } },
    ],
  },
};
