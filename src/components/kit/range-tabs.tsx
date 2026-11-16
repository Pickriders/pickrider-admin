"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "@/components/kit/popover";
import { Button, Input, cx } from "@/components/kit/primitives";

/**
 * Window picker for stats pages: 7 / 30 / 90 days or a custom span. Emits ISO
 * date-only strings; the backend treats `to` as the end of that Lagos day.
 *
 * Both pickers open a `Popover`: a bottom sheet on phones, an anchored panel that stays inside
 * the viewport from `sm` up.
 */
export type RangeValue = { from?: string; to?: string; preset?: number; all?: boolean };

const PRESETS = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
] as const;

/**
 * Calendar day in Lagos, not UTC: between midnight and 1am WAT `toISOString()` still says
 * yesterday, which dropped the current day from every "last N days" window.
 */
const LAGOS_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" });
function isoDay(date: Date) {
  return LAGOS_DAY.format(date);
}

export function presetRange(days: number): RangeValue {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 86_400_000);
  return { from: isoDay(from), to: isoDay(to), preset: days };
}

/** Everything since the first order. The API anchors the start itself. */
export function allTimeRange(): RangeValue {
  return { all: true, preset: -1 };
}

/** The query fragment every stats hook sends for a picked range. */
export function rangeToQuery(range: RangeValue) {
  return range.all ? { all: true } : { from: range.from, to: range.to };
}

export function RangeTabs({
  value,
  onChange,
  className,
}: {
  value: RangeValue;
  onChange: (next: RangeValue) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(value.from ?? "");
  const [to, setTo] = useState(value.to ?? "");
  const ref = useRef<HTMLDivElement>(null);

  const custom = !value.all && value.preset == null && (value.from || value.to);
  const customLabel = useMemo(() => {
    if (!custom) return "Custom";
    const f = value.from ? new Date(value.from).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "…";
    const t = value.to ? new Date(value.to).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "…";
    return `${f} to ${t}`;
  }, [custom, value.from, value.to]);

  return (
    <div ref={ref} className={cx("relative", className)}>
      <div className="flex items-center gap-1 rounded-xl border border-line bg-card p-1">
        <button
          type="button"
          onClick={() => onChange(allTimeRange())}
          className={cx(
            "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
            value.all ? "bg-ink text-card" : "text-ink-muted hover:text-ink",
          )}
        >
          All
        </button>
        {PRESETS.map((preset) => {
          const active = value.preset === preset.days;
          return (
            <button
              key={preset.days}
              type="button"
              onClick={() => onChange(presetRange(preset.days))}
              className={cx(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                active ? "bg-ink text-card" : "text-ink-muted hover:text-ink",
              )}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={customLabel}
          className={cx(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
            custom ? "bg-ink text-card" : "text-ink-muted hover:text-ink",
          )}
        >
          <CalendarDays size={13} />
          <span className="hidden sm:inline">{customLabel}</span>
        </button>
      </div>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={ref} align="end" title="Custom range">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[11px] font-semibold text-ink-muted">
            From
            <Input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
          </label>
          <label className="text-[11px] font-semibold text-ink-muted">
            To
            <Input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="mt-1" />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setFrom("");
              setTo("");
              onChange(presetRange(30));
              setOpen(false);
            }}
          >
            Reset
          </Button>
          <Button
            size="sm"
            disabled={!from && !to}
            onClick={() => {
              onChange({ from: from || undefined, to: to || undefined });
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </Popover>
    </div>
  );
}

/** Compact from/to picker for table toolbars (the DataTable `dateFilter`); emits YYYY-MM-DD or undefined. */
export function DateRangeButton({ from, to, onChange }: { from?: string; to?: string; onChange: (from?: string, to?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from ?? "");
  const [draftTo, setDraftTo] = useState(to ?? "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftFrom(from ?? "");
    setDraftTo(to ?? "");
  }, [from, to]);

  const active = Boolean(from || to);
  const label = active
    ? `${from ? new Date(from).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "…"} to ${to ? new Date(to).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "…"}`
    : "Dates";

  return (
    <div ref={ref} className="relative">
      <Button
        variant={active ? "secondary" : "outline"}
        size="md"
        icon={CalendarDays}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
      >
        <span className="hidden sm:inline">{label}</span>
      </Button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={ref} align="start" title="Date range">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[11px] font-semibold text-ink-muted">
            From
            <Input type="date" value={draftFrom} max={draftTo || undefined} onChange={(e) => setDraftFrom(e.target.value)} className="mt-1" />
          </label>
          <label className="text-[11px] font-semibold text-ink-muted">
            To
            <Input type="date" value={draftTo} min={draftFrom || undefined} onChange={(e) => setDraftTo(e.target.value)} className="mt-1" />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onChange(undefined, undefined);
              setOpen(false);
            }}
          >
            Clear
          </Button>
          <Button
            size="sm"
            disabled={!draftFrom && !draftTo}
            onClick={() => {
              onChange(draftFrom || undefined, draftTo || undefined);
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </Popover>
    </div>
  );
}
