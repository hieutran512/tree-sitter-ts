// ---------------------------------------------------------------------------
// Profile Resolver
//
// Handles profile inheritance via the `extends` field.
// Merges parent and child profiles, with child overriding parent.
// ---------------------------------------------------------------------------

import type { LanguageProfile } from "../schema/profile.js";
import type { LexerConfig, LexerState } from "../schema/lexer.js";
import type { StructureConfig } from "../schema/structure.js";

/**
 * Resolve a profile's inheritance chain.
 * If the profile has `extends`, looks up the parent in the registry
 * and merges them (child overrides parent).
 */
export function resolveProfile(
  profile: LanguageProfile,
  registry: Map<string, LanguageProfile>,
): LanguageProfile {
  if (!profile.extends) return profile;

  const parent = registry.get(profile.extends);
  if (!parent) {
    throw new Error(
      `Profile "${profile.name}" extends "${profile.extends}" but parent not found in registry`,
    );
  }

  // Resolve parent first (recursive)
  const resolvedParent = resolveProfile(parent, registry);

  return mergeProfiles(resolvedParent, profile);
}

/** Merge parent and child profiles. Child wins on conflicts. */
function mergeProfiles(
  parent: LanguageProfile,
  child: LanguageProfile,
): LanguageProfile {
  return {
    name: child.name,
    displayName: child.displayName,
    version: child.version,
    fileExtensions: child.fileExtensions,
    mimeTypes: child.mimeTypes ?? parent.mimeTypes,

    // Merge lexer
    lexer: mergeLexerConfig(parent.lexer, child.lexer),

    // Merge structure (child wins entirely if present, otherwise inherit parent)
    structure: child.structure ?? parent.structure
      ? mergeStructureConfig(parent.structure, child.structure)
      : undefined,

    // Grammar: child wins entirely (no merge)
    grammar: child.grammar ?? parent.grammar,

    // Embedded languages: child wins entirely
    embeddedLanguages: child.embeddedLanguages ?? parent.embeddedLanguages,
  };
}

function mergeLexerConfig(
  parent: LexerConfig,
  child: LexerConfig,
): LexerConfig {
  // Merge char classes
  const charClasses = {
    ...(parent.charClasses ?? {}),
    ...(child.charClasses ?? {}),
  };

  // Merge token types (child overrides)
  const tokenTypes = {
    ...parent.tokenTypes,
    ...child.tokenTypes,
  };

  // Merge states: child states override parent states entirely
  // But parent-only states are preserved
  const states: Record<string, LexerState> = {};
  for (const [name, state] of Object.entries(parent.states)) {
    states[name] = state;
  }
  for (const [name, state] of Object.entries(child.states)) {
    states[name] = state;
  }

  return {
    charClasses,
    tokenTypes,
    states,
    initialState: child.initialState ?? parent.initialState,
    skipTokens: child.skipTokens ?? parent.skipTokens,
    indentation: child.indentation ?? parent.indentation,
  };
}

function mergeStructureConfig(
  parent: StructureConfig | undefined,
  child: StructureConfig | undefined,
): StructureConfig | undefined {
  if (!parent && !child) return undefined;
  if (!parent) return child;
  if (!child) return parent;

  return {
    // Child blocks override parent entirely
    blocks: child.blocks.length > 0 ? child.blocks : parent.blocks,
    // Child symbols added to parent symbols (child first for priority)
    symbols: [...child.symbols, ...parent.symbols],
    // Child folding overrides
    folding: child.folding ?? parent.folding,
  };
}
