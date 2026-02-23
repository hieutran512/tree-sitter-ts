import type { LanguageProfile } from "../schema/profile.js";

export const toml: LanguageProfile = {
    name: "toml",
    displayName: "TOML",
    version: "1.0.0",
    fileExtensions: [".toml"],
    mimeTypes: ["application/toml", "text/toml"],
    lexer: {
        charClasses: {
            keyStart: {
                union: [{ predefined: "letter" }, { chars: "_-" }],
            },
            keyPart: {
                union: [{ predefined: "alphanumeric" }, { chars: "_-" }],
            },
        },
        tokenTypes: {
            comment: { category: "comment" },
            datetime: { category: "datetime" },
            key: { category: "key" },
            string: { category: "string" },
            number: { category: "number" },
            constant: { category: "constant" },
            operator: { category: "operator" },
            punctuation: { category: "punctuation" },
            whitespace: { category: "whitespace" },
            newline: { category: "newline" },
            text: { category: "plain" },
        },
        initialState: "default",
        skipTokens: ["whitespace", "newline"],
        states: {
            default: {
                rules: [
                    { match: { kind: "line", start: "#" }, token: "comment" },
                    {
                        match: {
                            kind: "pattern",
                            regex:
                                "\\b\\d{4}-\\d{2}-\\d{2}(?:[Tt ]\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?)?(?:[Zz]|[+-]\\d{2}:\\d{2})?\\b",
                        },
                        token: "datetime",
                    },
                    {
                        match: { kind: "delimited", open: '"""', close: '"""', multiline: true, escape: "\\" },
                        token: "string",
                    },
                    {
                        match: { kind: "delimited", open: "'''", close: "'''", multiline: true },
                        token: "string",
                    },
                    {
                        match: { kind: "delimited", open: '"', close: '"', escape: "\\" },
                        token: "string",
                    },
                    {
                        match: { kind: "delimited", open: "'", close: "'" },
                        token: "string",
                    },
                    {
                        match: {
                            kind: "number",
                            integer: true,
                            float: true,
                            scientific: true,
                            hex: true,
                            octal: true,
                            binary: true,
                            separator: "_",
                        },
                        token: "number",
                    },
                    {
                        match: {
                            kind: "keywords",
                            words: ["true", "false"],
                        },
                        token: "constant",
                    },
                    {
                        match: {
                            kind: "charSequence",
                            first: { ref: "keyStart" },
                            rest: {
                                union: [{ ref: "keyPart" }, { chars: "." }],
                            },
                        },
                        token: "key",
                    },
                    {
                        match: { kind: "string", value: "=" },
                        token: "operator",
                    },
                    {
                        match: { kind: "string", value: ["[[", "]]", "[", "]", "{", "}", ","] },
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
    structure: {
        blocks: [
            { name: "tables", open: "[", close: "]" },
            { name: "inline-table", open: "{", close: "}" },
            { name: "array", open: "[", close: "]" },
        ],
        symbols: [
            {
                name: "table",
                kind: "table",
                pattern: [
                    { token: "punctuation", value: "[" },
                    { token: "key", capture: "name" },
                    { token: "punctuation", value: "]" },
                ],
                hasBody: false,
            },
            {
                name: "array_table",
                kind: "arrayTable",
                pattern: [
                    { token: "punctuation", value: "[[" },
                    { token: "key", capture: "name" },
                    { token: "punctuation", value: "]]" },
                ],
                hasBody: false,
            },
            {
                name: "key_value",
                kind: "pair",
                pattern: [
                    { token: "key", capture: "name" },
                    { token: "operator", value: "=" },
                ],
                hasBody: false,
            },
        ],
    },
};
