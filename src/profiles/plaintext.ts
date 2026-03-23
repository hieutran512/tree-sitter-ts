import type { LanguageProfile } from "../schema/profile.js";

/**
 * Plain text profile – a minimal fallback used when the requested language
 * is unknown or empty.  It splits the input into whitespace, newlines, and
 * runs of non-whitespace text without any language-specific tokenization.
 */
export const plaintext: LanguageProfile = {
  name: "plaintext",
  displayName: "Plain Text",
  version: "1.0.0",
  fileExtensions: [".txt"],
  lexer: {
    charClasses: {},
    tokenTypes: {
      text: { category: "plain" },
      whitespace: { category: "whitespace" },
      newline: { category: "newline" },
    },
    initialState: "default",
    skipTokens: ["whitespace", "newline"],
    states: {
      default: {
        rules: [
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
          {
            match: {
              kind: "charSequence",
              first: { predefined: "any" },
              rest: { negate: { predefined: "newline" } },
            },
            token: "text",
          },
        ],
      },
    },
  },
};
