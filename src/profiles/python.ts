import type { LanguageProfile } from "../schema/profile.js";

/** Python language profile - Level 1 (Lexer) + Level 2 (Structure) */
export const python: LanguageProfile = {
  name: "python",
  displayName: "Python",
  version: "1.0.0",
  fileExtensions: [".py", ".pyi", ".pyw"],
  mimeTypes: ["text/x-python"],

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
      decorator: { category: "decorator" },
      string: { category: "string" },
      fstring_start: { category: "string", subcategory: "fstring" },
      fstring_expr: { category: "punctuation", subcategory: "fstring" },
      number: { category: "number" },
      comment: { category: "comment" },
      operator: { category: "operator" },
      punctuation: { category: "punctuation" },
      indent: { category: "whitespace" },
      dedent: { category: "whitespace" },
      whitespace: { category: "whitespace" },
      newline: { category: "newline" },
    },
    initialState: "default",
    skipTokens: ["whitespace", "newline", "comment", "indent", "dedent"],
    indentation: {
      indentToken: "indent",
      dedentToken: "dedent",
      unit: "detect",
    },
    states: {
      default: {
        rules: [
          // Comments
          { match: { kind: "line", start: "#" }, token: "comment" },
          // Triple-quoted strings (must come before single-quoted)
          {
            match: {
              kind: "delimited",
              open: '"""',
              close: '"""',
              multiline: true,
              escape: "\\",
            },
            token: "string",
          },
          {
            match: {
              kind: "delimited",
              open: "'''",
              close: "'''",
              multiline: true,
              escape: "\\",
            },
            token: "string",
          },
          // F-string triple-quoted (consume whole thing for now)
          {
            match: {
              kind: "pattern",
              regex: '[fF]"""[\\s\\S]*?"""',
            },
            token: "string",
          },
          {
            match: {
              kind: "pattern",
              regex: "[fF]'''[\\s\\S]*?'''",
            },
            token: "string",
          },
          // F-string single-quoted
          {
            match: {
              kind: "pattern",
              regex: '[fF]"(?:\\\\.|[^"\\\\\\n])*"',
            },
            token: "string",
          },
          {
            match: {
              kind: "pattern",
              regex: "[fF]'(?:\\\\.|[^'\\\\\\n])*'",
            },
            token: "string",
          },
          // Raw strings
          {
            match: {
              kind: "pattern",
              regex: '[rRbB]{1,2}"(?:\\\\.|[^"\\\\])*"',
            },
            token: "string",
          },
          {
            match: {
              kind: "pattern",
              regex: "[rRbB]{1,2}'(?:\\\\.|[^'\\\\])*'",
            },
            token: "string",
          },
          // Regular strings
          {
            match: { kind: "delimited", open: '"', close: '"', escape: "\\" },
            token: "string",
          },
          {
            match: { kind: "delimited", open: "'", close: "'", escape: "\\" },
            token: "string",
          },
          // Decorators
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: "@" },
                {
                  kind: "charSequence",
                  first: { ref: "identStart" },
                  rest: {
                    union: [{ predefined: "alphanumeric" }, { chars: "_." }],
                  },
                },
              ],
            },
            token: "decorator",
          },
          // Numbers
          {
            match: {
              kind: "number",
              integer: true,
              float: true,
              hex: true,
              binary: true,
              octal: true,
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
                "and", "as", "assert", "async", "await", "break", "class",
                "continue", "def", "del", "elif", "else", "except",
                "finally", "for", "from", "global", "if", "import", "in",
                "is", "lambda", "nonlocal", "not", "or", "pass", "raise",
                "return", "try", "while", "with", "yield",
              ],
            },
            token: "keyword",
          },
          // Constants
          {
            match: {
              kind: "keywords",
              words: ["True", "False", "None"],
            },
            token: "constant",
          },
          // Built-in functions
          {
            match: {
              kind: "keywords",
              words: [
                "print", "len", "range", "int", "str", "float", "list",
                "dict", "set", "tuple", "type", "isinstance", "issubclass",
                "super", "property", "staticmethod", "classmethod",
                "enumerate", "zip", "map", "filter", "sorted", "reversed",
                "abs", "min", "max", "sum", "any", "all", "open", "input",
                "hasattr", "getattr", "setattr", "delattr", "vars", "dir",
              ],
            },
            token: "builtin",
          },
          // Type-like identifiers (PascalCase)
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
                "**=", "//=", "<<=", ">>=", "**", "//", "<<", ">>",
                "<=", ">=", "==", "!=", "+=", "-=", "*=", "/=",
                "%=", "&=", "|=", "^=", "->", ":=",
              ],
            },
            token: "operator",
          },
          // Single-char operators
          {
            match: {
              kind: "string",
              value: ["+", "-", "*", "/", "%", "=", "<", ">", "&", "|", "^", "~", "@"],
            },
            token: "operator",
          },
          // Punctuation
          {
            match: {
              kind: "string",
              value: ["{", "}", "(", ")", "[", "]", ":", ";", ",", "."],
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
      fstring_single: {
        rules: [
          // Expression hole
          {
            match: { kind: "string", value: "{" },
            token: "fstring_expr",
            push: "default",
          },
          // End of f-string
          {
            match: { kind: "string", value: ['"', "'"] },
            token: "fstring_start",
            pop: true,
          },
        ],
      },
      fstring_triple: {
        rules: [
          {
            match: { kind: "string", value: "{" },
            token: "fstring_expr",
            push: "default",
          },
          {
            match: { kind: "string", value: ['"""', "'''"] },
            token: "fstring_start",
            pop: true,
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
        name: "function_definition",
        kind: "function",
        pattern: [
          { token: "keyword", value: "def" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "indentation",
      },
      {
        name: "async_function_definition",
        kind: "function",
        pattern: [
          { token: "keyword", value: "async" },
          { token: "keyword", value: "def" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "indentation",
      },
      {
        name: "class_definition",
        kind: "class",
        pattern: [
          { token: "keyword", value: "class" },
          {
            anyOf: [
              { token: "identifier", capture: "name" },
              { token: "type_name", capture: "name" },
            ],
          },
        ],
        hasBody: true,
        bodyStyle: "indentation",
      },
      {
        name: "decorated_definition",
        kind: "other",
        pattern: [{ token: "decorator", capture: "name" }],
        hasBody: false,
      },
      {
        name: "import_statement",
        kind: "import",
        pattern: [{ token: "keyword", value: "import" }],
        hasBody: false,
      },
      {
        name: "import_from_statement",
        kind: "import",
        pattern: [
          { token: "keyword", value: "from" },
          { skip: true, maxTokens: 10 },
          { token: "keyword", value: "import" },
        ],
        hasBody: false,
      },
      {
        name: "assignment",
        kind: "variable",
        pattern: [
          { token: "identifier", capture: "name" },
          { token: "operator", value: "=" },
        ],
        hasBody: false,
      },
    ],
  },
};
