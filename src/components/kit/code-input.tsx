"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

import { cx } from "@/components/kit/primitives";

/**
 * The 6-digit authenticator code: one box per digit, typing advances, Backspace steps back, a
 * pasted "123 456" fills every box, and the whole thing submits on its own when full
 * (`onComplete`). Controlled: `value` is the digits typed so far.
 */
export const CODE_LENGTH = 6;

/** The digits in whatever was typed or pasted, cut to the code length. */
export function digitsOf(raw: string, length = CODE_LENGTH) {
  return raw.replace(/\D/g, "").slice(0, length);
}

export function CodeInput({
  value,
  onChange,
  onComplete,
  length = CODE_LENGTH,
  disabled,
  autoFocus,
  error,
  label = "Authenticator code",
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
  label?: string;
  className?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);
  const digits = digitsOf(value, length);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const focusAt = (index: number) => refs.current[Math.max(0, Math.min(length - 1, index))]?.focus();

  const commit = (next: string) => {
    const clean = digitsOf(next, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const onInput = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) {
      // Cleared the box (select-all + delete): drop that digit.
      commit(digits.slice(0, index) + digits.slice(index + 1));
      return;
    }
    // Typing into a box replaces it and flows the rest forward (covers a paste in the middle too).
    const next = (digits.slice(0, index) + typed + digits.slice(index + typed.length)).slice(0, length);
    commit(next);
    focusAt(index + typed.length);
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) commit(digits.slice(0, index) + digits.slice(index + 1));
      else if (index > 0) {
        commit(digits.slice(0, index - 1) + digits.slice(index));
        focusAt(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = digitsOf(event.clipboardData.getData("text"), length);
    if (!pasted) return;
    commit(pasted);
    focusAt(pasted.length);
  };

  return (
    <div role="group" aria-label={label} className={cx("flex items-center justify-between gap-1.5 sm:gap-2", className)}>
      {Array.from({ length }).map((_, index) => {
        const filled = digits[index] ?? "";
        // The next empty box is where typing goes; earlier boxes can be edited, later ones cannot be reached by click.
        const active = index === Math.min(digits.length, length - 1);
        return (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            value={filled}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            pattern="[0-9]*"
            maxLength={length}
            aria-label={`Digit ${index + 1} of ${length}`}
            disabled={disabled}
            onChange={(event) => onInput(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onPaste={onPaste}
            onFocus={(event) => {
              setFocused(index);
              event.target.select();
            }}
            onBlur={() => setFocused(null)}
            onClick={() => {
              // Clicking past the typed digits lands on the next empty box.
              if (index > digits.length) focusAt(digits.length);
            }}
            className={cx(
              "h-12 w-10 rounded-xl border bg-card text-center font-mono text-xl font-bold tabular-nums text-ink caret-brand transition-colors sm:h-14 sm:w-12 sm:text-2xl",
              "focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60",
              error ? "border-danger" : focused === index || (active && focused === null) ? "border-brand" : "border-line",
            )}
          />
        );
      })}
    </div>
  );
}
