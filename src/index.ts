// ---------------------------------------------------------------------------
// tree-sitter-ts - Pure TypeScript parser library with declarative language profiles
// ---------------------------------------------------------------------------

import type { LanguageProfile } from "./schema/profile.js";
import type { Token } from "./types/token.js";
import type { CodeSymbol } from "./types/tree.js";
import { tokenizeWithConfig } from "./lexer/lexer.js";
import { extractSymbolsFromProfile } from "./parser/structure-parser.js";
import { getProfile as getProfileFromRegistry } from "./profiles/index.js";

// ======================== PUBLIC API ========================

/**
 * Tokenize source code into a token stream.
 *
 * @param source - The source code to tokenize
 * @param language - Language name (e.g., 'typescript') or file extension (e.g., '.ts')
 * @returns Array of tokens with type, value, category, and position
 */
export function tokenize(source: string, language: string): Token[] {
  const profile = resolveLanguage(language);
  return tokenizeWithConfig(source, profile.lexer);
}

/**
 * Extract code symbols (functions, classes, etc.) from source code.
 * Requires the language profile to have structure rules (Level 2).
 *
 * @param source - The source code to analyze
 * @param language - Language name or file extension
 * @returns Array of symbols with name, kind, nameRange, and contentRange
 */
export function extractSymbols(
  source: string,
  language: string,
): CodeSymbol[] {
  const profile = resolveLanguage(language);
  return extractSymbolsFromProfile(source, profile);
}

/**
 * Tokenize source code using a specific language profile.
 *
 * @param source - The source code to tokenize
 * @param profile - The language profile to use
 * @returns Array of tokens
 */
export function tokenizeWithProfile(
  source: string,
  profile: LanguageProfile,
): Token[] {
  return tokenizeWithConfig(source, profile.lexer);
}

/**
 * Extract code symbols using a specific language profile.
 *
 * @param source - The source code to analyze
 * @param profile - The language profile to use
 * @returns Array of symbols
 */
export function extractSymbolsWithProfile(
  source: string,
  profile: LanguageProfile,
): CodeSymbol[] {
  return extractSymbolsFromProfile(source, profile);
}

// ======================== HELPERS ========================

function resolveLanguage(language: string): LanguageProfile {
  const profile = getProfileFromRegistry(language);
  if (!profile) {
    throw new Error(
      `Unknown language: "${language}". Use getRegisteredLanguages() to see available languages.`,
    );
  }
  return profile;
}

// ======================== RE-EXPORTS ========================

// Schema types
export type {
  Position,
  Range,
  PredefinedCharClass,
  CharClass,
  TokenCategory,
  SymbolKind,
} from "./schema/common.js";

export type {
  LexerConfig,
  TokenTypeDef,
  LexerState,
  LexerRule,
  Matcher,
  StringMatcher,
  KeywordsMatcher,
  DelimitedMatcher,
  LineMatcher,
  CharSequenceMatcher,
  NumberMatcher,
  SequenceMatcher,
  PatternMatcher,
  IndentationConfig,
} from "./schema/lexer.js";

export type {
  StructureConfig,
  BlockRule,
  SymbolRule,
  TokenPatternStep,
  TokenMatchStep,
  TokenSkipStep,
  TokenOptionalStep,
  TokenAnyOfStep,
  FoldingRule,
} from "./schema/structure.js";

export type {
  GrammarConfig,
  GrammarRule,
  Production,
  ProductionElement,
  TokenElement,
  RuleElement,
  OptionalElement,
  RepeatElement,
  ChoiceElement,
  PrecElement,
  PrecedenceLevel,
  RecoveryStrategy,
} from "./schema/grammar.js";

export type {
  LanguageProfile,
  EmbeddedLanguageRule,
} from "./schema/profile.js";

// Output types
export type { Token } from "./types/token.js";
export type { SyntaxNode, CodeSymbol } from "./types/tree.js";

// Lexer internals (for advanced usage)
export { CompiledLexer, getCompiledLexer } from "./lexer/lexer.js";
export { CharReader } from "./lexer/char-reader.js";
export { compileMatcher } from "./lexer/matcher-compiler.js";
export { compileCharClass } from "./lexer/char-classes.js";

// Parser internals (for advanced usage)
export { findBlockSpans, type BlockSpan } from "./parser/block-tracker.js";
export { extractSymbolsFromTokens } from "./parser/structure-parser.js";

// Profiles and registry
export {
  json,
  css,
  scss,
  python,
  go,
  javascript,
  typescript,
  cpp,
  html,
  markdown,
  yaml,
  xml,
  java,
  csharp,
  rust,
  ruby,
  php,
  kotlin,
  swift,
  shell,
  bash,
  sql,
  toml,
  builtinProfiles,
  registerProfile,
  getProfile,
  getRegisteredLanguages,
  getSupportedExtensions,
  resolveProfile,
} from "./profiles/index.js";
