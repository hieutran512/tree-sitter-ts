// ---------------------------------------------------------------------------
// Lexer Engine
//
// The main tokenizer. Takes source code + a LexerConfig (from a language
// profile) and produces a Token[] stream.
// ---------------------------------------------------------------------------

import type { LexerConfig, LexerRule } from "../schema/lexer.js";
import type { Token } from "../types/token.js";
import { CharReader } from "./char-reader.js";
import { StateMachine } from "./state-machine.js";
import { compileMatcher, type ScanFn } from "./matcher-compiler.js";

/** Pre-compiled rule: scanner function + rule metadata */
interface CompiledRule {
  scan: ScanFn;
  rule: LexerRule;
}

/** Pre-compiled state: array of compiled rules */
type CompiledState = CompiledRule[];

/** Compiled lexer ready to tokenize */
export class CompiledLexer {
  private readonly states: Map<string, CompiledState>;
  private readonly config: LexerConfig;

  constructor(config: LexerConfig) {
    this.config = config;
    this.states = new Map();

    const charClasses = config.charClasses ?? {};

    // Pre-compile all states and their rules
    for (const [name, state] of Object.entries(config.states)) {
      const compiled: CompiledState = state.rules.map((rule) => ({
        scan: compileMatcher(rule.match, charClasses),
        rule,
      }));
      this.states.set(name, compiled);
    }
  }

  /** Tokenize source code into a token stream */
  tokenize(source: string): Token[] {
    const reader = new CharReader(source);
    const sm = new StateMachine(this.config.initialState);
    const tokens: Token[] = [];

    while (!reader.eof) {
      const currentState = this.states.get(sm.current);
      if (!currentState) {
        throw new Error(`Unknown lexer state: "${sm.current}"`);
      }

      let matched = false;
      const startPos = reader.position;

      for (const { scan, rule } of currentState) {
        const consumed = scan(reader);
        if (consumed > 0) {
          const value = reader.advanceN(consumed);
          const endPos = reader.position;

          const typeDef = this.config.tokenTypes[rule.token];
          tokens.push({
            type: rule.token,
            value,
            category: typeDef?.category ?? "plain",
            range: { start: startPos, end: endPos },
          });

          // Apply state transition
          sm.applyTransition(rule);
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Fallback: consume single character as error/plain token
        const ch = reader.advance();
        const endPos = reader.position;
        tokens.push({
          type: "error",
          value: ch,
          category: "error",
          range: { start: startPos, end: endPos },
        });
      }
    }

    return tokens;
  }
}

// ---------------------------------------------------------------------------
// Convenience: one-shot tokenize
// ---------------------------------------------------------------------------

/** Cache of compiled lexers keyed by config reference */
const lexerCache = new WeakMap<LexerConfig, CompiledLexer>();

/** Get or create a compiled lexer for the given config */
export function getCompiledLexer(config: LexerConfig): CompiledLexer {
  let lexer = lexerCache.get(config);
  if (!lexer) {
    lexer = new CompiledLexer(config);
    lexerCache.set(config, lexer);
  }
  return lexer;
}

/** Tokenize source code using a lexer config */
export function tokenizeWithConfig(
  source: string,
  config: LexerConfig,
): Token[] {
  return getCompiledLexer(config).tokenize(source);
}
