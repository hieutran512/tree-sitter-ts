import type { LanguageProfile } from "../schema/profile.js";

interface GenericCodeProfileOptions {
    name: string;
    displayName: string;
    fileExtensions: string[];
    mimeTypes?: string[];
    keywords?: string[];
    lineComment?: string;
    blockComment?: { open: string; close: string; nested?: boolean };
    stringDelimiters?: Array<'"' | "'" | "`">;
}

interface MarkupProfileOptions {
    name: string;
    displayName: string;
    fileExtensions: string[];
    mimeTypes?: string[];
}

/**
 * Generic, lexer-focused profile for common programming languages.
 * Prioritizes robust tokenization over deep grammar/structure.
 */
export function createGenericCodeProfile(
    options: GenericCodeProfileOptions,
): LanguageProfile {
    const {
        name,
        displayName,
        fileExtensions,
        mimeTypes,
        keywords = [],
        lineComment,
        blockComment,
        stringDelimiters = ['"', "'"],
    } = options;

    const rules: LanguageProfile["lexer"]["states"]["default"]["rules"] = [];

    if (blockComment) {
        rules.push({
            match: {
                kind: "delimited",
                open: blockComment.open,
                close: blockComment.close,
                multiline: true,
                nested: blockComment.nested ?? false,
            },
            token: "comment",
        });
    }

    if (lineComment) {
        rules.push({
            match: { kind: "line", start: lineComment },
            token: "comment",
        });
    }

    for (const delimiter of stringDelimiters) {
        rules.push({
            match: { kind: "delimited", open: delimiter, close: delimiter, escape: "\\" },
            token: "string",
        });
    }

    rules.push({
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
    });

    if (keywords.length > 0) {
        rules.push({
            match: { kind: "keywords", words: keywords },
            token: "keyword",
        });
    }

    rules.push(
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
                    "===",
                    "!==",
                    "==",
                    "!=",
                    "<=",
                    ">=",
                    "=>",
                    "->",
                    "::",
                    "&&",
                    "||",
                    "??",
                    "+",
                    "-",
                    "*",
                    "/",
                    "%",
                    "=",
                    "<",
                    ">",
                    "!",
                    "&",
                    "|",
                    "^",
                    "~",
                    "?",
                    ":",
                    ".",
                ],
            },
            token: "operator",
        },
        {
            match: {
                kind: "string",
                value: ["{", "}", "(", ")", "[", "]", ",", ";"],
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
        {
            match: {
                kind: "charSequence",
                first: { predefined: "any" },
                rest: { negate: { predefined: "newline" } },
            },
            token: "text",
        },
    );

    return {
        name,
        displayName,
        version: "1.0.0",
        fileExtensions,
        mimeTypes,
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
                comment: { category: "comment" },
                string: { category: "string" },
                number: { category: "number" },
                keyword: { category: "keyword" },
                identifier: { category: "identifier" },
                operator: { category: "operator" },
                punctuation: { category: "punctuation" },
                text: { category: "plain" },
                whitespace: { category: "whitespace" },
                newline: { category: "newline" },
            },
            initialState: "default",
            skipTokens: ["whitespace", "newline"],
            states: {
                default: {
                    rules,
                },
            },
        },
        structure: {
            blocks: [{ name: "braces", open: "{", close: "}" }],
            symbols: [],
        },
    };
}

/**
 * Generic XML-like markup profile.
 */
export function createMarkupProfile(options: MarkupProfileOptions): LanguageProfile {
    return {
        name: options.name,
        displayName: options.displayName,
        version: "1.0.0",
        fileExtensions: options.fileExtensions,
        mimeTypes: options.mimeTypes,
        lexer: {
            charClasses: {
                tagNameChar: {
                    union: [{ predefined: "alphanumeric" }, { chars: "-_:" }],
                },
            },
            tokenTypes: {
                comment: { category: "comment" },
                cdata: { category: "string", subcategory: "cdata" },
                processing: { category: "meta", subcategory: "processing" },
                tag_open: { category: "tag" },
                tag_close: { category: "tag" },
                tag_name: { category: "tag", subcategory: "name" },
                string: { category: "string" },
                operator: { category: "operator" },
                text: { category: "plain" },
                whitespace: { category: "whitespace" },
                newline: { category: "newline" },
            },
            initialState: "content",
            skipTokens: ["whitespace", "newline"],
            states: {
                content: {
                    rules: [
                        {
                            match: {
                                kind: "delimited",
                                open: "<!--",
                                close: "-->",
                                multiline: true,
                            },
                            token: "comment",
                        },
                        {
                            match: {
                                kind: "delimited",
                                open: "<![CDATA[",
                                close: "]]>",
                                multiline: true,
                            },
                            token: "cdata",
                        },
                        {
                            match: {
                                kind: "delimited",
                                open: "<?",
                                close: "?>",
                                multiline: true,
                            },
                            token: "processing",
                        },
                        {
                            match: { kind: "string", value: "</" },
                            token: "tag_close",
                            push: "tag",
                        },
                        {
                            match: { kind: "string", value: "<" },
                            token: "tag_open",
                            push: "tag",
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
                                first: { negate: { chars: "<" } },
                                rest: { negate: { chars: "<" } },
                            },
                            token: "text",
                        },
                    ],
                },
                tag: {
                    rules: [
                        {
                            match: { kind: "string", value: ["/>", ">"] },
                            token: "tag_open",
                            pop: true,
                        },
                        {
                            match: {
                                kind: "charSequence",
                                first: { predefined: "letter" },
                                rest: { ref: "tagNameChar" },
                            },
                            token: "tag_name",
                        },
                        {
                            match: { kind: "string", value: "=" },
                            token: "operator",
                        },
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
            symbols: [],
        },
    };
}

/**
 * Basic YAML profile.
 */
export function createYamlProfile(
    name: string,
    displayName: string,
    fileExtensions: string[],
    mimeTypes?: string[],
): LanguageProfile {
    return {
        name,
        displayName,
        version: "1.0.0",
        fileExtensions,
        mimeTypes,
        lexer: {
            charClasses: {
                keyStart: {
                    union: [{ predefined: "letter" }, { chars: "_-" }],
                },
                keyPart: {
                    union: [{ predefined: "alphanumeric" }, { chars: "_-." }],
                },
            },
            tokenTypes: {
                comment: { category: "comment" },
                key: { category: "identifier", subcategory: "key" },
                string: { category: "string" },
                number: { category: "number" },
                constant: { category: "constant" },
                indicator: { category: "punctuation" },
                indent: { category: "whitespace" },
                dedent: { category: "whitespace" },
                whitespace: { category: "whitespace" },
                newline: { category: "newline" },
                text: { category: "plain" },
            },
            initialState: "default",
            skipTokens: ["whitespace", "newline", "indent", "dedent"],
            indentation: {
                indentToken: "indent",
                dedentToken: "dedent",
                unit: "spaces",
                size: 2,
            },
            states: {
                default: {
                    rules: [
                        { match: { kind: "line", start: "#" }, token: "comment" },
                        { match: { kind: "string", value: ["---", "...", "-", ":", "?", "|"] }, token: "indicator" },
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
                                scientific: true,
                            },
                            token: "number",
                        },
                        {
                            match: {
                                kind: "keywords",
                                words: ["true", "false", "null", "yes", "no", "on", "off"],
                            },
                            token: "constant",
                        },
                        {
                            match: {
                                kind: "charSequence",
                                first: { ref: "keyStart" },
                                rest: { ref: "keyPart" },
                            },
                            token: "key",
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
            blocks: [],
            symbols: [],
        },
    };
}
