// ---------------------------------------------------------------------------
// Block Tracker
//
// Tracks brace/bracket/paren nesting from BlockRule definitions.
// Used by the Symbol Detector to find where symbol bodies end.
// ---------------------------------------------------------------------------

import type { BlockRule } from "../schema/structure.js";
import type { Token } from "../types/token.js";

/** A matched block with open/close token indices */
export interface BlockSpan {
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
export function findBlockSpans(
  tokens: Token[],
  blockRules: BlockRule[],
): BlockSpan[] {
  // Build lookup maps
  const openToRule = new Map<string, BlockRule>();
  const closeToRule = new Map<string, BlockRule>();
  for (const rule of blockRules) {
    openToRule.set(rule.open, rule);
    closeToRule.set(rule.close, rule);
  }

  const spans: BlockSpan[] = [];
  // Stack of [ruleName, openIndex, depth]
  const stack: Array<{ name: string; openIndex: number; depth: number }> = [];

  for (let i = 0; i < tokens.length; i++) {
    const val = tokens[i].value;

    const openRule = openToRule.get(val);
    if (openRule) {
      stack.push({ name: openRule.name, openIndex: i, depth: stack.length });
      continue;
    }

    const closeRule = closeToRule.get(val);
    if (closeRule) {
      // Find matching open on the stack (search from top)
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].name === closeRule.name) {
          const entry = stack[j];
          spans.push({
            name: entry.name,
            openIndex: entry.openIndex,
            closeIndex: i,
            depth: entry.depth,
          });
          // Remove this entry and everything above it (mismatched closes)
          stack.length = j;
          break;
        }
      }
    }
  }

  spans.sort((a, b) => a.openIndex - b.openIndex);
  return spans;
}

/**
 * Given an opening token index, find the matching closing token index.
 * Uses the precomputed block spans.
 */
export function findMatchingClose(
  spans: BlockSpan[],
  openIndex: number,
): number | undefined {
  for (const span of spans) {
    if (span.openIndex === openIndex) return span.closeIndex;
  }
  return undefined;
}

/**
 * Find the block span that starts at or after the given token index
 * with the specified block rule name.
 */
export function findNextBlock(
  spans: BlockSpan[],
  afterIndex: number,
  blockName: string,
): BlockSpan | undefined {
  for (const span of spans) {
    if (span.openIndex >= afterIndex && span.name === blockName) {
      return span;
    }
  }
  return undefined;
}
