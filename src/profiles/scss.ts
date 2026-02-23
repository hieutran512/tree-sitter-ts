import type { LanguageProfile } from "../schema/profile.js";

/** SCSS language profile - extends CSS with nesting, variables, mixins */
export const scss: LanguageProfile = {
  name: "scss",
  displayName: "SCSS",
  version: "1.0.0",
  fileExtensions: [".scss"],
  mimeTypes: ["text/x-scss"],
  extends: "css",

  lexer: {
    charClasses: {
      identStart: {
        union: [{ predefined: "letter" }, { chars: "_-" }],
      },
      identPart: {
        union: [{ predefined: "alphanumeric" }, { chars: "_-" }],
      },
    },
    tokenTypes: {
      comment: { category: "comment" },
      string: { category: "string" },
      number: { category: "number" },
      color: { category: "constant", subcategory: "color" },
      keyword: { category: "keyword" },
      at_rule: { category: "keyword", subcategory: "at-rule" },
      variable: { category: "variable" },
      interpolation: { category: "punctuation", subcategory: "interpolation" },
      pseudo: { category: "keyword", subcategory: "pseudo" },
      identifier: { category: "identifier" },
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
          // Line comments (SCSS-specific)
          { match: { kind: "line", start: "//" }, token: "comment" },
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
          // Strings
          {
            match: { kind: "delimited", open: '"', close: '"', escape: "\\" },
            token: "string",
          },
          {
            match: { kind: "delimited", open: "'", close: "'", escape: "\\" },
            token: "string",
          },
          // Interpolation #{...}
          {
            match: { kind: "string", value: "#{" },
            token: "interpolation",
            push: "interpolation",
          },
          // SCSS variables ($variable)
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: "$" },
                {
                  kind: "charSequence",
                  first: {
                    union: [{ predefined: "letter" }, { chars: "_" }],
                  },
                  rest: { ref: "identPart" },
                },
              ],
            },
            token: "variable",
          },
          // At-rules (@mixin, @include, @extend, @import, @use, @forward, etc.)
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: "@" },
                {
                  kind: "charSequence",
                  first: { predefined: "letter" },
                  rest: { ref: "identPart" },
                },
              ],
            },
            token: "at_rule",
          },
          // Hex colors
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: "#" },
                {
                  kind: "charSequence",
                  first: { predefined: "hexDigit" },
                  rest: { predefined: "hexDigit" },
                },
              ],
            },
            token: "color",
          },
          // Numbers with units
          {
            match: {
              kind: "number",
              integer: true,
              float: true,
              suffix: [
                "px", "em", "rem", "%", "vh", "vw", "vmin", "vmax",
                "ch", "ex", "s", "ms", "deg", "rad", "fr",
              ],
            },
            token: "number",
          },
          // Keywords
          {
            match: {
              kind: "keywords",
              words: [
                "important", "inherit", "initial", "unset", "none", "auto",
                "true", "false", "null", "and", "or", "not", "from", "through", "to",
              ],
            },
            token: "keyword",
          },
          // Pseudo selectors
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: "::" },
                {
                  kind: "charSequence",
                  first: { predefined: "letter" },
                  rest: { ref: "identPart" },
                },
              ],
            },
            token: "pseudo",
          },
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: ":" },
                {
                  kind: "charSequence",
                  first: { predefined: "letter" },
                  rest: { ref: "identPart" },
                },
              ],
            },
            token: "pseudo",
          },
          // & (parent selector)
          { match: { kind: "string", value: "&" }, token: "operator" },
          // Identifiers
          {
            match: {
              kind: "charSequence",
              first: { ref: "identStart" },
              rest: { ref: "identPart" },
            },
            token: "identifier",
          },
          // Operators
          {
            match: {
              kind: "string",
              value: ["+", ">", "~", "*", "=", "^=", "$=", "*=", "|=", "~="],
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
          { match: { kind: "string", value: "!" }, token: "operator" },
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
      interpolation: {
        rules: [
          {
            match: { kind: "string", value: "}" },
            token: "interpolation",
            pop: true,
          },
          // Inside interpolation, use same rules as default
          // (the engine will fall through to default state rules)
        ],
      },
    },
  },

  structure: {
    blocks: [
      { name: "block", open: "{", close: "}" },
      { name: "parens", open: "(", close: ")" },
    ],
    symbols: [
      {
        name: "mixin_declaration",
        kind: "function",
        pattern: [
          { token: "at_rule", value: "@mixin" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "function_declaration",
        kind: "function",
        pattern: [
          { token: "at_rule", value: "@function" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
      {
        name: "at_rule",
        kind: "directive",
        pattern: [{ token: "at_rule", capture: "name" }],
        hasBody: true,
        bodyStyle: "braces",
      },
    ],
    folding: [
      { open: { token: "punctuation", value: "{" }, close: { token: "punctuation", value: "}" } },
    ],
  },
};
