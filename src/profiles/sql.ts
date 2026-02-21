import { createGenericCodeProfile } from "./common.js";

export const sql = createGenericCodeProfile({
    name: "sql",
    displayName: "SQL",
    fileExtensions: [".sql"],
    mimeTypes: ["application/sql", "text/x-sql"],
    lineComment: "--",
    blockComment: { open: "/*", close: "*/" },
    keywords: [
        "select", "from", "where", "insert", "into", "update", "delete", "create", "alter", "drop", "table",
        "view", "index", "join", "left", "right", "inner", "outer", "on", "group", "by", "order", "having",
        "limit", "offset", "union", "all", "distinct", "as", "and", "or", "not", "null", "is", "in", "exists",
        "between", "like", "case", "when", "then", "else", "end", "primary", "key", "foreign", "references",
        "constraint", "values", "set", "begin", "commit", "rollback",
    ],
});
