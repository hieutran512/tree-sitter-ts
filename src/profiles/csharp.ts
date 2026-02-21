import { createGenericCodeProfile } from "./common.js";

export const csharp = createGenericCodeProfile({
    name: "csharp",
    displayName: "C#",
    fileExtensions: [".cs", ".csx"],
    mimeTypes: ["text/x-csharp"],
    lineComment: "//",
    blockComment: { open: "/*", close: "*/" },
    stringDelimiters: ['"', "'", "`"],
    keywords: [
        "abstract", "as", "base", "bool", "break", "byte", "case", "catch", "char", "checked",
        "class", "const", "continue", "decimal", "default", "delegate", "do", "double", "else", "enum",
        "event", "explicit", "extern", "false", "finally", "fixed", "float", "for", "foreach", "goto",
        "if", "implicit", "in", "int", "interface", "internal", "is", "lock", "long", "namespace", "new",
        "null", "object", "operator", "out", "override", "params", "private", "protected", "public", "readonly",
        "ref", "return", "sbyte", "sealed", "short", "sizeof", "stackalloc", "static", "string", "struct",
        "switch", "this", "throw", "true", "try", "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort",
        "using", "virtual", "void", "volatile", "while",
    ],
});
