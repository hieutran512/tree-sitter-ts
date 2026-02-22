# tree-sitter-ts

Pure TypeScript parser library with declarative language profiles.

- No WASM runtime
- Works in Node.js and modern bundlers
- Supports tokenization and symbol extraction

## Installation

```bash
npm install tree-sitter-ts
```

> Requires Node.js 18+

## Quick start

```ts
import { tokenize, extractSymbols } from "tree-sitter-ts";

const source = `
export class Service {
  run(): void {}
}
`;

const tokens = tokenize(source, "typescript");
const symbols = extractSymbols(source, "typescript");

console.log(tokens[0]);
// {
//   type: "keyword",
//   value: "export",
//   category: "keyword",
//   range: { start: { line: 2, column: 1, offset: 1 }, end: ... }
// }

console.log(symbols);
// [{ name: "Service", kind: "class", startLine: 2, endLine: 4 }]
```

You can resolve language by:

- Profile name (for example, `"typescript"`)
- File extension (for example, `".ts"`)

## API

### Core functions

```ts
import {
  tokenize,
  extractSymbols,
  tokenizeWithProfile,
  extractSymbolsWithProfile,
} from "tree-sitter-ts";
```

- `tokenize(source, language): Token[]`
  - Converts source text to a token stream using a registered profile.
- `extractSymbols(source, language): CodeSymbol[]`
  - Extracts symbols like functions/classes (depending on profile structure rules).
- `tokenizeWithProfile(source, profile): Token[]`
  - Tokenizes directly with a `LanguageProfile` object.
- `extractSymbolsWithProfile(source, profile): CodeSymbol[]`
  - Extracts symbols directly with a `LanguageProfile` object.

### Registry utilities

```ts
import {
  registerProfile,
  getProfile,
  getRegisteredLanguages,
  getSupportedExtensions,
  builtinProfiles,
} from "tree-sitter-ts";
```

- `registerProfile(profile)`
  - Registers a custom language profile at runtime.
- `getProfile(nameOrExt)`
  - Gets a profile by language name or file extension.
- `getRegisteredLanguages()`
  - Lists currently registered profile names.
- `getSupportedExtensions()`
  - Lists registered file extensions.
- `builtinProfiles`
  - Array of all built-in profiles.

## Output types

### Token

```ts
interface Token {
  type: string;
  value: string;
  category: TokenCategory;
  range: Range;
}
```

### CodeSymbol

```ts
interface CodeSymbol {
  name: string;
  kind: SymbolKind;
  startLine: number;
  endLine: number;
  path?: string[];
}
```

## Built-in languages

Current built-in profiles:

- `json`
- `css`
- `scss`
- `python`
- `go`
- `javascript`
- `typescript`
- `cpp`
- `html`
- `markdown`
- `yaml`
- `xml`
- `java`
- `csharp`
- `rust`
- `ruby`
- `php`
- `kotlin`
- `swift`
- `shell`
- `bash`
- `sql`
- `toml`

To inspect at runtime:

```ts
import { getRegisteredLanguages, getSupportedExtensions } from "tree-sitter-ts";

console.log(getRegisteredLanguages());
console.log(getSupportedExtensions());
```

## Custom language profile example

```ts
import {
  registerProfile,
  tokenize,
  extractSymbols,
  type LanguageProfile,
} from "tree-sitter-ts";

const toyProfile: LanguageProfile = {
  name: "toytest",
  displayName: "Toy Test",
  version: "1.0.0",
  fileExtensions: [".toy"],
  lexer: {
    charClasses: {
      identStart: { union: [{ predefined: "letter" }, { chars: "_" }] },
      identPart: { union: [{ predefined: "alphanumeric" }, { chars: "_" }] },
    },
    tokenTypes: {
      keyword: { category: "keyword" },
      identifier: { category: "identifier" },
      punctuation: { category: "punctuation" },
      whitespace: { category: "whitespace" },
      newline: { category: "newline" },
    },
    initialState: "default",
    skipTokens: ["whitespace", "newline"],
    states: {
      default: {
        rules: [
          { match: { kind: "keywords", words: ["fn"] }, token: "keyword" },
          {
            match: {
              kind: "charSequence",
              first: { ref: "identStart" },
              rest: { ref: "identPart" },
            },
            token: "identifier",
          },
          {
            match: { kind: "string", value: ["{", "}", "(", ")", ",", ";"] },
            token: "punctuation",
          },
        ],
      },
    },
  },
  structure: {
    blocks: [{ name: "braces", open: "{", close: "}" }],
    symbols: [
      {
        name: "function_declaration",
        kind: "function",
        pattern: [
          { token: "keyword", value: "fn" },
          { token: "identifier", capture: "name" },
        ],
        hasBody: true,
        bodyStyle: "braces",
      },
    ],
  },
};

registerProfile(toyProfile);

const source = "fn add(a, b) {\n}\n";
console.log(tokenize(source, "toytest"));
console.log(extractSymbols(source, ".toy"));
```

## Advanced exports

For advanced use cases, the package also exports lexer/parser internals and schema types, including:

- `CompiledLexer`, `getCompiledLexer`
- `CharReader`, `compileMatcher`, `compileCharClass`
- `findBlockSpans`, `extractSymbolsFromTokens`
- Schema and output type exports from `schema/*` and `types/*`

## Error behavior

If you pass an unknown language name/extension to `tokenize` or `extractSymbols`, the library throws an error:

```txt
Unknown language: "...". Use getRegisteredLanguages() to see available languages.
```

## License

MIT
