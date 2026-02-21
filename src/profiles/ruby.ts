import { createGenericCodeProfile } from "./common.js";

export const ruby = createGenericCodeProfile({
    name: "ruby",
    displayName: "Ruby",
    fileExtensions: [".rb", ".rake", ".gemspec"],
    mimeTypes: ["application/x-ruby"],
    lineComment: "#",
    keywords: [
        "BEGIN", "END", "alias", "and", "begin", "break", "case", "class", "def", "defined?", "do",
        "else", "elsif", "end", "ensure", "false", "for", "if", "in", "module", "next", "nil", "not",
        "or", "redo", "rescue", "retry", "return", "self", "super", "then", "true", "undef", "unless",
        "until", "when", "while", "yield",
    ],
});
