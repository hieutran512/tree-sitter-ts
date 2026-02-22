/** Character position in source code */
interface Position {
    /** 1-based line number */
    line: number;
    /** 0-based column number */
    column: number;
    /** Byte offset from start of source */
    offset: number;
}
/** Range spanning two positions in source code */
interface Range {
    start: Position;
    end: Position;
}
/** Predefined character classes covering common patterns */
type PredefinedCharClass = "letter" | "upper" | "lower" | "digit" | "hexDigit" | "alphanumeric" | "whitespace" | "newline" | "any";
/**
 * Character class definition.
 * The building block for lexer patterns, replacing regex character classes
 * with declarative, composable definitions.
 */
type CharClass = {
    predefined: PredefinedCharClass;
} | {
    chars: string;
} | {
    range: [string, string];
} | {
    union: CharClass[];
} | {
    negate: CharClass;
} | {
    ref: string;
};
/**
 * Standard token categories for syntax highlighting.
 * Maps to VS Code / TextMate scope categories for theme compatibility.
 */
type TokenCategory = "keyword" | "identifier" | "string" | "number" | "comment" | "operator" | "punctuation" | "type" | "decorator" | "tag" | "attribute" | "meta" | "regexp" | "escape" | "variable" | "constant" | "whitespace" | "newline" | "error" | "plain";
/**
 * Symbol kinds for code structure classification.
 * Compatible with ragts CodeSymbol.kind and VS Code SymbolKind.
 */
type SymbolKind = "function" | "class" | "method" | "object" | "interface" | "type" | "enum" | "module" | "variable" | "import" | "export" | "namespace" | "property" | "constant" | "other";

/** Complete lexer configuration for a language profile */
interface LexerConfig {
    /** Reusable named character classes */
    charClasses?: Record<string, CharClass>;
    /** Token type definitions with highlighting category */
    tokenTypes: Record<string, TokenTypeDef>;
    /**
     * Lexer states (modes) for context-dependent tokenization.
     * Each state has its own ordered set of rules.
     */
    states: Record<string, LexerState>;
    /** Which state to start in (must exist in states) */
    initialState: string;
    /** Token types to skip in parser (still emitted in token stream) */
    skipTokens?: string[];
    /** Indentation tracking for Python/YAML-like languages */
    indentation?: IndentationConfig;
}
/** Token type definition with highlighting metadata */
interface TokenTypeDef {
    /** Primary highlighting category */
    category: TokenCategory;
    /** Optional sub-category for finer-grained highlighting */
    subcategory?: string;
}
/** A lexer state (mode) containing ordered matching rules */
interface LexerState {
    /** Rules applied in priority order - first match wins */
    rules: LexerRule[];
}
/**
 * A single lexer rule: match a pattern, emit a token, optionally change state.
 *
 * State transitions enable context-dependent tokenization:
 * - push: enter a new state (e.g., entering a template string)
 * - pop: return to the previous state (e.g., closing a template expression)
 * - switchTo: replace current state (e.g., switching from tag to attribute mode)
 */
interface LexerRule {
    /** Matcher that detects this token */
    match: Matcher;
    /** Token type to emit (must exist in tokenTypes) */
    token: string;
    /** Push a new state onto the state stack */
    push?: string;
    /** Pop the current state from the stack */
    pop?: boolean;
    /** Replace current state (switch without push/pop) */
    switchTo?: string;
}
/**
 * Matcher types - the heart of the lexer.
 *
 * Each type describes a common tokenization pattern declaratively.
 * The engine compiles these to efficient character-level scanners.
 *
 * Key advantages over regex:
 * - Readable and self-documenting
 * - State machine handles nesting (template literals, JSX)
 * - No regex pitfalls (catastrophic backtracking, etc.)
 * - Can be statically analyzed and optimized
 */
type Matcher = StringMatcher | KeywordsMatcher | DelimitedMatcher | LineMatcher | CharSequenceMatcher | NumberMatcher | SequenceMatcher | PatternMatcher;
/**
 * Exact string match. For operators, punctuation, specific tokens.
 * When value is an array, tries each string in order (longest match first recommended).
 *
 * @example { kind: 'string', value: '=>' }
 * @example { kind: 'string', value: ['{', '}', '(', ')'] }
 */
interface StringMatcher {
    kind: "string";
    value: string | string[];
}
/**
 * Keyword match with word boundary checking.
 * Ensures "if" doesn't match inside "iframe".
 *
 * @example { kind: 'keywords', words: ['if', 'else', 'for', 'while'] }
 */
interface KeywordsMatcher {
    kind: "keywords";
    words: string[];
}
/**
 * Delimited content match. Handles strings, block comments, raw strings.
 * Supports escape characters, multiline content, and nested delimiters.
 *
 * @example { kind: 'delimited', open: '"', close: '"', escape: '\\' }
 * @example { kind: 'delimited', open: '/''*', close: '*''/', multiline: true }
 * @example { kind: 'delimited', open: '"""', close: '"""', multiline: true }
 */
interface DelimitedMatcher {
    kind: "delimited";
    /** Opening delimiter string */
    open: string;
    /** Closing delimiter string */
    close: string;
    /** Escape character (e.g., '\\' for backslash escaping) */
    escape?: string;
    /** Whether content can span multiple lines (default: false) */
    multiline?: boolean;
    /** Whether delimiters can nest (e.g., Rust nested block comments) */
    nested?: boolean;
}
/**
 * Line content match. From marker to end of line.
 * For line comments, preprocessor directives, etc.
 *
 * @example { kind: 'line', start: '//' }
 * @example { kind: 'line', start: '#' }
 */
interface LineMatcher {
    kind: "line";
    /** Starting marker string */
    start: string;
}
/**
 * Character sequence match. Matches sequences of characters from a class.
 * For identifiers, hex numbers, and other character-class-based tokens.
 *
 * @example // Identifier: starts with letter/_, continues with alphanumeric/_
 * { kind: 'charSequence',
 *   first: { union: [{ predefined: 'letter' }, { chars: '_$' }] },
 *   rest:  { union: [{ predefined: 'alphanumeric' }, { chars: '_$' }] } }
 */
interface CharSequenceMatcher {
    kind: "charSequence";
    /** Character class for the first character */
    first: CharClass;
    /** Character class for subsequent characters (if omitted, matches single char) */
    rest?: CharClass;
}
/**
 * Number literal match. Handles the common numeric literal formats
 * found across programming languages. Compiles to efficient scanning
 * without regex.
 *
 * @example { kind: 'number', integer: true, float: true, hex: true, separator: '_' }
 * @example { kind: 'number', integer: true, float: true, suffix: ['px', 'em', 'rem', '%'] }
 */
interface NumberMatcher {
    kind: "number";
    /** Match decimal integers: 123 */
    integer?: boolean;
    /** Match floating point: 1.5 */
    float?: boolean;
    /** Match hexadecimal: 0xFF */
    hex?: boolean;
    /** Match octal: 0o77 */
    octal?: boolean;
    /** Match binary: 0b1010 */
    binary?: boolean;
    /** Match scientific notation: 1e10, 1.5e-3 */
    scientific?: boolean;
    /** Digit separator character: '_' for 1_000_000 */
    separator?: string;
    /** Unit suffixes: ['px', 'em', 'rem', '%'] for CSS */
    suffix?: string[];
}
/**
 * Sequence match. All elements must match in order.
 * For composite patterns like decorators (@identifier).
 *
 * @example { kind: 'sequence', elements: [
 *   { kind: 'string', value: '@' },
 *   { kind: 'charSequence', first: { predefined: 'letter' }, rest: { predefined: 'alphanumeric' } }
 * ]}
 */
interface SequenceMatcher {
    kind: "sequence";
    elements: Matcher[];
}
/**
 * Regex pattern escape hatch. DISCOURAGED - use other matchers when possible.
 * For truly complex edge cases that can't be expressed with other matchers.
 *
 * @example { kind: 'pattern', regex: '\\b0[xX][0-9a-fA-F]+\\b' }
 */
interface PatternMatcher {
    kind: "pattern";
    /** Regex pattern string (without flags) */
    regex: string;
}
/** Configuration for indentation-based block detection (Python, YAML, etc.) */
interface IndentationConfig {
    /** Token type to emit when indentation increases */
    indentToken: string;
    /** Token type to emit when indentation decreases */
    dedentToken: string;
    /** How to detect indent units */
    unit: "spaces" | "tab" | "detect";
    /** Number of spaces per indent level (when unit is 'spaces') */
    size?: number;
}

/** Structure detection configuration */
interface StructureConfig {
    /** Block delimiter pairs for nesting detection */
    blocks: BlockRule[];
    /** Symbol detection rules - identify functions, classes, etc. */
    symbols: SymbolRule[];
    /** Folding region rules for editors */
    folding?: FoldingRule[];
}
/** Block delimiter pair for bracket/brace matching */
interface BlockRule {
    /** Descriptive name (e.g., 'braces', 'parens', 'brackets') */
    name: string;
    /** Opening delimiter token value */
    open: string;
    /** Closing delimiter token value */
    close: string;
}
/**
 * Symbol detection rule.
 * Matches a sequence of token patterns to identify a language construct
 * (function, class, method, etc.) from the token stream.
 *
 * @example // JavaScript function declaration
 * {
 *   name: 'function_declaration',
 *   kind: 'function',
 *   pattern: [
 *     { token: 'keyword', value: 'function' },
 *     { token: 'identifier', capture: 'name' }
 *   ],
 *   hasBody: true,
 *   bodyStyle: 'braces'
 * }
 *
 * @example // Python class with indentation body
 * {
 *   name: 'class_definition',
 *   kind: 'class',
 *   pattern: [
 *     { token: 'keyword', value: 'class' },
 *     { token: 'identifier', capture: 'name' }
 *   ],
 *   hasBody: true,
 *   bodyStyle: 'indentation'
 * }
 */
interface SymbolRule {
    /** Rule name (becomes the node type, compatible with tree-sitter names) */
    name: string;
    /** Symbol kind for classification */
    kind: SymbolKind;
    /** Token pattern to detect this symbol */
    pattern: TokenPatternStep[];
    /** Whether this symbol has a body (block) */
    hasBody?: boolean;
    /** How the body is delimited */
    bodyStyle?: "braces" | "indentation" | "end-keyword";
    /** End keyword for bodyStyle 'end-keyword' (e.g., Ruby: 'end') */
    endKeyword?: string;
    /** Can this symbol appear inside another symbol? */
    nested?: boolean;
}
/**
 * A step in a token pattern match.
 * Steps are matched sequentially against the token stream.
 */
type TokenPatternStep = TokenMatchStep | TokenSkipStep | TokenOptionalStep | TokenAnyOfStep;
/** Match a specific token type and optionally a value */
interface TokenMatchStep {
    /** Token type to match (e.g., 'keyword', 'identifier') */
    token: string;
    /** Optional: specific token value to match */
    value?: string;
    /** Optional: capture this token's value under a name (e.g., 'name') */
    capture?: string;
}
/** Skip any tokens until the next step matches */
interface TokenSkipStep {
    skip: true;
    /** Maximum tokens to skip before giving up (prevents runaway matching) */
    maxTokens?: number;
}
/** Optional step - matches if possible, skips if not */
interface TokenOptionalStep {
    optional: TokenPatternStep;
}
/** Choice - match any one of the alternatives */
interface TokenAnyOfStep {
    anyOf: TokenPatternStep[];
}
/** Folding region definition for editors */
interface FoldingRule {
    /** What opens a foldable region */
    open: {
        token: string;
        value?: string;
    };
    /** What closes it */
    close: {
        token: string;
        value?: string;
    };
}

/** Full grammar configuration for AST construction */
interface GrammarConfig {
    /** Entry rule name (top-level production) */
    entry: string;
    /** Grammar production rules */
    rules: Record<string, GrammarRule>;
    /** Operator precedence levels (lowest to highest) */
    precedence?: PrecedenceLevel[];
    /** Error recovery strategies */
    recovery?: RecoveryStrategy[];
}
/** A grammar rule with one or more alternative productions */
interface GrammarRule {
    /** Alternative productions (tried in order) */
    alternatives: Production[];
    /** If true, this rule's node is inlined into parent (no separate AST node) */
    inline?: boolean;
}
/** A production is a sequence of elements that form a complete match */
type Production = ProductionElement[];
/**
 * An element within a production.
 * Elements compose to describe the full syntax of a language construct.
 */
type ProductionElement = TokenElement | RuleElement | OptionalElement | RepeatElement | ChoiceElement | PrecElement;
/** Match a specific token type (terminal) */
interface TokenElement {
    /** Token type to match */
    token: string;
    /** Optional: specific token value */
    value?: string;
    /** Optional: field name for the AST node */
    field?: string;
}
/** Match another grammar rule (non-terminal) */
interface RuleElement {
    /** Rule name to match */
    rule: string;
    /** Optional: field name for the AST node */
    field?: string;
}
/** Optional element - matches zero or one times */
interface OptionalElement {
    optional: ProductionElement | Production;
}
/** Repeated element - matches zero or more (min=0) or one or more (min=1) */
interface RepeatElement {
    repeat: ProductionElement | Production;
    /** Minimum occurrences (0 = *, 1 = +). Default: 0 */
    min?: number;
    /** Optional separator between repetitions (e.g., comma in argument lists) */
    separator?: {
        token: string;
        value?: string;
    };
}
/** Choice between alternative productions */
interface ChoiceElement {
    choice: Production[];
}
/** Precedence annotation for operator expressions */
interface PrecElement {
    /** Precedence level (higher binds tighter) */
    prec: number;
    /** Associativity */
    assoc?: "left" | "right" | "none";
    /** The element this precedence applies to */
    element: ProductionElement;
}
/** Operator precedence level */
interface PrecedenceLevel {
    /** Numeric level (higher = binds tighter) */
    level: number;
    /** How operators at this level associate */
    associativity: "left" | "right" | "none";
    /** Operator token values at this level */
    operators: string[];
}
/** Error recovery strategy for a grammar context */
interface RecoveryStrategy {
    /** Grammar rule context where this recovery applies */
    context: string;
    /** Tokens to synchronize on when recovering from errors */
    syncTokens: string[];
}

/**
 * A complete language profile for tree-sitter-ts.
 *
 * Three-level architecture:
 * - Level 1 (lexer): REQUIRED - tokenization, syntax highlighting
 * - Level 2 (structure): Optional - RAG chunking, code folding, symbol outline
 * - Level 3 (grammar): Optional - full AST, syntax validation
 */
interface LanguageProfile {
    /** Unique language identifier (e.g., 'typescript', 'python') */
    name: string;
    /** Human-readable display name (e.g., 'TypeScript') */
    displayName: string;
    /** Profile schema version */
    version: string;
    /** File extensions including dot (e.g., ['.ts', '.tsx']) */
    fileExtensions: string[];
    /** MIME types (e.g., ['text/typescript']) */
    mimeTypes?: string[];
    /**
     * Extend another profile by name.
     * The child profile's definitions are merged on top of the parent's.
     * Token types, states, and rules from the child override the parent.
     */
    extends?: string;
    /** Level 1: Lexer configuration (REQUIRED) */
    lexer: LexerConfig;
    /** Level 2: Structure detection (optional, enables RAG/symbols) */
    structure?: StructureConfig;
    /** Level 3: Full grammar (optional, enables validation/full AST) */
    grammar?: GrammarConfig;
    /** Embedded language regions (e.g., CSS/JS in HTML) */
    embeddedLanguages?: EmbeddedLanguageRule[];
}
/** Rule for detecting embedded language regions within a host language */
interface EmbeddedLanguageRule {
    /** Language to switch to (must be a registered profile name) */
    language: string;
    /** Token pattern that marks the start of the embedded region */
    start: {
        token: string;
        value?: string;
    };
    /** Token pattern that marks the end of the embedded region */
    end: {
        token: string;
        value?: string;
    };
    /** How to determine which language to use */
    languageDetection?: "fixed" | "attribute";
    /** Token whose value contains the language name (when detection is 'attribute') */
    attributeToken?: string;
}

/** A token emitted by the lexer */
interface Token {
    /** Token type name (from profile's tokenTypes) */
    type: string;
    /** Token text content */
    value: string;
    /** Highlighting category */
    category: TokenCategory;
    /** Position in source */
    range: Range;
}

/** A node in the syntax tree */
interface SyntaxNode {
    /** Node type (from structure rules or grammar rules) */
    type: string;
    /** Named fields (e.g., 'name', 'body', 'condition') */
    fields: Record<string, SyntaxNode | SyntaxNode[]>;
    /** Child nodes */
    children: SyntaxNode[];
    /** Source text */
    text: string;
    /** Position in source */
    range: Range;
    /** Parent node (null for root) */
    parent: SyntaxNode | null;
}
/**
 * Code symbol extracted from structure analysis.
 * Compatible with ragts CodeSymbol interface.
 */
interface CodeSymbol {
    /** Symbol name (e.g., function/class name) */
    name: string;
    /** Symbol kind classification */
    kind: SymbolKind;
    /** 1-based start line */
    startLine: number;
    /** 1-based end line */
    endLine: number;
    /** Nesting path for context (e.g., ['ClassName', 'methodName']) */
    path?: string[];
}

/** Compiled lexer ready to tokenize */
declare class CompiledLexer {
    private readonly states;
    private readonly config;
    constructor(config: LexerConfig);
    /** Tokenize source code into a token stream */
    tokenize(source: string): Token[];
}
/** Get or create a compiled lexer for the given config */
declare function getCompiledLexer(config: LexerConfig): CompiledLexer;

/** Reads source code character by character, tracking line/column/offset */
declare class CharReader {
    private readonly src;
    private readonly len;
    private pos;
    private line;
    private col;
    constructor(source: string);
    /** Current byte offset */
    get offset(): number;
    /** Whether we've reached end of source */
    get eof(): boolean;
    /** Remaining characters from current position */
    get remaining(): number;
    /** Current position as Position object */
    get position(): Position;
    /** Peek at the current character without advancing */
    peek(): string;
    /** Peek at character at offset from current position */
    peekAt(offset: number): string;
    /** Peek at a substring from current position */
    peekString(length: number): string;
    /** Get the char code at current position */
    peekCode(): number;
    /** Advance one character and return it */
    advance(): string;
    /** Advance N characters and return the consumed substring */
    advanceN(n: number): string;
    /** Check if source starts with the given string at current position */
    startsWith(str: string): boolean;
    /** Get a slice of the source from start offset to current position */
    sliceFrom(startOffset: number): string;
    /** Get the full source string */
    get source(): string;
    /** Save current state for backtracking */
    save(): ReaderState;
    /** Restore a previously saved state */
    restore(state: ReaderState): void;
}
/** Saved reader state for backtracking */
interface ReaderState {
    pos: number;
    line: number;
    col: number;
}

/** A compiled scanner: returns chars consumed (0 = no match) */
type ScanFn = (reader: CharReader) => number;
/**
 * Compile a Matcher definition into an executable ScanFn.
 * The charClasses map provides named character class resolution.
 */
declare function compileMatcher(matcher: Matcher, charClasses?: Record<string, CharClass>): ScanFn;

/**
 * Compile a CharClass definition into a fast character-test function.
 * Named references are resolved via the provided charClasses map.
 */
declare function compileCharClass(def: CharClass, charClasses?: Record<string, CharClass>): (ch: string) => boolean;

/** A matched block with open/close token indices */
interface BlockSpan {
    /** Block rule name */
    name: string;
    /** Index of opening token in the token array */
    openIndex: number;
    /** Index of closing token in the token array */
    closeIndex: number;
    /** Nesting depth (0 = top level) */
    depth: number;
}
/**
 * Find all block spans in a token array using the given block rules.
 * Returns spans sorted by openIndex.
 */
declare function findBlockSpans(tokens: Token[], blockRules: BlockRule[]): BlockSpan[];

/**
 * Extract code symbols from a pre-tokenized token stream.
 * Useful when you already have tokens and want to avoid re-tokenizing.
 */
declare function extractSymbolsFromTokens(tokens: Token[], profile: LanguageProfile): CodeSymbol[];

/** JSON language profile - Level 1 (Lexer) + Level 2 (Structure) + Level 3 (Grammar) */
declare const json: LanguageProfile;

/** CSS language profile - Level 1 (Lexer) + Level 2 (Structure) */
declare const css: LanguageProfile;

/** SCSS language profile - extends CSS with nesting, variables, mixins */
declare const scss: LanguageProfile;

/** Python language profile - Level 1 (Lexer) + Level 2 (Structure) */
declare const python: LanguageProfile;

/** Go language profile - Level 1 (Lexer) + Level 2 (Structure) */
declare const go: LanguageProfile;

/** JavaScript language profile - Level 1 (Lexer) + Level 2 (Structure) */
declare const javascript: LanguageProfile;

/**
 * TypeScript language profile - extends JavaScript.
 * Adds type annotations, generics, interfaces, enums, decorators, etc.
 * Level 1 (Lexer) + Level 2 (Structure)
 */
declare const typescript: LanguageProfile;

/** C++ language profile - Level 1 (Lexer) + Level 2 (Structure) */
declare const cpp: LanguageProfile;

/** HTML language profile - Level 1 (Lexer) + Level 2 (Structure) + Embedded Languages */
declare const html: LanguageProfile;

/** Markdown language profile - Level 1 (Lexer) + Level 2 (Structure) */
declare const markdown: LanguageProfile;

declare const yaml: LanguageProfile;

declare const xml: LanguageProfile;

declare const java: LanguageProfile;

declare const csharp: LanguageProfile;

declare const rust: LanguageProfile;

declare const ruby: LanguageProfile;

declare const php: LanguageProfile;

declare const kotlin: LanguageProfile;

declare const swift: LanguageProfile;

declare const shell: LanguageProfile;

declare const bash: LanguageProfile;

declare const sql: LanguageProfile;

declare const toml: LanguageProfile;

/**
 * Resolve a profile's inheritance chain.
 * If the profile has `extends`, looks up the parent in the registry
 * and merges them (child overrides parent).
 */
declare function resolveProfile(profile: LanguageProfile, registry: Map<string, LanguageProfile>): LanguageProfile;

/** All built-in language profiles */
declare const builtinProfiles: LanguageProfile[];
/** Register a language profile */
declare function registerProfile(profile: LanguageProfile): void;
/** Get a profile by name (e.g., 'typescript') or file extension (e.g., '.ts') */
declare function getProfile(nameOrExt: string): LanguageProfile | undefined;
/** Get all registered profile names */
declare function getRegisteredLanguages(): string[];
/** Get the file extensions supported by all registered profiles */
declare function getSupportedExtensions(): string[];

/**
 * Tokenize source code into a token stream.
 *
 * @param source - The source code to tokenize
 * @param language - Language name (e.g., 'typescript') or file extension (e.g., '.ts')
 * @returns Array of tokens with type, value, category, and position
 */
declare function tokenize(source: string, language: string): Token[];
/**
 * Extract code symbols (functions, classes, etc.) from source code.
 * Requires the language profile to have structure rules (Level 2).
 *
 * @param source - The source code to analyze
 * @param language - Language name or file extension
 * @returns Array of symbols with name, kind, startLine, endLine
 */
declare function extractSymbols(source: string, language: string): CodeSymbol[];
/**
 * Tokenize source code using a specific language profile.
 *
 * @param source - The source code to tokenize
 * @param profile - The language profile to use
 * @returns Array of tokens
 */
declare function tokenizeWithProfile(source: string, profile: LanguageProfile): Token[];
/**
 * Extract code symbols using a specific language profile.
 *
 * @param source - The source code to analyze
 * @param profile - The language profile to use
 * @returns Array of symbols
 */
declare function extractSymbolsWithProfile(source: string, profile: LanguageProfile): CodeSymbol[];

export { type BlockRule, type BlockSpan, type CharClass, CharReader, type CharSequenceMatcher, type ChoiceElement, type CodeSymbol, CompiledLexer, type DelimitedMatcher, type EmbeddedLanguageRule, type FoldingRule, type GrammarConfig, type GrammarRule, type IndentationConfig, type KeywordsMatcher, type LanguageProfile, type LexerConfig, type LexerRule, type LexerState, type LineMatcher, type Matcher, type NumberMatcher, type OptionalElement, type PatternMatcher, type Position, type PrecElement, type PrecedenceLevel, type PredefinedCharClass, type Production, type ProductionElement, type Range, type RecoveryStrategy, type RepeatElement, type RuleElement, type SequenceMatcher, type StringMatcher, type StructureConfig, type SymbolKind, type SymbolRule, type SyntaxNode, type Token, type TokenAnyOfStep, type TokenCategory, type TokenElement, type TokenMatchStep, type TokenOptionalStep, type TokenPatternStep, type TokenSkipStep, type TokenTypeDef, bash, builtinProfiles, compileCharClass, compileMatcher, cpp, csharp, css, extractSymbols, extractSymbolsFromTokens, extractSymbolsWithProfile, findBlockSpans, getCompiledLexer, getProfile, getRegisteredLanguages, getSupportedExtensions, go, html, java, javascript, json, kotlin, markdown, php, python, registerProfile, resolveProfile, ruby, rust, scss, shell, sql, swift, tokenize, tokenizeWithProfile, toml, typescript, xml, yaml };
