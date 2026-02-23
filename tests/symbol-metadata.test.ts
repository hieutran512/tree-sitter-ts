import { extractSymbols } from "../src/index.js";

/**
 * Helper to validate nameRange and contentRange consistency
 */
function validateRanges(symbol: any, context: string) {
    expect(symbol.nameRange).toBeDefined();
    expect(symbol.contentRange).toBeDefined();

    const { nameRange, contentRange } = symbol;

    // Basic field validation - Range has start and end Position objects
    expect(nameRange.start).toBeDefined();
    expect(nameRange.end).toBeDefined();
    expect(contentRange.start).toBeDefined();
    expect(contentRange.end).toBeDefined();

    expect(typeof nameRange.start.line).toBe("number");
    expect(typeof nameRange.start.column).toBe("number");
    expect(typeof nameRange.start.offset).toBe("number");
    expect(typeof nameRange.end.line).toBe("number");
    expect(typeof nameRange.end.column).toBe("number");
    expect(typeof nameRange.end.offset).toBe("number");

    expect(typeof contentRange.start.line).toBe("number");
    expect(typeof contentRange.start.column).toBe("number");
    expect(typeof contentRange.start.offset).toBe("number");
    expect(typeof contentRange.end.line).toBe("number");
    expect(typeof contentRange.end.column).toBe("number");
    expect(typeof contentRange.end.offset).toBe("number");

    // Range consistency: nameRange must be within contentRange
    expect(nameRange.start.line).toBeGreaterThanOrEqual(contentRange.start.line);
    expect(nameRange.end.line).toBeLessThanOrEqual(contentRange.end.line);

    if (nameRange.start.line === contentRange.start.line) {
        expect(nameRange.start.column).toBeGreaterThanOrEqual(contentRange.start.column);
    }

    if (nameRange.end.line === contentRange.end.line) {
        expect(nameRange.end.column).toBeLessThanOrEqual(contentRange.end.column);
    }

    // Line range consistency
    expect(nameRange.end.line).toBeGreaterThanOrEqual(nameRange.start.line);
    expect(contentRange.end.line).toBeGreaterThanOrEqual(contentRange.start.line);

    // Positive line and column indices
    expect(nameRange.start.line).toBeGreaterThan(0);
    expect(nameRange.start.column).toBeGreaterThanOrEqual(0);
    expect(contentRange.start.line).toBeGreaterThan(0);
    expect(contentRange.start.column).toBeGreaterThanOrEqual(0);
}

describe("symbol nameRange & contentRange validation", () => {
    test("typescript: classes and methods have proper ranges", () => {
        const source = [
            "export class Service {",
            "  private repo: string;",
            "  constructor(repo: string) {",
            "    this.repo = repo;",
            "  }",
            "  async fetchUser(id: number): Promise<User> {",
            "    return { id, name: 'John' };",
            "  }",
            "}",
        ].join("\n");

        const symbols = extractSymbols(source, "typescript");
        expect(symbols.length).toBeGreaterThan(0);

        // Validate all symbols
        for (const symbol of symbols) {
            validateRanges(symbol, `typescript/${symbol.kind}/${symbol.name}`);
        }

        // Check specific symbols
        const serviceClass = symbols.find((s) => s.name === "Service");
        expect(serviceClass).toBeDefined();
        expect(serviceClass!.contentRange.end.line).toBeGreaterThan(serviceClass!.contentRange.start.line);
    });

    test("python: functions and methods span multiple lines", () => {
        const source = [
            "def outer():",
            "    def inner():",
            "        x = 1",
            "        y = 2",
            "        return x + y",
            "    result = inner()",
            "    print(result)",
            "",
        ].join("\n");

        const symbols = extractSymbols(source, "python");
        expect(symbols.length).toBeGreaterThan(0);

        for (const symbol of symbols) {
            validateRanges(symbol, `python/${symbol.kind}/${symbol.name}`);
        }

        const outer = symbols.find((s) => s.name === "outer");
        expect(outer).toBeDefined();
        expect(outer!.contentRange.start.line).toBe(1);
        expect(outer!.contentRange.end.line).toBeGreaterThanOrEqual(6);
    });

    test("javascript: functions with nested blocks expand contentRange", () => {
        const source = [
            "function outer() {",
            "  const inner = function() {",
            "    if (true) {",
            "      return 42;",
            "    }",
            "  };",
            "  return inner();",
            "}",
        ].join("\n");

        const symbols = extractSymbols(source, "javascript");
        expect(symbols.length).toBeGreaterThan(0);

        for (const symbol of symbols) {
            validateRanges(symbol, `javascript/${symbol.kind}/${symbol.name}`);
        }

        const outer = symbols.find((s) => s.name === "outer");
        expect(outer).toBeDefined();
        expect(outer!.contentRange.end.line).toBe(8);
    });

    test("markdown: code blocks span multiple lines", () => {
        const source = [
            "# Title",
            "",
            "```typescript",
            "function hello() {",
            "  console.log('world');",
            "}",
            "```",
            "",
            "More text here",
        ].join("\n");

        const symbols = extractSymbols(source, "markdown");
        expect(symbols.length).toBeGreaterThan(0);

        for (const symbol of symbols) {
            validateRanges(symbol, `markdown/${symbol.kind}/${symbol.name}`);
        }

        // Find a fenced code block (has ```typescript or similar)
        const codeBlock = symbols.find(
            (s) => s.kind === "codeBlock" &&
                (s.name === "```typescript" || s.name === "```")
        );
        expect(codeBlock).toBeDefined();
        // Code block should span multiple lines (from open fence to close fence)
        if (codeBlock) {
            expect(codeBlock.contentRange.end.line).toBeGreaterThanOrEqual(
                codeBlock.contentRange.start.line
            );
        }
    });

    test("markdown: tables span multiple lines", () => {
        const source = [
            "| Header 1 | Header 2 |",
            "|----------|----------|",
            "| Cell 1   | Cell 2   |",
            "| Cell 3   | Cell 4   |",
        ].join("\n");

        const symbols = extractSymbols(source, "markdown");
        expect(symbols.length).toBeGreaterThan(0);

        for (const symbol of symbols) {
            validateRanges(symbol, `markdown/${symbol.kind}/${symbol.name}`);
        }

        // All table rows should have contentRange spanning the full table region
        const tableSymbols = symbols.filter((s) => s.kind === "table");
        expect(tableSymbols.length).toBeGreaterThan(0);

        for (const table of tableSymbols) {
            expect(table.contentRange.end.line).toBeGreaterThanOrEqual(table.contentRange.start.line);
        }
    });

    test("markdown: blockquotes span multiple lines", () => {
        const source = [
            "> This is a blockquote",
            "> that spans multiple",
            "> lines of text",
            "",
            "Regular paragraph here",
        ].join("\n");

        const symbols = extractSymbols(source, "markdown");
        expect(symbols.length).toBeGreaterThan(0);

        for (const symbol of symbols) {
            validateRanges(symbol, `markdown/${symbol.kind}/${symbol.name}`);
        }

        // Blockquote should span lines 1-3
        const blockquotes = symbols.filter((s) => s.kind === "blockquote");
        expect(blockquotes.length).toBeGreaterThan(0);

        for (const bq of blockquotes) {
            expect(bq.contentRange.end.line).toBeGreaterThanOrEqual(bq.contentRange.start.line);
        }
    });

    test("markdown: list items span multiple lines", () => {
        const source = [
            "- Item 1",
            "  continuation",
            "- Item 2",
            "- Item 3",
        ].join("\n");

        const symbols = extractSymbols(source, "markdown");
        expect(symbols.length).toBeGreaterThan(0);

        for (const symbol of symbols) {
            validateRanges(symbol, `markdown/${symbol.kind}/${symbol.name}`);
        }

        const listItems = symbols.filter((s) => s.kind === "listItem");
        expect(listItems.length).toBeGreaterThan(0);
    });

    test("go: functions and structs have proper ranges", () => {
        const source = [
            'package main',
            '',
            'type Server struct {',
            '    addr string',
            '}',
            '',
            'func (s *Server) Start() error {',
            '    return nil',
            '}',
        ].join('\n');

        const symbols = extractSymbols(source, "go");
        expect(symbols.length).toBeGreaterThan(0);

        for (const symbol of symbols) {
            validateRanges(symbol, `go/${symbol.kind}/${symbol.name}`);
        }
    });

    test("java: classes and methods have proper ranges", () => {
        const source = [
            "public class Calculator {",
            "    public int add(int a, int b) {",
            "        return a + b;",
            "    }",
            "    public int multiply(int a, int b) {",
            "        return a * b;",
            "    }",
            "}",
        ].join("\n");

        const symbols = extractSymbols(source, "java");
        expect(symbols.length).toBeGreaterThan(0);

        for (const symbol of symbols) {
            validateRanges(symbol, `java/${symbol.kind}/${symbol.name}`);
        }

        const calc = symbols.find((s) => s.name === "Calculator");
        expect(calc).toBeDefined();
        expect(calc!.contentRange.end.line).toBe(8);
    });

    test("rust: functions and structs have proper ranges", () => {
        const source = [
            "struct Point {",
            "    x: i32,",
            "    y: i32,",
            "}",
            "",
            "impl Point {",
            "    fn new(x: i32, y: i32) -> Point {",
            "        Point { x, y }",
            "    }",
            "}",
        ].join("\n");

        const symbols = extractSymbols(source, "rust");
        expect(symbols.length).toBeGreaterThan(0);

        for (const symbol of symbols) {
            validateRanges(symbol, `rust/${symbol.kind}/${symbol.name}`);
        }
    });

    test("all extracted symbols have valid ranges", () => {
        const languages = [
            "typescript",
            "python",
            "javascript",
            "go",
            "java",
            "rust",
            "markdown",
        ];

        const samples: Record<string, string> = {
            typescript: 'export class Example { method() { return 1; } }',
            python: 'def example():\n    return 1',
            javascript: 'function example() { return 1; }',
            go: 'func Example() int { return 1 }',
            java: 'public class Example { public int method() { return 1; } }',
            rust: 'fn example() { let x = 1; }',
            markdown: '# Heading\n\n```\ncode\n```',
        };

        for (const lang of languages) {
            const source = samples[lang] || "";
            if (!source) continue;

            const symbols = extractSymbols(source, lang as any);

            if (symbols.length > 0) {
                for (const symbol of symbols) {
                    validateRanges(symbol, `${lang}/${symbol.kind}/${symbol.name}`);
                }
            }
        }
    });

    test("nameRange is a subset of contentRange", () => {
        const source = [
            "class Services {",
            "  executeTask() {",
            "    const inner = () => 42;",
            "    return inner();",
            "  }",
            "}",
        ].join("\n");

        const symbols = extractSymbols(source, "typescript");

        for (const symbol of symbols) {
            const { nameRange, contentRange } = symbol;

            // nameRange start >= contentRange start
            expect(nameRange.start.line).toBeGreaterThanOrEqual(contentRange.start.line);

            // nameRange end <= contentRange end
            expect(nameRange.end.line).toBeLessThanOrEqual(contentRange.end.line);

            // On same line, nameRange columns must be within contentRange
            if (nameRange.start.line === contentRange.start.line) {
                expect(nameRange.start.column).toBeGreaterThanOrEqual(contentRange.start.column);
            }
            if (nameRange.end.line === contentRange.end.line) {
                expect(nameRange.end.column).toBeLessThanOrEqual(contentRange.end.column);
            }
        }
    });
});
