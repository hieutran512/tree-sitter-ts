import { createGenericCodeProfile } from "./common.js";

export const rust = createGenericCodeProfile({
    name: "rust",
    displayName: "Rust",
    fileExtensions: [".rs"],
    mimeTypes: ["text/rust"],
    lineComment: "//",
    blockComment: { open: "/*", close: "*/", nested: true },
    keywords: [
        "as", "break", "const", "continue", "crate", "else", "enum", "extern", "false", "fn",
        "for", "if", "impl", "in", "let", "loop", "match", "mod", "move", "mut", "pub", "ref",
        "return", "self", "Self", "static", "struct", "super", "trait", "true", "type", "unsafe",
        "use", "where", "while", "async", "await", "dyn",
    ],
});
