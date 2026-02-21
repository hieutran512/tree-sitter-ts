// Schema barrel export
export type {
  Position,
  Range,
  PredefinedCharClass,
  CharClass,
  TokenCategory,
  SymbolKind,
} from "./common.js";

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
} from "./lexer.js";

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
} from "./structure.js";

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
} from "./grammar.js";

export type {
  LanguageProfile,
  EmbeddedLanguageRule,
} from "./profile.js";
