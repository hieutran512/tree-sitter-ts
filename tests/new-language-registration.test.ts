import {
    registerProfile,
    getProfile,
    getRegisteredLanguages,
    getSupportedExtensions,
    tokenize,
    extractSymbols,
    type LanguageProfile,
} from "../src/index.js";

const toyProfile: LanguageProfile = {
    name: "toytest",
    displayName: "Toy Test",
    version: "1.0.0",
    fileExtensions: [".toy"],
    lexer: {
        charClasses: {
            identStart: {
                union: [{ predefined: "letter" }, { chars: "_" }],
            },
            identPart: {
                union: [{ predefined: "alphanumeric" }, { chars: "_" }],
            },
        },
        tokenTypes: {
            keyword: { category: "keyword" },
            identifier: { category: "identifier" },
            punctuation: { category: "punctuation" },
            whitespace: { category: "whitespace" },
            newline: { category: "newline" },
        },
        initialState: "default",
        skipTokens: ["whitespace", "newline"],
        states: {
            default: {
                rules: [
                    {
                        match: { kind: "keywords", words: ["fn"] },
                        token: "keyword",
                    },
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
                            value: ["{", "}", "(", ")", ",", ";"],
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
                ],
            },
        },
    },
    structure: {
        blocks: [{ name: "braces", open: "{", close: "}" }],
        symbols: [
            {
                name: "function_declaration",
                kind: "function",
                pattern: [
                    { token: "keyword", value: "fn" },
                    { token: "identifier", capture: "name" },
                ],
                hasBody: true,
                bodyStyle: "braces",
            },
        ],
    },
};

describe("new language registration", () => {
    test("newly registered profile works by name and extension", () => {
        registerProfile(toyProfile);

        const source = "fn add(a, b) {\n}\n";

        const byNameTokens = tokenize(source, "toytest");
        const byExtensionTokens = tokenize(source, ".toy");

        expect(byNameTokens.length).toBeGreaterThan(0);
        expect(byExtensionTokens.length).toBeGreaterThan(0);

        const symbols = extractSymbols(source, "toytest");
        expect(symbols.length).toBeGreaterThan(0);
        expect(symbols[0]?.name).toBe("add");

        expect(getProfile("toytest")?.name).toBe("toytest");
        expect(getProfile(".toy")?.name).toBe("toytest");
        expect(getRegisteredLanguages()).toContain("toytest");
        expect(getSupportedExtensions()).toContain(".toy");
    });
});
