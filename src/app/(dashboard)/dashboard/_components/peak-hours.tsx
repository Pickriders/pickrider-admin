"use client";

import { useMemo } from "react";

import type { RangeQuery } from "@/lib/admin/api";
import { usePeakHours } from "@/lib/admin/hooks";
import { count } from "@/lib/admin/format";
import { Heatmap } from "@/components/kit/charts";
import { Panel, PanelHeader, Skeleton } from "@/components/kit/primitives";

/** When orders come in, by weekday and time of day, with the single busiest hour called out. */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function hourLabel(hour: number) {
  return `${hour % 12 || 12}${hour >= 12 ? "pm" : "am"}`;
}

export function PeakHours({ query, callout }: { query: RangeQuery; callout?: boolean }) {
  const peak = usePeakHours(query);
  const cells = useMemo(() => peak.data?.cells ?? [], [peak.data]);
  const loading = peak.isLoading && !peak.data;

  const busiest = useMemo(() => {
    if (!cells.length) return null;
    const best = cells.reduce((a, b) => (b.count > a.count ? b : a));
    if (!best.count) return null;
    const byDay = DAYS.map((label, day) => ({ label, total: cells.filter((c) => c.day === day).reduce((s, c) => s + c.count, 0) }));
    const bestDay = byDay.reduce((a, b) => (b.total > a.total ? b : a));
    return { hour: `${DAYS[best.day]} around ${hourLabel(best.hour)}`, hourCount: best.count, day: bestDay.label, dayCount: bestDay.total };
  }, [cells]);

  return (
    <Panel>
      <PanelHeader
        title="When orders come in"
        subtitle={busiest ? `Busiest: ${busiest.hour} (${count(busiest.hourCount)} orders)` : "By weekday and hour, Lagos time"}
      />
      {callout && busiest ? (
        <div className="mx-5 mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-soft px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark">Busiest hour</p>
            <p className="mt-0.5 text-sm font-black text-ink">{busiest.hour}</p>
            <p className="text-xs text-ink-muted">{count(busiest.hourCount)} orders placed in that hour across the window</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Busiest day</p>
            <p className="mt-0.5 text-sm font-black text-ink">{busiest.day}</p>
            <p className="text-xs text-ink-muted">{count(busiest.dayCount)} orders on that weekday across the window</p>
          </div>
        </div>
      ) : null}
      <div className="p-5 pt-3">
        {loading ? <Skeleton className="h-44 w-full" /> : <Heatmap cells={cells} maxHint={cells.length ? "Darker means more orders placed in that block." : "No orders in this window yet."} />}
      </div>
    </Panel>
  );
}
