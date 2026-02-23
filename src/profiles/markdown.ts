import type { LanguageProfile } from "../schema/profile.js";

/** Markdown language profile - Level 1 (Lexer) + Level 2 (Structure) */
export const markdown: LanguageProfile = {
  name: "markdown",
  displayName: "Markdown",
  version: "1.0.0",
  fileExtensions: [".md", ".markdown", ".mdx"],
  mimeTypes: ["text/markdown"],

  lexer: {
    tokenTypes: {
      heading: { category: "heading" },
      code_fence_open: { category: "meta", subcategory: "code-fence" },
      code_fence_close: { category: "meta", subcategory: "code-fence" },
      code_content: { category: "string", subcategory: "code" },
      code_language: { category: "identifier", subcategory: "language" },
      inline_code: { category: "string", subcategory: "inline-code" },
      bold: { category: "keyword", subcategory: "bold" },
      italic: { category: "keyword", subcategory: "italic" },
      link_text: { category: "link", subcategory: "text" },
      link_url: { category: "link", subcategory: "url" },
      image_marker: { category: "keyword", subcategory: "image" },
      list_marker: { category: "punctuation", subcategory: "list" },
      table_separator: { category: "punctuation", subcategory: "table-separator" },
      table_row: { category: "meta", subcategory: "table-row" },
      blockquote: { category: "punctuation", subcategory: "blockquote" },
      hr: { category: "punctuation", subcategory: "hr" },
      html_tag: { category: "tag" },
      text: { category: "plain" },
      whitespace: { category: "whitespace" },
      newline: { category: "newline" },
    },
    initialState: "default",
    skipTokens: [],
    states: {
      default: {
        rules: [
          // Fenced code block open (``` or ~~~)
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: ["```", "~~~"] },
                {
                  kind: "charSequence",
                  first: { predefined: "letter" },
                  rest: {
                    union: [{ predefined: "alphanumeric" }, { chars: "-_+." }],
                  },
                },
              ],
            },
            token: "code_fence_open",
            push: "code_block",
          },
          // Fenced code block without language
          {
            match: { kind: "string", value: ["```", "~~~"] },
            token: "code_fence_open",
            push: "code_block",
          },
          // Headings (# through ######)
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: ["######", "#####", "####", "###", "##", "#"] },
                { kind: "charSequence", first: { predefined: "whitespace" } },
              ],
            },
            token: "heading",
          },
          // Inline code
          {
            match: {
              kind: "delimited",
              open: "``",
              close: "``",
            },
            token: "inline_code",
          },
          {
            match: {
              kind: "delimited",
              open: "`",
              close: "`",
            },
            token: "inline_code",
          },
          // Bold
          {
            match: {
              kind: "delimited",
              open: "**",
              close: "**",
            },
            token: "bold",
          },
          {
            match: {
              kind: "delimited",
              open: "__",
              close: "__",
            },
            token: "bold",
          },
          // Italic
          {
            match: {
              kind: "delimited",
              open: "*",
              close: "*",
            },
            token: "italic",
          },
          {
            match: {
              kind: "delimited",
              open: "_",
              close: "_",
            },
            token: "italic",
          },
          // Image
          {
            match: { kind: "string", value: "![" },
            token: "image_marker",
          },
          // Link text [text](url)
          {
            match: {
              kind: "delimited",
              open: "[",
              close: "]",
            },
            token: "link_text",
          },
          {
            match: {
              kind: "delimited",
              open: "(",
              close: ")",
            },
            token: "link_url",
          },
          // Horizontal rule
          {
            match: { kind: "string", value: ["---", "***", "___"] },
            token: "hr",
          },
          // Table separator row
          {
            match: {
              kind: "pattern",
              regex: "\\|?\\s*:?-{3,}:?\\s*(?:\\|\\s*:?-{3,}:?\\s*)+\\|?",
            },
            token: "table_separator",
          },
          // Table row
          {
            match: {
              kind: "pattern",
              regex: "\\|[^\\n]*\\|",
            },
            token: "table_row",
          },
          // Blockquote
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: ">" },
                {
                  kind: "charSequence",
                  first: { predefined: "whitespace" },
                },
              ],
            },
            token: "blockquote",
          },
          // Unordered list markers
          {
            match: {
              kind: "sequence",
              elements: [
                { kind: "string", value: ["-", "*", "+"] },
                {
                  kind: "charSequence",
                  first: { predefined: "whitespace" },
                },
              ],
            },
            token: "list_marker",
          },
          // Ordered list markers (1. 2. etc.)
          {
            match: {
              kind: "sequence",
              elements: [
                {
                  kind: "charSequence",
                  first: { predefined: "digit" },
                  rest: { predefined: "digit" },
                },
                { kind: "string", value: "." },
                {
                  kind: "charSequence",
                  first: { predefined: "whitespace" },
                },
              ],
            },
            token: "list_marker",
          },
          // HTML inline tags
          {
            match: {
              kind: "pattern",
              regex: "</?[a-zA-Z][a-zA-Z0-9-]*[^>]*>",
            },
            token: "html_tag",
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
          // Text (any remaining content)
          {
            match: {
              kind: "charSequence",
              first: {
                negate: {
                  union: [
                    { predefined: "whitespace" },
                    { predefined: "newline" },
                  ],
                },
              },
              rest: {
                negate: {
                  union: [
                    { chars: "`*_[](!)#>-+" },
                    { predefined: "newline" },
                  ],
                },
              },
            },
            token: "text",
          },
        ],
      },
      code_block: {
        rules: [
          // Close fence
          {
            match: { kind: "string", value: ["```", "~~~"] },
            token: "code_fence_close",
            pop: true,
          },
          // Code content (any line)
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
            token: "code_content",
          },
        ],
      },
    },
  },

  structure: {
    blocks: [],
    symbols: [
      {
        name: "heading",
        kind: "heading",
        pattern: [{ token: "heading", capture: "name" }],
        hasBody: false,
      },
      {
        name: "code_block",
        kind: "codeBlock",
        pattern: [{ token: "code_fence_open", capture: "name" }],
        hasBody: true,
        bodyStyle: "markup-block",
      },
      {
        name: "code_span",
        kind: "codeBlock",
        pattern: [{ token: "inline_code", capture: "name" }],
        hasBody: false,
      },
      {
        name: "list_item",
        kind: "listItem",
        pattern: [{ token: "list_marker", capture: "name" }],
        hasBody: true,
        bodyStyle: "markup-block",
      },
      {
        name: "table",
        kind: "table",
        pattern: [{ token: "table_row", capture: "name" }],
        hasBody: true,
        bodyStyle: "markup-block",
      },
      {
        name: "blockquote",
        kind: "blockquote",
        pattern: [{ token: "blockquote", capture: "name" }],
        hasBody: true,
        bodyStyle: "markup-block",
      },
      {
        name: "link",
        kind: "link",
        pattern: [{ token: "link_url", capture: "name" }],
        hasBody: false,
      },
      {
        name: "image",
        kind: "image",
        pattern: [{ token: "image_marker", capture: "name" }],
        hasBody: false,
      },
    ],
  },

  embeddedLanguages: [
    {
      language: "javascript",
      start: { token: "code_fence_open", value: "```javascript" },
      end: { token: "code_fence_close" },
      languageDetection: "attribute",
      attributeToken: "code_language",
    },
  ],
};
