import type { LanguageProfile } from "../schema/profile.js";

/** HTML language profile - Level 1 (Lexer) + Level 2 (Structure) + Embedded Languages */
export const html: LanguageProfile = {
  name: "html",
  displayName: "HTML",
  version: "1.0.0",
  fileExtensions: [".html", ".htm"],
  mimeTypes: ["text/html"],

  lexer: {
    charClasses: {
      tagNameChar: {
        union: [{ predefined: "alphanumeric" }, { chars: "-_" }],
      },
      attrNameChar: {
        union: [{ predefined: "alphanumeric" }, { chars: "-_:." }],
      },
    },
    tokenTypes: {
      comment: { category: "comment" },
      doctype: { category: "meta", subcategory: "doctype" },
      tag_open: { category: "tag" },
      tag_close: { category: "tag" },
      tag_self_close: { category: "tag" },
      tag_name: { category: "tag", subcategory: "name" },
      attr_name: { category: "attribute" },
      attr_eq: { category: "operator" },
      string: { category: "string" },
      text: { category: "plain" },
      entity: { category: "escape" },
      whitespace: { category: "whitespace" },
      newline: { category: "newline" },
    },
    initialState: "content",
    skipTokens: ["whitespace", "newline"],
    states: {
      content: {
        rules: [
          // HTML comments
          {
            match: {
              kind: "delimited",
              open: "<!--",
              close: "-->",
              multiline: true,
            },
            token: "comment",
          },
          // DOCTYPE
          {
            match: {
              kind: "pattern",
              regex: "<!DOCTYPE[^>]*>",
            },
            token: "doctype",
          },
          // Closing tag
          {
            match: { kind: "string", value: "</" },
            token: "tag_close",
            push: "tag",
          },
          // Opening tag
          {
            match: { kind: "string", value: "<" },
            token: "tag_open",
            push: "tag",
          },
          // HTML entities
          {
            match: {
              kind: "pattern",
              regex: "&(?:#[0-9]+|#x[0-9a-fA-F]+|[a-zA-Z]+);",
            },
            token: "entity",
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
          // Text content (any non-tag, non-entity content)
          {
            match: {
              kind: "charSequence",
              first: { negate: { chars: "<&" } },
              rest: { negate: { chars: "<&" } },
            },
            token: "text",
          },
        ],
      },
      tag: {
        rules: [
          // Self-closing tag end
          {
            match: { kind: "string", value: "/>" },
            token: "tag_self_close",
            pop: true,
          },
          // Tag end
          {
            match: { kind: "string", value: ">" },
            token: "tag_open",
            pop: true,
          },
          // Tag name
          {
            match: {
              kind: "charSequence",
              first: { predefined: "letter" },
              rest: { ref: "tagNameChar" },
            },
            token: "tag_name",
          },
          // Attribute name
          {
            match: {
              kind: "charSequence",
              first: { predefined: "letter" },
              rest: { ref: "attrNameChar" },
            },
            token: "attr_name",
          },
          // Attribute =
          { match: { kind: "string", value: "=" }, token: "attr_eq" },
          // Attribute values
          {
            match: { kind: "delimited", open: '"', close: '"', escape: "\\" },
            token: "string",
          },
          {
            match: { kind: "delimited", open: "'", close: "'", escape: "\\" },
            token: "string",
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
    blocks: [],
    symbols: [
      {
        name: "doctype",
        kind: "doctype",
        pattern: [{ token: "doctype", capture: "name" }],
        hasBody: false,
      },
      {
        name: "element",
        kind: "element",
        pattern: [
          { token: "tag_open", value: "<" },
          { token: "tag_name", capture: "name" },
        ],
        hasBody: false,
      },
      {
        name: "entity",
        kind: "entity",
        pattern: [{ token: "entity", capture: "name" }],
        hasBody: false,
      },
    ],
  },

  embeddedLanguages: [
    {
      language: "css",
      start: { token: "tag_name", value: "style" },
      end: { token: "tag_close" },
      languageDetection: "fixed",
    },
    {
      language: "javascript",
      start: { token: "tag_name", value: "script" },
      end: { token: "tag_close" },
      languageDetection: "attribute",
      attributeToken: "string",
    },
  ],
};
