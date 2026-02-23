import type { LanguageProfile } from "../schema/profile.js";

/** CSS language profile - Level 1 (Lexer) + Level 2 (Structure) */
export const css: LanguageProfile = {
  name: "css",
  displayName: "CSS",
  version: "1.0.0",
  fileExtensions: [".css"],
  mimeTypes: ["text/css"],

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
      property: { category: "identifier", subcategory: "property" },
      selector: { category: "tag", subcategory: "selector" },
      pseudo: { category: "keyword", subcategory: "pseudo" },
      identifier: { category: "identifier" },
      operator: { category: "operator" },
      punctuation: { category: "punctuation" },
      unit: { category: "keyword", subcategory: "unit" },
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
          // Strings
          {
            match: { kind: "delimited", open: '"', close: '"', escape: "\\" },
            token: "string",
          },
          {
            match: { kind: "delimited", open: "'", close: "'", escape: "\\" },
            token: "string",
          },
          // At-rules (@media, @keyframes, @import, etc.)
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
                "px",
                "em",
                "rem",
                "%",
                "vh",
                "vw",
                "vmin",
                "vmax",
                "ch",
                "ex",
                "cm",
                "mm",
                "in",
                "pt",
                "pc",
                "s",
                "ms",
                "deg",
                "rad",
                "grad",
                "turn",
                "fr",
                "dpi",
                "dpcm",
                "dppx",
              ],
            },
            token: "number",
          },
          // Keywords
          {
            match: {
              kind: "keywords",
              words: [
                "important",
                "inherit",
                "initial",
                "unset",
                "revert",
                "none",
                "auto",
                "normal",
                "bold",
                "italic",
                "solid",
                "dashed",
                "dotted",
                "block",
                "inline",
                "flex",
                "grid",
                "absolute",
                "relative",
                "fixed",
                "sticky",
                "static",
                "hidden",
                "visible",
                "scroll",
                "transparent",
              ],
            },
            token: "keyword",
          },
          // Pseudo-classes and pseudo-elements
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
          // !important
          {
            match: { kind: "string", value: "!" },
            token: "operator",
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
      { name: "block", open: "{", close: "}" },
      { name: "parens", open: "(", close: ")" },
      { name: "brackets", open: "[", close: "]" },
    ],
    symbols: [
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
