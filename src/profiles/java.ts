import { createGenericCodeProfile } from "./common.js";

export const java = createGenericCodeProfile({
    name: "java",
    displayName: "Java",
    fileExtensions: [".java"],
    mimeTypes: ["text/x-java-source", "text/java"],
    lineComment: "//",
    blockComment: { open: "/*", close: "*/" },
    keywords: [
        "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
        "class", "const", "continue", "default", "do", "double", "else", "enum",
        "extends", "final", "finally", "float", "for", "if", "implements", "import",
        "instanceof", "int", "interface", "long", "native", "new", "package", "private",
        "protected", "public", "return", "short", "static", "strictfp", "super", "switch",
        "synchronized", "this", "throw", "throws", "transient", "try", "void", "volatile", "while",
    ],
});
