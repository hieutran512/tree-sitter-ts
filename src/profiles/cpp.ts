import type { LanguageProfile } from "../schema/profile.js";

/** C++ language profile - Level 1 (Lexer) + Level 2 (Structure) */
export const cpp: LanguageProfile = {
  name: "cpp",
  displayName: "C++",
  version: "1.0.0",
  fileExtensions: [".cpp", ".hpp", ".cc", ".hh", ".cxx", ".hxx", ".h"],
  mimeTypes: ["text/x-c++src"],

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
      type_keyword: { category: "type", subcategory: "builtin" },
      constant: { category: "constant" },
      identifier: { category: "identifier" },
      type_name: { category: "type" },
      preprocessor: { category: "meta", subcategory: "preprocessor" },
      string: { category: "string" },
      char_literal: { category: "string", subcategory: "char" },
      raw_string: { category: "string", subcategory: "raw" },
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
          // Preprocessor directives
          { match: { kind: "line", start: "#" }, token: "preprocessor" },
          // Raw strings R"delimiter(content)delimiter"
          {
            match: {
              kind: "pattern",
              regex: 'R"([^(\\s]*)\\([\\s\\S]*?\\)\\1"',
            },
            token: "raw_string",
          },
          // Regular strings
          {
            match: { kind: "delimited", open: '"', close: '"', escape: "\\" },
            token: "string",
          },
          // Character literals
          {
            match: { kind: "delimited", open: "'", close: "'", escape: "\\" },
            token: "char_literal",
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
              separator: "'",
              suffix: ["u", "U", "l", "L", "ll", "LL", "ul", "UL", "ull", "ULL", "f", "F"],
            },
            token: "number",
          },
          // C++ keywords
          {
            match: {
              kind: "keywords",
              words: [
                "alignas", "alignof", "and", "and_eq", "asm", "auto",
                "bitand", "bitor", "break", "case", "catch", "class",
                "compl", "concept", "const", "consteval", "constexpr",
                "constinit", "const_cast", "continue", "co_await",
                "co_return", "co_yield", "decltype", "default", "delete",
                "do", "dynamic_cast", "else", "enum", "explicit",
                "export", "extern", "for", "friend", "goto", "if",
                "inline", "mutable", "namespace", "new", "noexcept",
                "not", "not_eq", "operator", "or", "or_eq", "private",
                "protected", "public", "register", "reinterpret_cast",
                "requires", "return", "sizeof", "static", "static_assert",
                "static_cast", "struct", "switch", "template", "this",
                "throw", "try", "typedef", "typeid", "typename", "union",
                "using", "virtual", "volatile", "while", "xor", "xor_eq",
                "override", "final",
              ],
            },
            token: "keyword",
          },
          // Built-in types
          {
            match: {
              kind: "keywords",
              words: [
                "void", "bool", "char", "char8_t", "char16_t", "char32_t",
                "wchar_t", "short", "int", "long", "float", "double",
                "signed", "unsigned", "size_t", "ptrdiff_t", "nullptr_t",
                "int8_t", "int16_t", "int32_t", "int64_t",
                "uint8_t", "uint16_t", "uint32_t", "uint64_t",
              ],
            },
            token: "type_keyword",
          },
          // Constants
          {
            match: {
              kind: "keywords",
              words: ["true", "false", "nullptr", "NULL"],
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
                "<<=", ">>=", "<=>", "->*",
                "==", "!=", ">=", "<=", "&&", "||", "<<", ">>",
                "++", "--", "+=", "-=", "*=", "/=", "%=",
                "&=", "|=", "^=", "->", "::", ".*", "...",
              ],
            },
            token: "operator",
          },
          // Single-char operators
          {
            match: {
              kind: "string",
              value: ["+", "-", "*", "/", "%", "=", "!", "<", ">", "&", "|", "^", "~", "?", ":"],
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
          {
            anyOf: [
              { token: "type_keyword" },
              { token: "type_name" },
              { token: "identifier" },
            ],
          },
          { token: "identifier", capture: "name" },
          { token: "punctuation", value: "(" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "class_specifier",
        kind: "class",
        pattern: [
          { token: "keyword", value: "class" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "struct_specifier",
        kind: "class",
        pattern: [
          { token: "keyword", value: "struct" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "enum_specifier",
        kind: "enum",
        pattern: [
          { token: "keyword", value: "enum" },
          { optional: { token: "keyword", value: "class" } },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "namespace_definition",
        kind: "namespace",
        pattern: [
          { token: "keyword", value: "namespace" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "template_declaration",
        kind: "other",
        pattern: [
          { token: "keyword", value: "template" },
          { token: "operator", value: "<" },
        ],
        hasBody: false,
      },
      {
        name: "typedef_declaration",
        kind: "type",
        pattern: [{ token: "keyword", value: "typedef" }],
        hasBody: false,
      },
      {
        name: "using_declaration",
        kind: "type",
        pattern: [
          { token: "keyword", value: "using" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: false,
      },
    ],
    folding: [
      { open: { token: "punctuation", value: "{" }, close: { token: "punctuation", value: "}" } },
      { open: { token: "preprocessor" }, close: { token: "preprocessor" } },
    ],
  },
};
