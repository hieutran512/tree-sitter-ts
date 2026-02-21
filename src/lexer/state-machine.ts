// ---------------------------------------------------------------------------
// Lexer State Machine
//
// Manages the lexer state stack for context-dependent tokenization.
// Supports push (enter nested context), pop (leave context), and
// switchTo (replace current context).
// ---------------------------------------------------------------------------

/** Manages the lexer state stack */
export class StateMachine {
  private readonly stack: string[];

  constructor(initialState: string) {
    this.stack = [initialState];
  }

  /** Current state name */
  get current(): string {
    return this.stack[this.stack.length - 1];
  }

  /** Stack depth */
  get depth(): number {
    return this.stack.length;
  }

  /** Push a new state onto the stack */
  push(state: string): void {
    this.stack.push(state);
  }

  /** Pop the current state. Never pops the last state. */
  pop(): void {
    if (this.stack.length > 1) {
      this.stack.pop();
    }
  }

  /** Replace the current state */
  switchTo(state: string): void {
    this.stack[this.stack.length - 1] = state;
  }

  /** Apply transitions from a matched rule */
  applyTransition(rule: {
    push?: string;
    pop?: boolean;
    switchTo?: string;
  }): void {
    if (rule.push) {
      this.push(rule.push);
    } else if (rule.pop) {
      this.pop();
    } else if (rule.switchTo) {
      this.switchTo(rule.switchTo);
    }
  }

  /** Save current stack state for backtracking */
  save(): string[] {
    return [...this.stack];
  }

  /** Restore a previously saved stack state */
  restore(saved: string[]): void {
    this.stack.length = 0;
    this.stack.push(...saved);
  }
}
