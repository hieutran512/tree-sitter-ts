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
    sql: "SELECT id, name FROM users WHERE id = 1;",
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
]);

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
