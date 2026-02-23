import {
    executeCli,
    getHelpText,
    parseCliArgs,
    resolveLanguageInput,
} from "../src/cli/index.js";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("cli argument parsing", () => {
    test("parses source file and token extract mode", () => {
        const parsed = parseCliArgs(["node", "cli", "sample.ts", "token"]);

        expect(parsed.kind).toBe("run");
        if (parsed.kind !== "run") {
            throw new Error("Expected run options");
        }

        expect(parsed.sourceFile).toBe("sample.ts");
        expect(parsed.extract).toBe("token");
        expect(parsed.language).toBe(".ts");
    });

    test("accepts explicit language flag", () => {
        const parsed = parseCliArgs([
            "node",
            "cli",
            "sample.code",
            "symbols",
            "--language",
            "typescript",
        ]);

        expect(parsed.kind).toBe("run");
        if (parsed.kind !== "run") {
            throw new Error("Expected run options");
        }

        expect(parsed.extract).toBe("symbols");
        expect(parsed.language).toBe("typescript");
    });

    test("returns error for invalid extract mode", () => {
        const parsed = parseCliArgs(["node", "cli", "sample.ts", "ast"]);

        expect("kind" in parsed && parsed.kind === "error").toBe(true);
    });

    test("returns help for --help", () => {
        const parsed = parseCliArgs(["node", "cli", "--help"]);

        expect("kind" in parsed && parsed.kind === "help").toBe(true);
    });
});

describe("language input resolution", () => {
    test("uses extension by default", () => {
        expect(resolveLanguageInput("file.ts")).toBe(".ts");
    });

    test("uses explicit language when provided", () => {
        expect(resolveLanguageInput("file.unknown", "typescript")).toBe("typescript");
    });

    test("returns undefined when no extension and no language", () => {
        expect(resolveLanguageInput("README")).toBeUndefined();
    });
});

describe("cli execution output", () => {
    test("prints deterministic JSON success payload for token extraction", async () => {
        const tempDir = await mkdtemp(join(tmpdir(), "tree-sitter-ts-cli-"));
        const sourcePath = join(tempDir, "sample.ts");
        await writeFile(sourcePath, "const value = 1;\n", "utf8");

        const logs: string[] = [];
        const errors: string[] = [];

        const exitCode = await executeCli(
            ["node", "cli", sourcePath, "token"],
            {
                log: (message?: unknown) => logs.push(String(message)),
                error: (message?: unknown) => errors.push(String(message)),
            },
        );

        expect(exitCode).toBe(0);
        expect(errors.length).toBe(0);
        expect(logs.length).toBe(1);

        const payload = JSON.parse(logs[0]) as {
            ok: boolean;
            extract: string;
            sourceFile: string;
            language: string;
            count: number;
            result: unknown[];
        };

        expect(payload.ok).toBe(true);
        expect(payload.extract).toBe("token");
        expect(payload.sourceFile).toBe(sourcePath);
        expect(payload.language).toBe(".ts");
        expect(payload.count).toBe(payload.result.length);
        expect(Array.isArray(payload.result)).toBe(true);
    });

    test("prints help text for missing args", async () => {
        const logs: string[] = [];
        const errors: string[] = [];

        const exitCode = await executeCli(["node", "cli"], {
            log: (message?: unknown) => logs.push(String(message)),
            error: (message?: unknown) => errors.push(String(message)),
        });

        expect(exitCode).toBe(0);
        expect(logs.length).toBe(1);
        expect(errors.length).toBe(0);
        expect(getHelpText().length).toBeGreaterThan(0);
    });

    test("prints deterministic JSON error payload for invalid extract mode", async () => {
        const logs: string[] = [];
        const errors: string[] = [];

        const exitCode = await executeCli(["node", "cli", "sample.ts", "ast"], {
            log: (message?: unknown) => logs.push(String(message)),
            error: (message?: unknown) => errors.push(String(message)),
        });

        expect(exitCode).toBe(1);
        expect(logs.length).toBe(0);
        expect(errors.length).toBe(1);

        const payload = JSON.parse(errors[0]) as {
            ok: boolean;
            error: {
                code: string;
                message: string;
            };
        };

        expect(payload.ok).toBe(false);
        expect(payload.error.code).toBe("INVALID_EXTRACT");
        expect(payload.error.message).toMatch(/token|symbols/i);
    });

    test("symbols output uses nameRange and contentRange", async () => {
        const tempDir = await mkdtemp(join(tmpdir(), "tree-sitter-ts-cli-md-"));
        const sourcePath = join(tempDir, "sample.md");
        await writeFile(
            sourcePath,
            [
                "# Section One",
                "line one",
                "line two",
            ].join("\n"),
            "utf8",
        );

        const logs: string[] = [];
        const errors: string[] = [];

        const exitCode = await executeCli(
            ["node", "cli", sourcePath, "symbols"],
            {
                log: (message?: unknown) => logs.push(String(message)),
                error: (message?: unknown) => errors.push(String(message)),
            },
        );

        expect(exitCode).toBe(0);
        expect(errors.length).toBe(0);
        expect(logs.length).toBe(1);

        const payload = JSON.parse(logs[0]) as {
            ok: boolean;
            result: Array<{
                name: string;
                kind: string;
                nameRange: {
                    start: { line: number; column: number; offset: number };
                    end: { line: number; column: number; offset: number };
                };
                contentRange: {
                    start: { line: number; column: number; offset: number };
                    end: { line: number; column: number; offset: number };
                };
            }>;
        };

        expect(payload.ok).toBe(true);
        expect(payload.result.length).toBeGreaterThan(0);

        const heading = payload.result.find((item) => item.kind === "heading");
        expect(heading).toBeDefined();
        expect(heading!.name.length).toBeGreaterThan(0);
        expect(heading!.nameRange.start.line).toBeGreaterThan(0);
        expect(heading!.contentRange.end.line).toBeGreaterThanOrEqual(heading!.contentRange.start.line);
    });
});
