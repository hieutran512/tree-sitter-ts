// ---------------------------------------------------------------------------
// Top-level Language Profile
//
// A complete language definition for tree-sitter-ts.
// Minimum viable profile only needs: name, fileExtensions, lexer.
// Structure and grammar levels are optional and additive.
// ---------------------------------------------------------------------------

import type { LexerConfig } from "./lexer.js";
import type { StructureConfig } from "./structure.js";
import type { GrammarConfig } from "./grammar.js";

// ---------------------------------------------------------------------------
// Language profile
// ---------------------------------------------------------------------------

/**
 * A complete language profile for tree-sitter-ts.
 *
 * Three-level architecture:
 * - Level 1 (lexer): REQUIRED - tokenization, syntax highlighting
 * - Level 2 (structure): Optional - RAG chunking, code folding, symbol outline
 * - Level 3 (grammar): Optional - full AST, syntax validation
 */
export interface LanguageProfile {
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

// ---------------------------------------------------------------------------
// Embedded language support
// ---------------------------------------------------------------------------

/** Rule for detecting embedded language regions within a host language */
export interface EmbeddedLanguageRule {
  /** Language to switch to (must be a registered profile name) */
  language: string;
  /** Token pattern that marks the start of the embedded region */
  start: { token: string; value?: string };
  /** Token pattern that marks the end of the embedded region */
  end: { token: string; value?: string };
  /** How to determine which language to use */
  languageDetection?: "fixed" | "attribute";
  /** Token whose value contains the language name (when detection is 'attribute') */
  attributeToken?: string;
}
