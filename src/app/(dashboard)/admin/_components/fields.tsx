"use client";

import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button, Field, Input, cx } from "@/components/kit";

/**
 * Small inputs the settings forms share. Money is typed in naira and kept in
 * state as kobo, so the payload never needs a conversion at submit time.
 */
export function MoneyInput({
  label,
  hint,
  kobo,
  onChange,
  min = 0,
}: {
  label: ReactNode;
  hint?: ReactNode;
  kobo: number | undefined;
  onChange: (kobo: number) => void;
  min?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <Input
        type="number"
        inputMode="decimal"
        step="0.01"
        min={min}
        left={<span className="text-xs font-bold">₦</span>}
        value={kobo == null ? "" : String(kobo / 100)}
        onChange={(e) => onChange(Math.round(Number(e.target.value || 0) * 100))}
      />
    </Field>
  );
}

export function NumberInput({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: ReactNode;
  hint?: ReactNode;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  unit?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <span className="relative block">
        <Input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(Number(e.target.value || 0))}
          className={cx(unit && "pr-12")}
        />
        {unit ? <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-ink-faint">{unit}</span> : null}
      </span>
    </Field>
  );
}

export function SectionTitle({ title, hint }: { title: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 first:mt-0">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">{title}</p>
      {hint ? <p className="mt-0.5 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

/** Pretty JSON with a copy button; used by the audit and data log drawers. */
export function JsonView({ value, title }: { value: unknown; title?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = (() => {
    try {
      return JSON.stringify(value ?? null, null, 2);
    } catch {
      return String(value);
    }
  })();
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        {title ? <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">{title}</p> : <span />}
        <Button size="sm" variant="ghost" icon={copied ? Check : Copy} onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="admin-scroll max-h-[60vh] overflow-auto rounded-xl border border-line bg-surface p-3 font-mono text-[11px] leading-relaxed text-ink">
        {text}
      </pre>
    </div>
  );
}

/** Filters the loaded page only, for endpoints that have no server search. */
export function pageFilter<T>(items: T[], search: string | undefined, pick: (row: T) => unknown[]) {
  const term = (search ?? "").trim().toLowerCase();
  if (!term) return items;
  return items.filter((row) => pick(row).some((value) => String(value ?? "").toLowerCase().includes(term)));
}
