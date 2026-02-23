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

    const keywordSet = new Set(keywords.map((keyword) => keyword.toLowerCase()));

    const classKeywords = ["class", "object"];
    const structKeywords = ["struct"];
    const interfaceKeywords = ["interface", "trait", "protocol"];
    const enumKeywords = ["enum"];
    const functionKeywords = ["function", "fn", "def", "fun", "func", "sub"];
    const packageKeywords = ["package"];
    const namespaceKeywords = ["namespace"];
    const moduleKeywords = ["module", "mod"];
    const typeKeywords = ["type", "typealias", "typedef"];
    const variableKeywords = ["var", "let", "val"];
    const constantKeywords = ["const", "readonly"];
    const importKeywords = ["import", "use", "require", "require_once", "include", "include_once", "using"];
    const exportKeywords = ["export"];
    const sqlObjectKeywords = [
        "table",
        "view",
        "function",
        "procedure",
        "trigger",
        "index",
        "schema",
        "database",
    ];

    const availableClassKeywords = classKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableStructKeywords = structKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableInterfaceKeywords = interfaceKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableEnumKeywords = enumKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableFunctionKeywords = functionKeywords.filter((keyword) => keywordSet.has(keyword));
    const availablePackageKeywords = packageKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableNamespaceKeywords = namespaceKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableModuleKeywords = moduleKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableTypeKeywords = typeKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableVariableKeywords = variableKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableConstantKeywords = constantKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableImportKeywords = importKeywords.filter((keyword) => keywordSet.has(keyword));
    const availableExportKeywords = exportKeywords.filter((keyword) => keywordSet.has(keyword));
    const hasSqlCreate = keywordSet.has("create") && sqlObjectKeywords.some((keyword) => keywordSet.has(keyword));

    const symbols: NonNullable<LanguageProfile["structure"]>["symbols"] = [];

    if (availableClassKeywords.length > 0) {
        symbols.push({
            name: "class_declaration",
            kind: "class",
            pattern: [
                {
                    anyOf: availableClassKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableStructKeywords.length > 0) {
        symbols.push({
            name: "struct_declaration",
            kind: "struct",
            pattern: [
                {
                    anyOf: availableStructKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableInterfaceKeywords.length > 0) {
        symbols.push({
            name: "interface_declaration",
            kind: "interface",
            pattern: [
                {
                    anyOf: availableInterfaceKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableEnumKeywords.length > 0) {
        symbols.push({
            name: "enum_declaration",
            kind: "enum",
            pattern: [
                {
                    anyOf: availableEnumKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableFunctionKeywords.length > 0) {
        symbols.push({
            name: "function_declaration",
            kind: "function",
            pattern: [
                {
                    anyOf: availableFunctionKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableNamespaceKeywords.length > 0) {
        symbols.push({
            name: "namespace_declaration",
            kind: "namespace",
            pattern: [
                {
                    anyOf: availableNamespaceKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availablePackageKeywords.length > 0) {
        symbols.push({
            name: "package_declaration",
            kind: "package",
            pattern: [
                {
                    anyOf: availablePackageKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableModuleKeywords.length > 0) {
        symbols.push({
            name: "module_declaration",
            kind: "module",
            pattern: [
                {
                    anyOf: availableModuleKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableTypeKeywords.length > 0) {
        symbols.push({
            name: "type_declaration",
            kind: "type",
            pattern: [
                {
                    anyOf: availableTypeKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableVariableKeywords.length > 0) {
        symbols.push({
            name: "variable_declaration",
            kind: "variable",
            pattern: [
                {
                    anyOf: availableVariableKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableConstantKeywords.length > 0) {
        symbols.push({
            name: "constant_declaration",
            kind: "constant",
            pattern: [
                {
                    anyOf: availableConstantKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

    if (availableImportKeywords.length > 0) {
        symbols.push({
            name: "import_statement",
            kind: "import",
            pattern: [
                {
                    anyOf: availableImportKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
            ],
            hasBody: false,
        });
    }

    if (availableExportKeywords.length > 0) {
        symbols.push({
            name: "export_statement",
            kind: "export",
            pattern: [
                {
                    anyOf: availableExportKeywords.map((keyword) => ({ token: "keyword", value: keyword })),
                },
            ],
            hasBody: false,
        });
    }

    if (hasSqlCreate) {
        const sqlCreateObjects: Array<{
            keyword: string;
            kind: "table" | "view" | "function" | "procedure" | "trigger" | "index" | "schema" | "database";
            name: string;
        }> = [
                { keyword: "table", kind: "table", name: "create_table_statement" },
                { keyword: "view", kind: "view", name: "create_view_statement" },
                { keyword: "function", kind: "function", name: "create_function_statement" },
                { keyword: "procedure", kind: "procedure", name: "create_procedure_statement" },
                { keyword: "trigger", kind: "trigger", name: "create_trigger_statement" },
                { keyword: "index", kind: "index", name: "create_index_statement" },
                { keyword: "schema", kind: "schema", name: "create_schema_statement" },
                { keyword: "database", kind: "database", name: "create_database_statement" },
            ];

        for (const sqlObject of sqlCreateObjects) {
            if (!keywordSet.has(sqlObject.keyword)) {
                continue;
            }

            symbols.push({
                name: sqlObject.name,
                kind: sqlObject.kind,
                pattern: [
                    { token: "keyword", value: "create" },
                    {
                        optional: {
                            anyOf: [
                                { token: "keyword", value: "or" },
                                { token: "keyword", value: "replace" },
                            ],
                        },
                    },
                    {
                        optional: {
                            anyOf: [
                                { token: "keyword", value: "or" },
                                { token: "keyword", value: "replace" },
                            ],
                        },
                    },
                    { token: "keyword", value: sqlObject.keyword },
                    { token: "identifier", capture: "name" },
                ],
                hasBody: false,
            });
        }

        symbols.push({
            name: "create_statement",
            kind: "object",
            pattern: [
                { token: "keyword", value: "create" },
                {
                    optional: {
                        anyOf: [
                            { token: "keyword", value: "or" },
                            { token: "keyword", value: "replace" },
                        ],
                    },
                },
                {
                    optional: {
                        anyOf: [
                            { token: "keyword", value: "or" },
                            { token: "keyword", value: "replace" },
                        ],
                    },
                },
                {
                    anyOf: sqlObjectKeywords
                        .filter((keyword) => keywordSet.has(keyword))
                        .map((keyword) => ({ token: "keyword", value: keyword })),
                },
                { token: "identifier", capture: "name" },
            ],
            hasBody: false,
        });
    }

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
            symbols,
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
            symbols: [
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
                    name: "processing_instruction",
                    kind: "processingInstruction",
                    pattern: [{ token: "processing", capture: "name" }],
                    hasBody: false,
                },
                {
                    name: "cdata",
                    kind: "cdata",
                    pattern: [{ token: "cdata", capture: "name" }],
                    hasBody: false,
                },
            ],
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
                key: { category: "key" },
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
            symbols: [
                {
                    name: "document_separator",
                    kind: "directive",
                    pattern: [{ token: "indicator", value: "---" }],
                    hasBody: false,
                },
                {
                    name: "document_end",
                    kind: "directive",
                    pattern: [{ token: "indicator", value: "..." }],
                    hasBody: false,
                },
                {
                    name: "mapping_pair",
                    kind: "pair",
                    pattern: [
                        { token: "key", capture: "name" },
                        { token: "indicator", value: ":" },
                    ],
                    hasBody: false,
                },
                {
                    name: "sequence_item",
                    kind: "listItem",
                    pattern: [{ token: "indicator", value: "-" }],
                    hasBody: false,
                },
                {
                    name: "string_value",
                    kind: "string",
                    pattern: [{ token: "string", capture: "name" }],
                    hasBody: false,
                },
                {
                    name: "number_value",
                    kind: "number",
                    pattern: [{ token: "number", capture: "name" }],
                    hasBody: false,
                },
                {
                    name: "constant_value",
                    kind: "constant",
                    pattern: [{ token: "constant", capture: "name" }],
                    hasBody: false,
                },
            ],
        },
    };
}
