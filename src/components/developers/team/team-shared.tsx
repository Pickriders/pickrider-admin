"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button, cx, type Tone } from "@/components/kit";

/** Shared bits of the developer team page. The pure helpers are exported for the test. */

export type Mode = "test" | "live";

/** Test or live, for the whole page: usage, requests, webhooks and the wallet all follow it. */
export function ModeSwitch({
  value,
  onChange,
  liveOn,
}: {
  value: Mode;
  onChange: (mode: Mode) => void;
  liveOn: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Mode" className="inline-flex rounded-xl border border-line bg-surface p-1">
      {(["test", "live"] as const).map((mode) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(mode)}
            className={cx(
              "flex h-8 items-center gap-2 rounded-lg px-3.5 text-xs font-bold capitalize transition-all",
              active ? "bg-card text-ink shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            <span
              aria-hidden
              className={cx(
                "h-2 w-2 rounded-full",
                mode === "live" ? (liveOn ? "bg-success" : "bg-line-strong") : "bg-warning",
              )}
            />
            {mode}
            {mode === "live" && !liveOn ? (
              <span className="font-medium normal-case text-ink-faint">not live</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** A panel section heading inside a card: small caps label, optional right-hand action. */
export function CardTitle({
  title,
  hint,
  action,
  icon: Icon,
}: {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  icon?: typeof Loader2;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-4">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-ink">
          {Icon ? <Icon size={15} className="text-ink-faint" aria-hidden /> : null}
          {title}
        </h3>
        {hint ? <p className="mt-0.5 text-xs text-ink-muted">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** A labelled fact in a definition grid; a missing value reads "Not set". */
export function Fact({ label, children, mono }: { label: ReactNode; children: ReactNode; mono?: boolean }) {
  const empty = children === null || children === undefined || children === "";
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className={cx("mt-0.5 min-w-0 break-words text-sm font-medium text-ink", mono && "font-mono text-[13px]")}>
        {empty ? <span className="font-normal text-ink-faint">Not set</span> : children}
      </dd>
    </div>
  );
}

/** HTTP status as a coloured pill: green 2xx, amber 4xx, red 5xx. */
export function statusTone(status: number | null | undefined): Tone {
  if (!status) return "neutral";
  if (status >= 500) return "danger";
  if (status >= 400) return "warning";
  if (status >= 200 && status < 300) return "success";
  return "info";
}

const PILL: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-surface text-ink-muted",
  brand: "bg-brand-soft text-brand-dark",
};

export function StatusPill({ status, label }: { status: number | null | undefined; label?: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex h-6 min-w-[44px] items-center justify-center rounded-md px-1.5 font-mono text-xs font-bold tabular-nums",
        PILL[statusTone(status)],
      )}
    >
      {label ?? status ?? "—"}
    </span>
  );
}

export function MethodTag({ method }: { method: string }) {
  return (
    <span className="inline-block w-[52px] shrink-0 font-mono text-[11px] font-bold text-ink-muted">{method}</span>
  );
}

/** A body or object, pretty-printed; strings that hold JSON are parsed first. */
export function prettyJson(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

export function JsonBlock({
  label,
  value,
  empty = "Nothing sent.",
}: {
  label: ReactNode;
  value: unknown;
  empty?: string;
}) {
  const text = prettyJson(value);
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      {text ? (
        <pre className="max-h-80 overflow-auto rounded-xl border border-line bg-surface px-3.5 py-3 font-mono text-[12px] leading-5 text-ink">
          {text}
        </pre>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-3.5 py-3 text-xs text-ink-faint">{empty}</p>
      )}
    </div>
  );
}

/** The foot of a cursor list: load the next page, or say it's the end. */
export function LoadMore({
  hasMore,
  loading,
  onMore,
  shown,
  noun,
}: {
  hasMore: boolean;
  loading: boolean;
  onMore: () => void;
  shown: number;
  noun: string;
}) {
  if (!shown) return null;
  return (
    <div className="flex items-center justify-center border-t border-line px-4 py-3">
      {hasMore ? (
        <Button variant="ghost" size="sm" onClick={onMore} disabled={loading}>
          {loading ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <ChevronDown size={13} aria-hidden />}
          {loading ? "Loading" : "Load more"}
        </Button>
      ) : (
        <p className="text-xs text-ink-faint">
          All {shown} {noun} shown
        </p>
      )}
    </div>
  );
}

/** Segmented control for a handful of options (filters, periods). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex flex-wrap rounded-xl border border-line bg-surface p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cx(
            "h-7 rounded-lg px-3 text-xs font-semibold transition-colors",
            value === option.value ? "bg-card text-ink shadow-sm" : "text-ink-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Text that can be revealed in full: long URLs and reasons stay one line until asked. */
export function Expandable({ children, summary }: { children: ReactNode; summary: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
      >
        <ChevronDown size={12} className={cx("transition-transform", open && "rotate-180")} aria-hidden />
        {summary}
      </button>
      {open ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

/** "2 of 3 succeeded" as a rate, or null with nothing to rate. */
export function rate(part: number, whole: number): number | null {
  return whole ? part / whole : null;
}
