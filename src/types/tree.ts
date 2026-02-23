// ---------------------------------------------------------------------------
// Output types: Syntax tree and code symbols
// ---------------------------------------------------------------------------

import type { Range, SymbolKind } from "../schema/common.js";

/** A node in the syntax tree */
export interface SyntaxNode {
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
export interface CodeSymbol {
  /** Symbol name (e.g., function/class name) */
  name: string;
  /** Symbol kind classification */
  kind: SymbolKind;
  /** Symbol name token span */
  nameRange: Range;
  /** Symbol full content span */
  contentRange: Range;
}
