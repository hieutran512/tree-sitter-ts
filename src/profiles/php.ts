import { createGenericCodeProfile } from "./common.js";

export const php = createGenericCodeProfile({
    name: "php",
    displayName: "PHP",
    fileExtensions: [".php", ".phtml", ".php8"],
    mimeTypes: ["application/x-httpd-php"],
    lineComment: "//",
    blockComment: { open: "/*", close: "*/" },
    keywords: [
        "abstract", "and", "array", "as", "break", "callable", "case", "catch", "class", "clone", "const",
        "continue", "declare", "default", "do", "echo", "else", "elseif", "empty", "enddeclare", "endfor",
        "endforeach", "endif", "endswitch", "endwhile", "eval", "exit", "extends", "final", "finally", "fn",
        "for", "foreach", "function", "global", "goto", "if", "implements", "include", "include_once", "instanceof",
        "insteadof", "interface", "isset", "list", "match", "namespace", "new", "or", "print", "private", "protected",
        "public", "readonly", "require", "require_once", "return", "static", "switch", "throw", "trait", "try", "unset",
        "use", "var", "while", "xor", "yield",
    ],
});
