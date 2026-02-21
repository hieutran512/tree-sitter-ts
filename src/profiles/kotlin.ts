import { createGenericCodeProfile } from "./common.js";

export const kotlin = createGenericCodeProfile({
    name: "kotlin",
    displayName: "Kotlin",
    fileExtensions: [".kt", ".kts"],
    mimeTypes: ["text/x-kotlin"],
    lineComment: "//",
    blockComment: { open: "/*", close: "*/" },
    keywords: [
        "as", "as?", "break", "class", "continue", "do", "else", "false", "for", "fun", "if", "in",
        "interface", "is", "null", "object", "package", "return", "super", "this", "throw", "true", "try",
        "typealias", "val", "var", "when", "while", "by", "catch", "constructor", "delegate", "dynamic", "field",
        "file", "finally", "get", "import", "init", "param", "property", "receiver", "set", "setparam", "where",
    ],
});
