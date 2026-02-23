import {
    tokenize,
    extractSymbols,
    getProfile,
    getRegisteredLanguages,
    builtinProfiles,
} from "../src/index.js";

const builtinLanguageNames = builtinProfiles.map((profile) => profile.name);

const fixtures: Record<string, string> = {
    json: '{"name":"app","enabled":true,"count":3}',
    css: "@media screen { .box { color: #fff; } }",
    scss: "$primary: #fff;\n@mixin rounded { border-radius: 4px; }",
    python: "class User:\n    def run(self):\n        return True\n",
    go: "package main\nfunc hello(name string) string { return \"hi\" }\n",
    javascript: "function greet(name) { return \"hi\"; }",
    typescript: "interface User { name: string }\nexport class Service { run(): void {} }",
    cpp: "class User {};\nint add(int a, int b) { return a + b; }\n",
    html: "<!DOCTYPE html><html><body><h1>Hello</h1></body></html>",
    markdown: "# Title\n\n```javascript\nconst x = 1;\n```\n",
    yaml: "name: app\nenabled: true\nitems:\n  - one\n  - two\n",
    xml: "<?xml version=\"1.0\"?><root><item id=\"1\">value</item></root>",
    java: "public class App { public static void main(String[] args) { int x = 1; } }",
    csharp: "namespace Demo { public class App { public static void Main() { int x = 1; } } }",
    rust: "fn main() { let value = 1u32; }",
    ruby: "class User\n  def call\n    true\n  end\nend\n",
    php: "<?php function greet($name) { return \"hi\"; }",
    kotlin: "class App { fun run(): Int { return 1 } }",
    swift: "struct App { func run() -> Int { return 1 } }",
    shell: "#!/usr/bin/env bash\nfor x in a b; do echo $x; done\n",
    bash: "#!/usr/bin/env bash\nfunction greet() { echo \"hi\"; }\n",
    sql: "create table users (id int, name text);",
    toml: "title = \"Demo\"\n[db]\nport = 5432\n",
};

const languagesWithSymbolExpectations = new Set([
    "css",
    "scss",
    "python",
    "go",
    "javascript",
    "typescript",
    "cpp",
    "markdown",
    "java",
    "csharp",
    "rust",
    "ruby",
    "php",
    "kotlin",
    "swift",
    "sql",
]);

const languagesWithProfileSymbolRules = builtinLanguageNames;

const expectedSymbolRulesByLanguage: Record<string, string[]> = {
    markdown: [
        "heading",
        "code_block",
        "code_span",
        "list_item",
        "table",
        "blockquote",
        "link",
        "image",
    ],
    html: ["doctype", "element", "entity"],
    json: ["object", "array", "pair", "string_value", "number_value", "constant_value"],
    yaml: ["document_separator", "mapping_pair", "sequence_item", "string_value", "number_value", "constant_value"],
    xml: ["element", "processing_instruction", "cdata"],
    sql: ["create_table_statement", "create_view_statement", "create_index_statement"],
    java: ["class_declaration", "interface_declaration", "enum_declaration", "package_declaration", "import_statement"],
    csharp: ["class_declaration", "struct_declaration", "interface_declaration", "enum_declaration", "namespace_declaration"],
    rust: ["struct_declaration", "enum_declaration", "function_declaration", "module_declaration", "import_statement"],
    ruby: ["class_declaration", "function_declaration", "module_declaration"],
    php: ["class_declaration", "interface_declaration", "function_declaration", "namespace_declaration", "import_statement"],
    kotlin: ["class_declaration", "function_declaration", "interface_declaration", "package_declaration", "variable_declaration"],
    swift: ["class_declaration", "struct_declaration", "interface_declaration", "enum_declaration", "function_declaration"],
    shell: ["function_declaration", "constant_declaration"],
    bash: ["function_declaration", "constant_declaration"],
};

describe("built-in profile registry", () => {
    test("all builtin profiles are registered by name and extension", () => {
        const registered = new Set(getRegisteredLanguages());

        for (const profile of builtinProfiles) {
            expect(registered.has(profile.name)).toBe(true);
            expect(getProfile(profile.name)?.name).toBe(profile.name);

            for (const ext of profile.fileExtensions) {
                expect(getProfile(ext)?.name).toBe(profile.name);
                expect(getProfile(ext.toUpperCase())?.name).toBe(profile.name);
            }
        }
    });

    test("fixtures exist for all builtin profile names", () => {
        for (const language of builtinLanguageNames) {
            expect(fixtures[language]).toBeDefined();
            expect(fixtures[language]?.length).toBeGreaterThan(0);
        }
    });

    test("unknown profile lookups return undefined", () => {
        expect(getProfile("unknown-language")).toBeUndefined();
        expect(getProfile(".unknownext")).toBeUndefined();
    });

    test.each(languagesWithProfileSymbolRules)(
        "%s profile has non-empty symbol rules",
        (language) => {
            const profile = getProfile(language);

            expect(profile).toBeDefined();
            expect(profile?.structure).toBeDefined();
            expect(profile?.structure?.symbols.length ?? 0).toBeGreaterThan(0);
        },
    );

    test.each(Object.entries(expectedSymbolRulesByLanguage))(
        "%s profile includes expected detailed symbol rules",
        (language, expectedRuleNames) => {
            const profile = getProfile(language);

            expect(profile).toBeDefined();
            const ruleNames = new Set((profile?.structure?.symbols ?? []).map((rule) => rule.name));

            for (const expectedRuleName of expectedRuleNames) {
                expect(ruleNames.has(expectedRuleName)).toBe(true);
            }
        },
    );
});

describe("tokenization coverage across languages", () => {
    test.each(builtinLanguageNames)(
        "tokenize does not throw for %s",
        (language) => {
            const source = fixtures[language] ?? "placeholder";
            const tokens = tokenize(source, language);

            expect(tokens.length).toBeGreaterThan(0);
            expect(Array.isArray(tokens)).toBe(true);
        },
    );

    test.each(builtinProfiles)(
        "tokenize by extension is supported for %s",
        (profile) => {
            const source = fixtures[profile.name] ?? "placeholder";

            for (const ext of profile.fileExtensions) {
                const tokens = tokenize(source, ext);
                const upperCaseTokens = tokenize(source, ext.toUpperCase());

                expect(tokens.length).toBeGreaterThan(0);
                expect(upperCaseTokens.length).toBeGreaterThan(0);
            }
        },
    );

    test.each(Object.entries(fixtures))(
        "fixture tokenization for %s avoids lexer errors",
        (language, source) => {
            const tokens = tokenize(source, language);
            expect(tokens.some((token) => token.type === "error")).toBe(false);
        },
    );

    test.each(Object.entries(fixtures))(
        "wrapped fixture tokenization for %s avoids lexer errors",
        (language, source) => {
            const wrapped = `\n  ${source}\n`;
            const tokens = tokenize(wrapped, language);

            expect(tokens.length).toBeGreaterThan(0);
            expect(tokens.some((token) => token.type === "error")).toBe(false);
        },
    );

    test.each(Object.entries(fixtures))(
        "repeated fixture tokenization for %s avoids lexer errors",
        (language, source) => {
            const repeated = `${source}\n${source}`;
            const tokens = tokenize(repeated, language);

            expect(tokens.length).toBeGreaterThan(0);
            expect(tokens.some((token) => token.type === "error")).toBe(false);
        },
    );

    test.each(builtinLanguageNames)(
        "empty input tokenization for %s returns empty array",
        (language) => {
            const tokens = tokenize("", language);
            expect(tokens).toEqual([]);
        },
    );

    test("tokenize throws for unknown language", () => {
        expect(() => tokenize("value", "unknown-language")).toThrow(/Unknown language/i);
    });

    test("toml tokenization recognizes core TOML syntax", () => {
        const source = `# TOML demo config
title = "tree-sitter-ts-highlight"
enabled = true
timeout = 30
pi = 3.14159
hosts = ["alpha", "beta"]

[database]
server = "192.168.1.1"
ports = [8001, 8001, 8002]
connection_max = 5000

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00Z`;

        const tokens = tokenize(source, "toml");

        expect(tokens.some((token) => token.type === "comment")).toBe(true);
        expect(tokens.some((token) => token.type === "operator" && token.value === "=")).toBe(true);
        expect(tokens.some((token) => token.type === "punctuation" && token.value === "[")).toBe(true);
        expect(tokens.some((token) => token.type === "punctuation" && token.value === "]")).toBe(true);
        expect(tokens.some((token) => token.type === "datetime")).toBe(true);
        expect(tokens.some((token) => token.type === "error")).toBe(false);
    });
});

describe("symbol extraction coverage across languages", () => {
    test.each(builtinLanguageNames)(
        "extractSymbols returns an array for %s",
        (language) => {
            const source = fixtures[language] ?? "placeholder";
            const symbols = extractSymbols(source, language);
            expect(Array.isArray(symbols)).toBe(true);
        },
    );

    test.each(Object.entries(fixtures))(
        "fixture symbol extraction for %s returns expected baseline",
        (language, source) => {
            const symbols = extractSymbols(source, language);

            if (languagesWithSymbolExpectations.has(language)) {
                expect(symbols.length).toBeGreaterThan(0);
            } else {
                expect(symbols.length).toBeGreaterThanOrEqual(0);
            }
        },
    );

    test.each(Object.entries(fixtures))(
        "wrapped fixture symbol extraction for %s returns an array",
        (language, source) => {
            const wrapped = `\n${source}\n`;
            const symbols = extractSymbols(wrapped, language);
            expect(Array.isArray(symbols)).toBe(true);
        },
    );

    test.each(builtinLanguageNames)(
        "empty input symbol extraction for %s returns empty array",
        (language) => {
            const symbols = extractSymbols("", language);
            expect(symbols).toEqual([]);
        },
    );

    test("extractSymbols throws for unknown language", () => {
        expect(() => extractSymbols("value", "unknown-language")).toThrow(/Unknown language/i);
    });
});
