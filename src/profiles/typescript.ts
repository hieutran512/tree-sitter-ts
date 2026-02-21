import type { LanguageProfile } from "../schema/profile.js";

/**
 * TypeScript language profile - extends JavaScript.
 * Adds type annotations, generics, interfaces, enums, decorators, etc.
 * Level 1 (Lexer) + Level 2 (Structure)
 */
export const typescript: LanguageProfile = {
  name: "typescript",
  displayName: "TypeScript",
  version: "1.0.0",
  fileExtensions: [".ts", ".mts", ".cts", ".tsx"],
  mimeTypes: ["text/typescript", "application/typescript"],
  extends: "javascript",

  lexer: {
    charClasses: {
      identStart: {
        union: [{ predefined: "letter" }, { chars: "_$" }],
      },
      identPart: {
        union: [{ predefined: "alphanumeric" }, { chars: "_$" }],
      },
    },
    tokenTypes: {
      keyword: { category: "keyword" },
      ts_keyword: { category: "keyword", subcategory: "typescript" },
      constant: { category: "constant" },
      identifier: { category: "identifier" },
      type_name: { category: "type" },
      decorator: { category: "decorator" },
      string: { category: "string" },
      template_start: { category: "string", subcategory: "template" },
      template_content: { category: "string", subcategory: "template" },
      template_expr_open: {
        category: "punctuation",
        subcategory: "template",
      },
      template_end: { category: "string", subcategory: "template" },
      number: { category: "number" },
      comment: { category: "comment" },
      operator: { category: "operator" },
      punctuation: { category: "punctuation" },
      jsx_tag_open: { category: "tag" },
      jsx_tag_close: { category: "tag" },
      jsx_tag_end: { category: "tag" },
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
          // Template strings
          {
            match: { kind: "string", value: "`" },
            token: "template_start",
            push: "template_string",
          },
          // Strings
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
                    union: [{ predefined: "alphanumeric" }, { chars: "_$." }],
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
          // TypeScript-specific keywords
          {
            match: {
              kind: "keywords",
              words: [
                "interface", "type", "enum", "namespace", "module",
                "declare", "abstract", "implements", "readonly",
                "public", "private", "protected", "override",
                "keyof", "infer", "is", "asserts", "satisfies",
                "as", "unknown", "never", "any",
              ],
            },
            token: "ts_keyword",
          },
          // JavaScript keywords
          {
            match: {
              kind: "keywords",
              words: [
                "break", "case", "catch", "class", "const", "continue",
                "debugger", "default", "delete", "do", "else", "export",
                "extends", "finally", "for", "function", "if", "import",
                "in", "instanceof", "let", "new", "return", "super",
                "switch", "this", "throw", "try", "typeof", "var",
                "void", "while", "with", "yield", "async", "await", "of",
                "static", "get", "set", "from",
              ],
            },
            token: "keyword",
          },
          // Constants
          {
            match: {
              kind: "keywords",
              words: ["true", "false", "null", "undefined", "NaN", "Infinity"],
            },
            token: "constant",
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
                ">>>=", "<<=", ">>=", "**=", "&&=", "||=", "??=",
                "===", "!==", ">>>", "...",
                "==", "!=", ">=", "<=", "&&", "||", "??", "?.",
                "**", "++", "--", "+=", "-=", "*=", "/=", "%=",
                "&=", "|=", "^=", "=>", "<<", ">>",
              ],
            },
            token: "operator",
          },
          // Single-char operators
          {
            match: {
              kind: "string",
              value: [
                "+", "-", "*", "/", "%", "=", "!", "<", ">",
                "&", "|", "^", "~", "?", ":",
              ],
            },
            token: "operator",
          },
          // Punctuation
          {
            match: {
              kind: "string",
              value: ["{", "}", "(", ")", "[", "]", ";", ",", "."],
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
      template_string: {
        rules: [
          {
            match: { kind: "string", value: "${" },
            token: "template_expr_open",
            push: "template_expr",
          },
          {
            match: { kind: "string", value: "`" },
            token: "template_end",
            pop: true,
          },
        ],
      },
      template_expr: {
        rules: [
          {
            match: { kind: "string", value: "}" },
            token: "punctuation",
            pop: true,
          },
          {
            match: { kind: "string", value: "`" },
            token: "template_start",
            push: "template_string",
          },
          {
            match: {
              kind: "delimited",
              open: "/*",
              close: "*/",
              multiline: true,
            },
            token: "comment",
          },
          { match: { kind: "line", start: "//" }, token: "comment" },
          {
            match: { kind: "delimited", open: '"', close: '"', escape: "\\" },
            token: "string",
          },
          {
            match: { kind: "delimited", open: "'", close: "'", escape: "\\" },
            token: "string",
          },
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
          {
            match: {
              kind: "keywords",
              words: [
                "break", "case", "catch", "class", "const", "continue",
                "delete", "do", "else", "export", "extends", "finally",
                "for", "function", "if", "import", "in", "instanceof",
                "let", "new", "return", "super", "switch", "this",
                "throw", "try", "typeof", "var", "void", "while",
                "with", "yield", "async", "await", "of",
                "interface", "type", "enum", "as", "keyof",
              ],
            },
            token: "keyword",
          },
          {
            match: {
              kind: "keywords",
              words: ["true", "false", "null", "undefined"],
            },
            token: "constant",
          },
          {
            match: {
              kind: "charSequence",
              first: { ref: "identStart" },
              rest: { ref: "identPart" },
            },
            token: "identifier",
          },
          {
            match: {
              kind: "string",
              value: [
                "===", "!==", "==", "!=", ">=", "<=", "&&", "||", "??",
                "?.", "**", "++", "--", "+=", "-=", "*=", "/=", "%=",
                "=>", "<<", ">>", ">>>", "...",
              ],
            },
            token: "operator",
          },
          {
            match: {
              kind: "string",
              value: ["+", "-", "*", "/", "%", "=", "!", "<", ">", "&", "|", "^", "~", "?", ":"],
            },
            token: "operator",
          },
          {
            match: {
              kind: "string",
              value: ["{", "(", ")", "[", "]", ";", ",", "."],
            },
            token: "punctuation",
          },
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
          { token: "keyword", value: "function" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "async_function_declaration",
        kind: "function",
        pattern: [
          { token: "keyword", value: "async" },
          { token: "keyword", value: "function" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "class_declaration",
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
        bodyStyle: "braces",
      },
      {
        name: "abstract_class_declaration",
        kind: "class",
        pattern: [
          { token: "ts_keyword", value: "abstract" },
          { token: "keyword", value: "class" },
          {
            anyOf: [
              { token: "identifier", capture: "name" },
              { token: "type_name", capture: "name" },
            ],
          },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "interface_declaration",
        kind: "interface",
        pattern: [
          { token: "ts_keyword", value: "interface" },
          { token: "type_name", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "type_alias_declaration",
        kind: "type",
        pattern: [
          { token: "ts_keyword", value: "type" },
          { token: "type_name", capture: "name" },
        ],
        hasBody: false,
      },
      {
        name: "enum_declaration",
        kind: "enum",
        pattern: [
          { token: "ts_keyword", value: "enum" },
          {
            anyOf: [
              { token: "identifier", capture: "name" },
              { token: "type_name", capture: "name" },
            ],
          },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "namespace_declaration",
        kind: "namespace",
        pattern: [
          { token: "ts_keyword", value: "namespace" },
          {
            anyOf: [
              { token: "identifier", capture: "name" },
              { token: "type_name", capture: "name" },
            ],
          },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "arrow_function_const",
        kind: "function",
        pattern: [
          { token: "keyword", value: "const" },
          { token: "identifier", capture: "name" },
          { token: "operator", value: "=" },
          { skip: true, maxTokens: 50 },
          { token: "operator", value: "=>" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "lexical_declaration",
        kind: "variable",
        pattern: [
          {
            anyOf: [
              { token: "keyword", value: "const" },
              { token: "keyword", value: "let" },
            ],
          },
          { token: "identifier", capture: "name" },
        ],
        hasBody: false,
      },
      {
        name: "variable_declaration",
        kind: "variable",
        pattern: [
          { token: "keyword", value: "var" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: false,
      },
      {
        name: "import_statement",
        kind: "import",
        pattern: [{ token: "keyword", value: "import" }],
        hasBody: false,
      },
      {
        name: "export_statement",
        kind: "export",
        pattern: [{ token: "keyword", value: "export" }],
        hasBody: false,
      },
    ],
    folding: [
      { open: { token: "punctuation", value: "{" }, close: { token: "punctuation", value: "}" } },
    ],
  },
};
