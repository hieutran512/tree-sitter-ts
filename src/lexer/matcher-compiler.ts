// ---------------------------------------------------------------------------
// Matcher Compiler
//
// Compiles declarative Matcher definitions into executable scanner functions.
// Each compiled function takes a CharReader and returns the number of
// characters consumed (0 = no match).
// ---------------------------------------------------------------------------

import type { CharClass } from "../schema/common.js";
import type { Matcher } from "../schema/lexer.js";
import type { CharReader } from "./char-reader.js";
import { compileCharClass } from "./char-classes.js";

/** A compiled scanner: returns chars consumed (0 = no match) */
export type ScanFn = (reader: CharReader) => number;

/**
 * Compile a Matcher definition into an executable ScanFn.
 * The charClasses map provides named character class resolution.
 */
export function compileMatcher(
  matcher: Matcher,
  charClasses: Record<string, CharClass> = {},
): ScanFn {
  switch (matcher.kind) {
    case "string":
      return compileStringMatcher(matcher.value);
    case "keywords":
      return compileKeywordsMatcher(matcher.words);
    case "delimited":
      return compileDelimitedMatcher(
        matcher.open,
        matcher.close,
        matcher.escape,
        matcher.multiline ?? false,
        matcher.nested ?? false,
      );
    case "line":
      return compileLineMatcher(matcher.start);
    case "charSequence":
      return compileCharSequenceMatcher(
        matcher.first,
        matcher.rest,
        charClasses,
      );
    case "number":
      return compileNumberMatcher(matcher);
    case "sequence":
      return compileSequenceMatcher(matcher.elements, charClasses);
    case "pattern":
      return compilePatternMatcher(matcher.regex);
  }
}

// ---------------------------------------------------------------------------
// String matcher: exact string or array of strings (longest match)
// ---------------------------------------------------------------------------

function compileStringMatcher(value: string | string[]): ScanFn {
  if (typeof value === "string") {
    const len = value.length;
    return (reader) => (reader.startsWith(value) ? len : 0);
  }
  // Sort by length descending for longest match first
  const sorted = [...value].sort((a, b) => b.length - a.length);
  return (reader) => {
    for (const s of sorted) {
      if (reader.startsWith(s)) return s.length;
    }
    return 0;
  };
}

// ---------------------------------------------------------------------------
// Keywords matcher: word-boundary-aware exact match
// ---------------------------------------------------------------------------

function compileKeywordsMatcher(words: string[]): ScanFn {
  // Sort by length descending for longest match first
  const sorted = [...words].sort((a, b) => b.length - a.length);
  return (reader) => {
    for (const word of sorted) {
      if (!reader.startsWith(word)) continue;
      // Check word boundary after the keyword
      const afterIdx = word.length;
      const after = reader.peekAt(afterIdx);
      if (after === "" || !isWordChar(after)) {
        // Check word boundary before (char before current position)
        // The lexer processes left-to-right, so if we're here, the previous
        // token ended, meaning we're at a boundary. But we also need to check
        // that we're not in the middle of an identifier. We check the char
        // immediately before the reader's current position in the source.
        const beforeIdx = reader.offset - 1;
        if (beforeIdx < 0 || !isWordChar(reader.source[beforeIdx])) {
          return word.length;
        }
      }
    }
    return 0;
  };
}

function isWordChar(ch: string): boolean {
  return /^[a-zA-Z0-9_$]$/.test(ch);
}

// ---------------------------------------------------------------------------
// Delimited matcher: content between open/close markers
// ---------------------------------------------------------------------------

function compileDelimitedMatcher(
  open: string,
  close: string,
  escape: string | undefined,
  multiline: boolean,
  nested: boolean,
): ScanFn {
  const openLen = open.length;
  const closeLen = close.length;

  return (reader) => {
    if (!reader.startsWith(open)) return 0;

    const startPos = reader.offset;
    const src = reader.source;
    let pos = startPos + openLen;
    let depth = 1;

    while (pos < src.length) {
      // Check escape character
      if (escape && src[pos] === escape) {
        pos += 2; // skip escaped char
        continue;
      }

      // Check for nested open (if nesting enabled)
      if (nested && matchAt(src, pos, open)) {
        depth++;
        pos += openLen;
        continue;
      }

      // Check for close
      if (matchAt(src, pos, close)) {
        depth--;
        if (depth === 0) {
          return pos + closeLen - startPos;
        }
        pos += closeLen;
        continue;
      }

      // Check newline restriction
      if (!multiline && (src[pos] === "\n" || src[pos] === "\r")) {
        return 0; // unmatched - hit newline in single-line mode
      }

      pos++;
    }

    return 0; // unmatched - hit EOF
  };
}

function matchAt(src: string, pos: number, str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (src[pos + i] !== str[i]) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Line matcher: from marker to end of line
// ---------------------------------------------------------------------------

function compileLineMatcher(start: string): ScanFn {
  const startLen = start.length;
  return (reader) => {
    if (!reader.startsWith(start)) return 0;
    const src = reader.source;
    let pos = reader.offset + startLen;
    while (pos < src.length && src[pos] !== "\n" && src[pos] !== "\r") {
      pos++;
    }
    return pos - reader.offset;
  };
}

// ---------------------------------------------------------------------------
// CharSequence matcher: sequences of characters from a class
// ---------------------------------------------------------------------------

function compileCharSequenceMatcher(
  first: CharClass,
  rest: CharClass | undefined,
  charClasses: Record<string, CharClass>,
): ScanFn {
  const testFirst = compileCharClass(first, charClasses);
  const testRest = rest ? compileCharClass(rest, charClasses) : null;

  return (reader) => {
    const ch = reader.peek();
    if (!ch || !testFirst(ch)) return 0;

    if (!testRest) return 1; // single char match

    const src = reader.source;
    let pos = reader.offset + 1;
    while (pos < src.length && testRest(src[pos])) {
      pos++;
    }
    return pos - reader.offset;
  };
}

// ---------------------------------------------------------------------------
// Number matcher: numeric literals
// ---------------------------------------------------------------------------

function compileNumberMatcher(opts: {
  integer?: boolean;
  float?: boolean;
  hex?: boolean;
  octal?: boolean;
  binary?: boolean;
  scientific?: boolean;
  separator?: string;
  suffix?: string[];
}): ScanFn {
  return (reader) => {
    const src = reader.source;
    const start = reader.offset;
    let pos = start;

    // Check for prefix-based formats (0x, 0o, 0b)
    if (pos < src.length && src[pos] === "0" && pos + 1 < src.length) {
      const next = src[pos + 1];

      // Hex: 0x or 0X
      if (opts.hex && (next === "x" || next === "X")) {
        pos += 2;
        const hexStart = pos;
        while (pos < src.length && isHexDigit(src[pos])) {
          pos++;
          if (opts.separator && pos < src.length && src[pos] === opts.separator) {
            pos++;
          }
        }
        if (pos === hexStart) return 0; // no digits after 0x
        return consumeSuffix(src, pos, opts.suffix) - start;
      }

      // Octal: 0o or 0O
      if (opts.octal && (next === "o" || next === "O")) {
        pos += 2;
        const octStart = pos;
        while (pos < src.length && src[pos] >= "0" && src[pos] <= "7") {
          pos++;
          if (opts.separator && pos < src.length && src[pos] === opts.separator) {
            pos++;
          }
        }
        if (pos === octStart) return 0;
        return consumeSuffix(src, pos, opts.suffix) - start;
      }

      // Binary: 0b or 0B
      if (opts.binary && (next === "b" || next === "B")) {
        pos += 2;
        const binStart = pos;
        while (pos < src.length && (src[pos] === "0" || src[pos] === "1")) {
          pos++;
          if (opts.separator && pos < src.length && src[pos] === opts.separator) {
            pos++;
          }
        }
        if (pos === binStart) return 0;
        return consumeSuffix(src, pos, opts.suffix) - start;
      }
    }

    // Decimal integer/float
    if (!opts.integer && !opts.float) return 0;

    // Must start with digit or dot-digit for floats
    const isDigit = pos < src.length && src[pos] >= "0" && src[pos] <= "9";
    const isDotDigit =
      opts.float &&
      pos < src.length &&
      src[pos] === "." &&
      pos + 1 < src.length &&
      src[pos + 1] >= "0" &&
      src[pos + 1] <= "9";

    if (!isDigit && !isDotDigit) return 0;

    // Consume integer part
    while (pos < src.length && src[pos] >= "0" && src[pos] <= "9") {
      pos++;
      if (opts.separator && pos < src.length && src[pos] === opts.separator) {
        pos++;
      }
    }

    // Consume decimal part
    if (opts.float && pos < src.length && src[pos] === ".") {
      const afterDot = pos + 1;
      if (afterDot < src.length && src[afterDot] >= "0" && src[afterDot] <= "9") {
        pos = afterDot;
        while (pos < src.length && src[pos] >= "0" && src[pos] <= "9") {
          pos++;
          if (opts.separator && pos < src.length && src[pos] === opts.separator) {
            pos++;
          }
        }
      }
    }

    // No digits consumed
    if (pos === start) return 0;

    // Scientific notation
    if (
      opts.scientific &&
      pos < src.length &&
      (src[pos] === "e" || src[pos] === "E")
    ) {
      let ePos = pos + 1;
      if (ePos < src.length && (src[ePos] === "+" || src[ePos] === "-")) {
        ePos++;
      }
      const eDigitStart = ePos;
      while (ePos < src.length && src[ePos] >= "0" && src[ePos] <= "9") {
        ePos++;
      }
      if (ePos > eDigitStart) {
        pos = ePos;
      }
    }

    return consumeSuffix(src, pos, opts.suffix) - start;
  };
}

function isHexDigit(ch: string): boolean {
  return (
    (ch >= "0" && ch <= "9") ||
    (ch >= "a" && ch <= "f") ||
    (ch >= "A" && ch <= "F")
  );
}

function consumeSuffix(
  src: string,
  pos: number,
  suffixes: string[] | undefined,
): number {
  if (!suffixes) return pos;
  // Try longest suffix first
  for (const suf of [...suffixes].sort((a, b) => b.length - a.length)) {
    if (matchAt(src, pos, suf)) {
      return pos + suf.length;
    }
  }
  return pos;
}

// ---------------------------------------------------------------------------
// Sequence matcher: all elements must match in order
// ---------------------------------------------------------------------------

function compileSequenceMatcher(
  elements: Matcher[],
  charClasses: Record<string, CharClass>,
): ScanFn {
  const fns = elements.map((e) => compileMatcher(e, charClasses));
  return (reader) => {
    const saved = reader.save();
    let total = 0;
    for (const fn of fns) {
      const n = fn(reader);
      if (n === 0) {
        reader.restore(saved);
        return 0;
      }
      // Advance reader past what was matched
      reader.advanceN(n);
      total += n;
    }
    // Restore reader to original position - the lexer will do the actual advance
    reader.restore(saved);
    return total;
  };
}

// ---------------------------------------------------------------------------
// Pattern matcher: regex escape hatch
// ---------------------------------------------------------------------------

function compilePatternMatcher(regex: string): ScanFn {
  const re = new RegExp("^(?:" + regex + ")");
  return (reader) => {
    const src = reader.source;
    const sub = src.slice(reader.offset);
    const m = re.exec(sub);
    return m ? m[0].length : 0;
  };
}
