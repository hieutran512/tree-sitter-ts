// ---------------------------------------------------------------------------
// Character class evaluation
// ---------------------------------------------------------------------------

import type { CharClass } from "../schema/common.js";

/**
 * Compile a CharClass definition into a fast character-test function.
 * Named references are resolved via the provided charClasses map.
 */
export function compileCharClass(
  def: CharClass,
  charClasses: Record<string, CharClass> = {},
): (ch: string) => boolean {
  return buildTest(def, charClasses);
}

function buildTest(
  def: CharClass,
  refs: Record<string, CharClass>,
): (ch: string) => boolean {
  if ("predefined" in def) {
    switch (def.predefined) {
      case "letter":
        return (ch) => /^[a-zA-Z\u00C0-\u024F]$/.test(ch);
      case "upper":
        return (ch) => ch >= "A" && ch <= "Z";
      case "lower":
        return (ch) => ch >= "a" && ch <= "z";
      case "digit":
        return (ch) => ch >= "0" && ch <= "9";
      case "hexDigit":
        return (ch) =>
          (ch >= "0" && ch <= "9") ||
          (ch >= "a" && ch <= "f") ||
          (ch >= "A" && ch <= "F");
      case "alphanumeric":
        return (ch) =>
          /^[a-zA-Z\u00C0-\u024F]$/.test(ch) ||
          (ch >= "0" && ch <= "9");
      case "whitespace":
        return (ch) => ch === " " || ch === "\t";
      case "newline":
        return (ch) => ch === "\n" || ch === "\r";
      case "any":
        return (ch) => ch.length > 0;
    }
  }
  if ("chars" in def) {
    const set = new Set(def.chars);
    return (ch) => set.has(ch);
  }
  if ("range" in def) {
    const [lo, hi] = def.range;
    return (ch) => ch >= lo && ch <= hi;
  }
  if ("union" in def) {
    const tests = def.union.map((c) => buildTest(c, refs));
    return (ch) => tests.some((t) => t(ch));
  }
  if ("negate" in def) {
    const inner = buildTest(def.negate, refs);
    return (ch) => ch.length > 0 && !inner(ch);
  }
  if ("ref" in def) {
    const resolved = refs[def.ref];
    if (!resolved) {
      throw new Error(`Unknown charClass reference: "${def.ref}"`);
    }
    return buildTest(resolved, refs);
  }
  throw new Error(`Unknown CharClass variant: ${JSON.stringify(def)}`);
}
