import { createGenericCodeProfile } from "./common.js";

export const shell = createGenericCodeProfile({
    name: "shell",
    displayName: "Shell",
    fileExtensions: [".sh", ".bash", ".zsh", ".ksh"],
    mimeTypes: ["application/x-sh"],
    lineComment: "#",
    keywords: [
        "if", "then", "else", "elif", "fi", "for", "while", "until", "do", "done", "case", "esac", "in",
        "function", "select", "time", "coproc", "return", "break", "continue", "readonly", "local", "export",
    ],
});
