import type { LanguageProfile } from "../schema/profile.js";
import { json } from "./json.js";
import { css } from "./css.js";
import { scss } from "./scss.js";
import { python } from "./python.js";
import { go } from "./go.js";
import { javascript } from "./javascript.js";
import { typescript } from "./typescript.js";
import { cpp } from "./cpp.js";
import { html } from "./html.js";
import { markdown } from "./markdown.js";
import { yaml } from "./yaml.js";
import { xml } from "./xml.js";
import { java } from "./java.js";
import { csharp } from "./csharp.js";
import { rust } from "./rust.js";
import { ruby } from "./ruby.js";
import { php } from "./php.js";
import { kotlin } from "./kotlin.js";
import { swift } from "./swift.js";
import { shell } from "./shell.js";
import { bash } from "./bash.js";
import { sql } from "./sql.js";
import { toml } from "./toml.js";

// Re-export individual profiles
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
};
export { resolveProfile } from "./resolver.js";

/** All built-in language profiles */
export const builtinProfiles: LanguageProfile[] = [
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
];

// ---------------------------------------------------------------------------
// Profile registry
// ---------------------------------------------------------------------------

/** Map of profile name -> profile */
const profilesByName = new Map<string, LanguageProfile>();

/** Map of file extension -> profile */
const profilesByExtension = new Map<string, LanguageProfile>();

/** Register a language profile */
export function registerProfile(profile: LanguageProfile): void {
  profilesByName.set(profile.name, profile);
  for (const ext of profile.fileExtensions) {
    profilesByExtension.set(ext.toLowerCase(), profile);
  }
}

/** Get a profile by name (e.g., 'typescript') or file extension (e.g., '.ts') */
export function getProfile(nameOrExt: string): LanguageProfile | undefined {
  return (
    profilesByName.get(nameOrExt) ??
    profilesByExtension.get(nameOrExt.toLowerCase())
  );
}

/** Get all registered profile names */
export function getRegisteredLanguages(): string[] {
  return Array.from(profilesByName.keys());
}

/** Get the file extensions supported by all registered profiles */
export function getSupportedExtensions(): string[] {
  return Array.from(profilesByExtension.keys());
}

// Register all built-in profiles
for (const profile of builtinProfiles) {
  registerProfile(profile);
}
