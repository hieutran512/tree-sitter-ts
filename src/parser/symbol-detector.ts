// ---------------------------------------------------------------------------
// Symbol Detector
//
// Matches SymbolRule patterns against a token stream to identify
// structural constructs (functions, classes, headings, tables, etc.).
// ---------------------------------------------------------------------------

import type { SymbolRule, TokenPatternStep } from "../schema/structure.js";
import type { Token } from "../types/token.js";
import type { CodeSymbol } from "../types/tree.js";
import type { BlockSpan } from "./block-tracker.js";
import { findNextBlock } from "./block-tracker.js";

/** Internal match result from pattern matching */
interface PatternMatch {
  /** Token index where the match started */
  startIndex: number;
  /** Token index after the last matched token */
  endIndex: number;
  /** Captured values by name */
  captures: Record<string, string>;
  /** Captured token positions by capture name (index in filtered token array) */
  captureIndices: Record<string, number>;
}

/**
 * Detect symbols in a token stream using the given symbol rules.
 * Skip tokens are filtered out before matching.
 */
export function detectSymbols(
  tokens: Token[],
  rules: SymbolRule[],
  blockSpans: BlockSpan[],
  skipTokens: Set<string>,
): CodeSymbol[] {
  // Build a filtered token array (skip whitespace/comments) but keep index mapping
  const filtered: Array<{ token: Token; originalIndex: number }> = [];
  for (let i = 0; i < tokens.length; i++) {
    if (!skipTokens.has(tokens[i].type)) {
      filtered.push({ token: tokens[i], originalIndex: i });
    }
  }

  const symbols: CodeSymbol[] = [];
  const used = new Set<number>(); // filtered indices already claimed

  for (const rule of rules) {
    for (let fi = 0; fi < filtered.length; fi++) {
      if (used.has(fi)) continue;

      const match = tryMatch(filtered, fi, rule.pattern);
      if (!match) continue;

      const name = match.captures["name"] ?? rule.name;
      const startOriginalIndex = filtered[match.startIndex].originalIndex;
      const lastMatchOriginalIndex = filtered[match.endIndex - 1]?.originalIndex ?? startOriginalIndex;

      let endOriginalIndex = lastMatchOriginalIndex;

      // Find the body end
      if (rule.hasBody) {
        if (rule.bodyStyle === "braces") {
          // Find the next brace block after the pattern match
          const block = findNextBlock(blockSpans, lastMatchOriginalIndex, "braces");
          if (block) {
            endOriginalIndex = block.closeIndex;
          }
        } else if (rule.bodyStyle === "indentation") {
          // For indentation-based bodies, find where indentation returns to
          // the same or lower level
          const baseIndent = tokens[startOriginalIndex].range.start.column;
          endOriginalIndex = findIndentationEndIndex(tokens, lastMatchOriginalIndex, baseIndent);
        } else if (rule.bodyStyle === "markup-block") {
          // For markup blocks (Markdown tables, lists, blockquotes), find next blank line or EOF
          endOriginalIndex = findMarkupBlockEndIndex(tokens, lastMatchOriginalIndex);
        }
      } else {
        // No body: symbol ends at end of current line or semicolon
        endOriginalIndex = findStatementEndIndex(tokens, lastMatchOriginalIndex);
      }

      const nameOriginalIndex =
        match.captureIndices["name"] !== undefined
          ? filtered[match.captureIndices["name"]].originalIndex
          : startOriginalIndex;

      const nameToken = tokens[nameOriginalIndex] ?? tokens[startOriginalIndex];
      const startToken = tokens[startOriginalIndex];
      const endToken = tokens[endOriginalIndex] ?? tokens[lastMatchOriginalIndex];

      symbols.push({
        name,
        kind: rule.kind,
        nameRange: nameToken.range,
        contentRange: {
          start: startToken.range.start,
          end: endToken.range.end,
        },
      });

      // Mark the matched filtered indices as used
      for (let k = match.startIndex; k < match.endIndex; k++) {
        used.add(k);
      }
    }
  }

  // Sort by content start position
  symbols.sort((a, b) => {
    if (a.contentRange.start.line === b.contentRange.start.line) {
      return a.contentRange.start.column - b.contentRange.start.column;
    }
    return a.contentRange.start.line - b.contentRange.start.line;
  });
  return symbols;
}

// ---------------------------------------------------------------------------
// Pattern matching against filtered tokens
// ---------------------------------------------------------------------------

function tryMatch(
  filtered: Array<{ token: Token; originalIndex: number }>,
  startIdx: number,
  pattern: TokenPatternStep[],
): PatternMatch | null {
  const captures: Record<string, string> = {};
  const captureIndices: Record<string, number> = {};
  let idx = startIdx;

  for (let pi = 0; pi < pattern.length; pi++) {
    const step = pattern[pi];

    if (idx >= filtered.length) return null;

    if ("skip" in step && step.skip) {
      // Skip: find next step match within maxTokens
      const nextStep = pattern[pi + 1];
      if (!nextStep) return null; // skip at end makes no sense
      const maxTokens = step.maxTokens ?? 50;
      let found = false;
      const limit = Math.min(idx + maxTokens, filtered.length);
      for (let si = idx; si < limit; si++) {
        if (matchSingleStep(filtered[si].token, nextStep, captures, captureIndices, si)) {
          idx = si;
          found = true;
          break;
        }
      }
      if (!found) return null;
      // The next iteration of the outer loop will re-process the nextStep
      // So we skip the pi++ that would skip it
      // Actually, we already matched nextStep at idx, so advance past it
      idx++;
      pi++; // skip the next pattern step since we matched it here
      continue;
    }

    if ("optional" in step) {
      // Try to match, but don't fail if it doesn't
      if (matchSingleStep(filtered[idx].token, step.optional, captures, captureIndices, idx)) {
        idx++;
      }
      continue;
    }

    if ("anyOf" in step) {
      let anyMatched = false;
      for (const alt of step.anyOf) {
        if (matchSingleStep(filtered[idx].token, alt, captures, captureIndices, idx)) {
          anyMatched = true;
          idx++;
          break;
        }
      }
      if (!anyMatched) return null;
      continue;
    }

    // Regular token match
    if ("token" in step) {
      if (!matchTokenStep(filtered[idx].token, step)) return null;
      if (step.capture) {
        captures[step.capture] = filtered[idx].token.value;
        captureIndices[step.capture] = idx;
      }
      idx++;
      continue;
    }

    return null; // unknown step type
  }

  return { startIndex: startIdx, endIndex: idx, captures, captureIndices };
}

function matchSingleStep(
  token: Token,
  step: TokenPatternStep,
  captures: Record<string, string>,
  captureIndices: Record<string, number>,
  index: number,
): boolean {
  if ("token" in step) {
    if (!matchTokenStep(token, step)) return false;
    if (step.capture) {
      captures[step.capture] = token.value;
      captureIndices[step.capture] = index;
    }
    return true;
  }
  if ("anyOf" in step) {
    return step.anyOf.some((alt) => matchSingleStep(token, alt, captures, captureIndices, index));
  }
  return false;
}

function matchTokenStep(
  token: Token,
  step: { token: string; value?: string },
): boolean {
  if (token.type !== step.token) return false;
  if (step.value !== undefined && token.value !== step.value) return false;
  return true;
}

// ---------------------------------------------------------------------------
// End-line detection helpers
// ---------------------------------------------------------------------------

/** Find where an indentation-based body ends */
function findIndentationEndIndex(
  tokens: Token[],
  afterIndex: number,
  baseIndent: number,
): number {
  let lastContentIndex = afterIndex;
  let foundBody = false;

  for (let i = afterIndex + 1; i < tokens.length; i++) {
    const tok = tokens[i];
    // Skip whitespace and newlines
    if (tok.category === "whitespace" || tok.category === "newline") continue;

    const col = tok.range.start.column;

    if (!foundBody) {
      // First non-whitespace after the header - must be indented
      if (col > baseIndent) {
        foundBody = true;
        lastContentIndex = i;
      } else {
        // Not indented - no body
        return lastContentIndex;
      }
    } else {
      // In body - check if we've de-dented back to base or further
      if (col <= baseIndent) {
        return lastContentIndex;
      }
      lastContentIndex = i;
    }
  }

  return lastContentIndex;
}

/** Find the end of a statement (next newline or semicolon at depth 0) */
function findStatementEndIndex(tokens: Token[], fromIndex: number): number {
  let endIndex = fromIndex;
  let depth = 0;

  for (let i = fromIndex + 1; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok.value === "{" || tok.value === "(" || tok.value === "[") depth++;
    if (tok.value === "}" || tok.value === ")" || tok.value === "]") depth--;

    if (depth === 0) {
      if (tok.value === ";") return i;
      if (tok.category === "newline" && depth <= 0) return endIndex;
    }

    if (tok.category !== "whitespace" && tok.category !== "newline") {
      endIndex = i;
    }
  }

  return endIndex;
}

/** Find the end of a markup block (Markdown table/list/blockquote) by scanning until blank line */
function findMarkupBlockEndIndex(tokens: Token[], fromIndex: number): number {
  let endIndex = fromIndex;
  let lastContentLine = tokens[fromIndex]?.range.start.line ?? 1;
  let blankLineCount = 0;

  for (let i = fromIndex + 1; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok.category === "newline") {
      // Track consecutive blank lines (newlines with only whitespace between them)
      if (i + 1 < tokens.length && tokens[i + 1].category === "newline") {
        blankLineCount++;
      } else {
        blankLineCount = 0;
      }

      // Stop on blank line (two consecutive newlines or end of content)
      if (blankLineCount > 0) {
        return endIndex;
      }
      continue;
    }

    if (tok.category !== "whitespace") {
      endIndex = i;
      lastContentLine = tok.range.start.line;
      blankLineCount = 0;
    }
  }

  return endIndex;
}
