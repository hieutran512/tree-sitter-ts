#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { extractSymbols, getProfile, tokenize } from "../index.js";

export type ExtractMode = "token" | "symbols";

export interface CliOptions {
    kind: "run";
    sourceFile: string;
    extract: ExtractMode;
    language: string;
}

interface CliHelp {
    kind: "help";
}

interface CliError {
    kind: "error";
    message: string;
    code:
    | "INVALID_ARGS"
    | "INVALID_EXTRACT"
    | "LANGUAGE_REQUIRED"
    | "UNKNOWN_LANGUAGE";
}

type ParsedCliArgs = CliOptions | CliHelp | CliError;

export interface CliSuccessOutput {
    ok: true;
    extract: ExtractMode;
    sourceFile: string;
    language: string;
    count: number;
    result: unknown[];
}

export interface CliErrorOutput {
    ok: false;
    error: {
        code: string;
        message: string;
    };
}

export function parseCliArgs(argv: string[]): ParsedCliArgs {
    const args = argv.slice(2);

    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        return { kind: "help" };
    }

    if (args.length < 2) {
        return {
            kind: "error",
            code: "INVALID_ARGS",
            message: "Missing required arguments: <source-file> <token|symbols>",
        };
    }

    const sourceFile = args[0];
    const extractArg = args[1]?.toLowerCase();

    if (extractArg !== "token" && extractArg !== "symbols") {
        return {
            kind: "error",
            code: "INVALID_EXTRACT",
            message: `Invalid extract mode: \"${args[1]}\". Use \"token\" or \"symbols\".`,
        };
    }

    let languageFromFlag: string | undefined;
    for (let i = 2; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === "--language" || arg === "-l") {
            languageFromFlag = args[i + 1];
            i += 1;
        }
    }

    const language = resolveLanguageInput(sourceFile, languageFromFlag);
    if (!language) {
        return {
            kind: "error",
            code: "LANGUAGE_REQUIRED",
            message:
                "Unable to detect language from file extension. Pass --language <name-or-extension>.",
        };
    }

    if (!getProfile(language)) {
        return {
            kind: "error",
            code: "UNKNOWN_LANGUAGE",
            message: `Unknown language: \"${language}\"`,
        };
    }

    return {
        kind: "run",
        sourceFile,
        extract: extractArg,
        language,
    };
}

export function resolveLanguageInput(
    sourceFile: string,
    languageFromFlag?: string,
): string | undefined {
    if (languageFromFlag?.trim()) {
        return languageFromFlag.trim();
    }

    const ext = extname(sourceFile).toLowerCase();
    if (!ext) {
        return undefined;
    }

    return ext;
}

export async function executeCli(
    argv: string[],
    io: Pick<typeof console, "log" | "error"> = console,
): Promise<number> {
    const parsed = parseCliArgs(argv);

    if (parsed.kind === "help") {
        io.log(getHelpText());
        return 0;
    }

    if (parsed.kind === "error") {
        const output: CliErrorOutput = {
            ok: false,
            error: {
                code: parsed.code,
                message: parsed.message,
            },
        };
        io.error(JSON.stringify(output, null, 2));
        return 1;
    }

    try {
        const absolutePath = resolve(parsed.sourceFile);
        const source = await readFile(absolutePath, "utf8");

        const result =
            parsed.extract === "token"
                ? tokenize(source, parsed.language)
                : extractSymbols(source, parsed.language);

        const output: CliSuccessOutput = {
            ok: true,
            extract: parsed.extract,
            sourceFile: parsed.sourceFile,
            language: parsed.language,
            count: result.length,
            result,
        };

        io.log(JSON.stringify(output, null, 2));
        return 0;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const output: CliErrorOutput = {
            ok: false,
            error: {
                code: "EXECUTION_ERROR",
                message,
            },
        };
        io.error(JSON.stringify(output, null, 2));
        return 1;
    }
}

export function getHelpText(): string {
    return [
        "Usage:",
        "  tree-sitter-ts <source-file> <token|symbols> [--language <name-or-extension>]",
        "",
        "Examples:",
        "  tree-sitter-ts ./src/app.ts token",
        "  tree-sitter-ts ./src/app.ts symbols",
        "  tree-sitter-ts ./snippet.txt token --language typescript",
        "",
        "Output format:",
        "  JSON object with fields: ok, extract, sourceFile, language, count, result",
    ].join("\n");
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : "";
const isDirectInvocation = /[\\/]cli[\\/]index\.(js|ts|cjs|mjs)$/i.test(
    entryPath,
);

if (isDirectInvocation) {
    void executeCli(process.argv).then((exitCode) => {
        if (exitCode !== 0) {
            process.exitCode = exitCode;
        }
    });
}
