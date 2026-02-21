import { createGenericCodeProfile } from "./common.js";

export const swift = createGenericCodeProfile({
    name: "swift",
    displayName: "Swift",
    fileExtensions: [".swift"],
    mimeTypes: ["text/x-swift"],
    lineComment: "//",
    blockComment: { open: "/*", close: "*/", nested: true },
    keywords: [
        "associatedtype", "class", "deinit", "enum", "extension", "func", "import", "init", "inout", "internal",
        "let", "operator", "private", "protocol", "public", "static", "struct", "subscript", "typealias", "var",
        "break", "case", "continue", "default", "defer", "do", "else", "fallthrough", "for", "guard", "if", "in",
        "repeat", "return", "switch", "where", "while", "as", "Any", "catch", "false", "is", "nil", "rethrows",
        "super", "self", "Self", "throw", "throws", "true", "try",
    ],
});
