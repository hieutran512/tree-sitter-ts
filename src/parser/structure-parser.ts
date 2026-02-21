// ---------------------------------------------------------------------------
// Structure Parser
//
// High-level API that combines the lexer, block tracker, and symbol
// detector to extract CodeSymbol[] from source code.
// ---------------------------------------------------------------------------

import type { LanguageProfile } from "../schema/profile.js";
import type { Token } from "../types/token.js";
import type { CodeSymbol } from "../types/tree.js";
import { tokenizeWithConfig } from "../lexer/lexer.js";
import { findBlockSpans } from "./block-tracker.js";
import { detectSymbols } from "./symbol-detector.js";

/**
 * Extract code symbols from source code using a language profile.
 * Requires the profile to have a structure config (Level 2).
 * Returns an empty array if no structure config is present.
 */
export function extractSymbolsFromProfile(
  source: string,
  profile: LanguageProfile,
): CodeSymbol[] {
  if (!profile.structure) return [];

  const tokens = tokenizeWithConfig(source, profile.lexer);
  return extractSymbolsFromTokens(tokens, profile);
}

/**
 * Extract code symbols from a pre-tokenized token stream.
 * Useful when you already have tokens and want to avoid re-tokenizing.
 */
export function extractSymbolsFromTokens(
  tokens: Token[],
  profile: LanguageProfile,
): CodeSymbol[] {
  if (!profile.structure) return [];

  const { blocks, symbols: symbolRules } = profile.structure;
  const skipTokens = new Set(profile.lexer.skipTokens ?? []);

  // Find all block spans (brace matching)
  const blockSpans = findBlockSpans(tokens, blocks);

  // Detect symbols using pattern matching
  return detectSymbols(tokens, symbolRules, blockSpans, skipTokens);
}
