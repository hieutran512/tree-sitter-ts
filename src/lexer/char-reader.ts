// ---------------------------------------------------------------------------
// CharReader - character-by-character source reader with position tracking
// ---------------------------------------------------------------------------

import type { Position } from "../schema/common.js";

/** Reads source code character by character, tracking line/column/offset */
export class CharReader {
  private readonly src: string;
  private readonly len: number;
  private pos = 0;
  private line = 1;
  private col = 0;

  constructor(source: string) {
    this.src = source;
    this.len = source.length;
  }

  /** Current byte offset */
  get offset(): number {
    return this.pos;
  }

  /** Whether we've reached end of source */
  get eof(): boolean {
    return this.pos >= this.len;
  }

  /** Remaining characters from current position */
  get remaining(): number {
    return this.len - this.pos;
  }

  /** Current position as Position object */
  get position(): Position {
    return { line: this.line, column: this.col, offset: this.pos };
  }

  /** Peek at the current character without advancing */
  peek(): string {
    return this.pos < this.len ? this.src[this.pos] : "";
  }

  /** Peek at character at offset from current position */
  peekAt(offset: number): string {
    const idx = this.pos + offset;
    return idx < this.len ? this.src[idx] : "";
  }

  /** Peek at a substring from current position */
  peekString(length: number): string {
    return this.src.slice(this.pos, this.pos + length);
  }

  /** Get the char code at current position */
  peekCode(): number {
    return this.pos < this.len ? this.src.charCodeAt(this.pos) : -1;
  }

  /** Advance one character and return it */
  advance(): string {
    if (this.pos >= this.len) return "";
    const ch = this.src[this.pos];
    this.pos++;
    if (ch === "\n") {
      this.line++;
      this.col = 0;
    } else if (ch === "\r") {
      // Handle \r\n as single newline
      if (this.pos < this.len && this.src[this.pos] === "\n") {
        this.pos++;
      }
      this.line++;
      this.col = 0;
    } else {
      this.col++;
    }
    return ch;
  }

  /** Advance N characters and return the consumed substring */
  advanceN(n: number): string {
    const start = this.pos;
    for (let i = 0; i < n && this.pos < this.len; i++) {
      this.advance();
    }
    return this.src.slice(start, this.pos);
  }

  /** Check if source starts with the given string at current position */
  startsWith(str: string): boolean {
    if (this.pos + str.length > this.len) return false;
    for (let i = 0; i < str.length; i++) {
      if (this.src[this.pos + i] !== str[i]) return false;
    }
    return true;
  }

  /** Get a slice of the source from start offset to current position */
  sliceFrom(startOffset: number): string {
    return this.src.slice(startOffset, this.pos);
  }

  /** Get the full source string */
  get source(): string {
    return this.src;
  }

  /** Save current state for backtracking */
  save(): ReaderState {
    return { pos: this.pos, line: this.line, col: this.col };
  }

  /** Restore a previously saved state */
  restore(state: ReaderState): void {
    this.pos = state.pos;
    this.line = state.line;
    this.col = state.col;
  }
}

/** Saved reader state for backtracking */
export interface ReaderState {
  pos: number;
  line: number;
  col: number;
}
