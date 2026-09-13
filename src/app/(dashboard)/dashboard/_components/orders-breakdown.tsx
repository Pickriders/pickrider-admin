"use client";

import { useMemo } from "react";

import type { OrderWindow } from "@/lib/admin/api";
import { count, percent } from "@/lib/admin/format";
import { DonutChart } from "@/components/kit/charts";
import { Panel, PanelHeader, Skeleton, cx } from "@/components/kit/primitives";

/**
 * One card for how the window's orders split: a donut by type with a legend
 * that carries the numbers, and a single stacked bar for how they ended.
 */
const TYPE_LABEL: Record<string, string> = { SINGLE: "Single", BATCH: "Batch", BULK: "Bulk" };
const TYPE_COLOR = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-4))"];

const STATUS_GROUPS = [
  { key: "completed", label: "Completed", className: "bg-success", text: "text-success" },
  { key: "open", label: "Open", className: "bg-info", text: "text-info" },
  { key: "cancelled", label: "Cancelled", className: "bg-danger", text: "text-danger" },
] as const;

export function OrdersBreakdown({ current, loading }: { current?: OrderWindow; loading: boolean }) {
  const total = current?.orders ?? 0;
  const types = useMemo(
    () =>
      Object.entries(current?.byType ?? {})
        .sort((a, b) => b[1] - a[1])
        .map(([type, value], index) => ({ name: TYPE_LABEL[type] ?? type, value, color: TYPE_COLOR[index % TYPE_COLOR.length] })),
    [current?.byType],
  );
  const statuses = {
    completed: current?.completed ?? 0,
    cancelled: current?.cancelled ?? 0,
    open: Math.max(0, total - (current?.completed ?? 0) - (current?.cancelled ?? 0)),
  };

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader title="Orders breakdown" subtitle="By type, and how they ended" />
      <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <>
            <div className="flex items-center gap-5">
              <div className="h-40 w-40 shrink-0">
                <DonutChart data={types} format="count" centerValue={count(total)} centerLabel="orders" />
              </div>
              <ul className="min-w-0 flex-1 space-y-2.5">
                {(types.length ? types : [{ name: "No orders yet", value: 0, color: "hsl(var(--border))" }]).map((item) => (
                  <li key={item.name} className="flex items-center gap-2.5 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="min-w-0 flex-1 truncate font-medium text-ink">{item.name}</span>
                    <span className="font-black tabular-nums text-ink">{count(item.value)}</span>
                    <span className="w-10 text-right text-xs tabular-nums text-ink-faint">{total ? Math.round((item.value / total) * 100) : 0}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Outcome</p>
                <p className="text-xs text-ink-muted">
                  <span className="font-bold text-ink">{percent(current?.completionRate, 0)}</span> completed
                </p>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface">
                {STATUS_GROUPS.map((group) => {
                  const width = total ? (statuses[group.key] / total) * 100 : 0;
                  return width ? <span key={group.key} className={cx("h-full", group.className)} style={{ width: `${width}%` }} /> : null;
                })}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {STATUS_GROUPS.map((group) => (
                  <div key={group.key} className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                      <span className={cx("h-2 w-2 rounded-full", group.className)} />
                      {group.label}
                    </p>
                    <p className={cx("mt-0.5 text-lg font-black leading-none tabular-nums", group.text)}>{count(statuses[group.key])}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
