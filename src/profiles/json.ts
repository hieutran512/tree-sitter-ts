import type { LanguageProfile } from "../schema/profile.js";

/** JSON language profile - Level 1 (Lexer) + Level 2 (Structure) + Level 3 (Grammar) */
export const json: LanguageProfile = {
  name: "json",
  displayName: "JSON",
  version: "1.0.0",
  fileExtensions: [".json"],
  mimeTypes: ["application/json"],

  lexer: {
    tokenTypes: {
      string: { category: "string" },
      number: { category: "number" },
      constant: { category: "constant" },
      punctuation: { category: "punctuation" },
      whitespace: { category: "whitespace" },
      newline: { category: "newline" },
    },
    initialState: "default",
    skipTokens: ["whitespace", "newline"],
    states: {
      default: {
        rules: [
          // Strings
          {
            match: { kind: "delimited", open: '"', close: '"', escape: "\\" },
            token: "string",
          },
          // Numbers
          {
            match: {
              kind: "number",
              integer: true,
              float: true,
              scientific: true,
            },
            token: "number",
          },
          // Constants: true, false, null
          {
            match: { kind: "keywords", words: ["true", "false", "null"] },
            token: "constant",
          },
          // Punctuation
          {
            match: {
              kind: "string",
              value: ["{", "}", "[", "]", ":", ","],
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
      { name: "object", open: "{", close: "}" },
      { name: "array", open: "[", close: "]" },
    ],
    symbols: [],
  },

  grammar: {
    entry: "value",
    rules: {
      value: {
        alternatives: [
          [{ rule: "object" }],
          [{ rule: "array" }],
          [{ token: "string" }],
          [{ token: "number" }],
          [{ token: "constant" }],
        ],
      },
      object: {
        alternatives: [
          [
            { token: "punctuation", value: "{" },
            {
              optional: {
                repeat: [{ rule: "pair" }],
                min: 1,
                separator: { token: "punctuation", value: "," },
              },
            },
            { token: "punctuation", value: "}" },
          ],
        ],
      },
      pair: {
        alternatives: [
          [
            { token: "string", field: "key" },
            { token: "punctuation", value: ":" },
            { rule: "value", field: "value" },
          ],
        ],
      },
      array: {
        alternatives: [
          [
            { token: "punctuation", value: "[" },
            {
              optional: {
                repeat: [{ rule: "value" }],
                min: 1,
                separator: { token: "punctuation", value: "," },
              },
            },
            { token: "punctuation", value: "]" },
          ],
        ],
      },
    },
    recovery: [
      { context: "object", syncTokens: ["}", ","] },
      { context: "array", syncTokens: ["]", ","] },
    ],
  },
};
