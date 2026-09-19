"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Inbox, Timer, UserX } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { ChartCard, EmptyState, Panel, PanelHeader, RangeTabs, Skeleton, StatCard, StatGrid, TrendChart, cx } from "@/components/kit";
import type { IssuePriority } from "@/lib/admin/api";
import { count, minutes, trend } from "@/lib/admin/format";
import { useIssuesSummary } from "@/lib/admin/hooks";

import { useStatsRange } from "../../dashboard/_components/use-stats-range";
import { CATEGORY_LABEL, PRIORITY_LABEL } from "./shared";

/**
 * Support at a glance. The top row is the queue right now (what needs a
 * person); the second row is how the team did in the window against the one
 * before; then what customers report and how urgent the backlog is.
 */
const PRIORITY_ORDER: IssuePriority[] = ["HIGH", "MEDIUM", "LOW"];
const PRIORITY_BAR: Record<IssuePriority, string> = { HIGH: "bg-danger", MEDIUM: "bg-warning", LOW: "bg-line-strong" };
const PRIORITY_TEXT: Record<IssuePriority, string> = { HIGH: "text-danger", MEDIUM: "text-warning", LOW: "text-ink-muted" };

function hoursLabel(value: number | null | undefined) {
  if (value == null) return "No data";
  return minutes(value * 60);
}

/** Lower is better for response times, so the trend colour is flipped by negating both sides. */
function fasterIsBetter(current: number | null | undefined, previous: number | null | undefined) {
  if (current == null || previous == null) return null;
  return trend(-current, -previous);
}

export function OverviewTab() {
  const range = useStatsRange(30);
  const summary = useIssuesSummary(range.query);
  const data = summary.data;
  const cur = data?.current;
  const prev = data?.previous;
  const loading = summary.isPending && !data;
  const needsAttention = (data?.open ?? 0) + (data?.inReview ?? 0);
  // "All time" has no window before it to compare with.
  const change = (current: number, previous: number) => (range.value.all ? null : trend(current, previous));
  const faster = (current: number | null | undefined, previous: number | null | undefined) => (range.value.all ? null : fasterIsBetter(current, previous));

  const daily = useMemo(() => data?.daily ?? [], [data?.daily]);
  const categories = useMemo(() => {
    const rows = data?.byCategory ?? [];
    const total = rows.reduce((sum, row) => sum + row.count, 0) || 1;
    const top = rows[0]?.count || 1;
    return rows.map((row) => ({ ...row, share: Math.round((row.count / total) * 100), width: Math.max(4, (row.count / top) * 100) }));
  }, [data?.byCategory]);
  const priorities = useMemo(() => {
    const byKey = new Map((data?.byPriority ?? []).map((row) => [row.key as IssuePriority, row.count]));
    const total = PRIORITY_ORDER.reduce((sum, key) => sum + (byKey.get(key) ?? 0), 0);
    return { total, rows: PRIORITY_ORDER.map((key) => ({ key, count: byKey.get(key) ?? 0, width: total ? ((byKey.get(key) ?? 0) / total) * 100 : 0 })) };
  }, [data?.byPriority]);

  return (
    <div className="space-y-5">
      {/* Right now */}
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-ink">The queue right now</h3>
            <p className="mt-0.5 text-xs text-ink-muted">Refreshes every 20 seconds. Each tile opens that view of the queue.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5 pt-4 lg:grid-cols-4">
          <LiveTile icon={Inbox} label="Needs attention" value={needsAttention} sub={data ? `${count(data.open)} open · ${count(data.inReview)} in review` : ""} href="/support" accent="brand" loading={loading} />
          <LiveTile icon={UserX} label="Unassigned" value={data?.unassigned ?? 0} sub="Nobody has picked these up" href="/support?view=unassigned" accent="warning" urgent={(data?.unassigned ?? 0) > 0} loading={loading} />
          <LiveTile icon={AlertTriangle} label="Overdue" value={data?.overdue ?? 0} sub="Open for more than 48 hours" href="/support?view=overdue" accent="danger" urgent={(data?.overdue ?? 0) > 0} loading={loading} />
          <LiveTile icon={AlertTriangle} label="High priority" value={data?.highPriorityOpen ?? 0} sub="Marked urgent and still open" href="/support?view=high" accent="danger" loading={loading} />
        </div>
      </Panel>

      {/* The window */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">How the team did, compared with the window before.</p>
        <RangeTabs value={range.value} onChange={range.setValue} />
      </div>
      <StatGrid columns={4}>
        <StatCard
          tone="brand"
          label="Reports opened"
          value={loading ? "" : count(cur?.opened)}
          hint={loading ? "" : `${count(data?.new7d)} in the last 7 days`}
          trend={cur && prev ? change(cur.opened, prev.opened) : null}
          spark={daily.map((d) => ({ value: d.opened }))}
          icon={Inbox}
          loading={loading}
        />
        <StatCard
          label="Reports resolved"
          value={loading ? "" : count(cur?.resolved)}
          hint={loading ? "" : `${count(data?.resolved7d)} in the last 7 days`}
          trend={cur && prev ? change(cur.resolved, prev.resolved) : null}
          spark={daily.map((d) => ({ value: d.resolved }))}
          icon={CheckCircle2}
          loading={loading}
        />
        <StatCard
          label="First response"
          value={loading ? "" : hoursLabel(cur?.avgFirstResponseHours)}
          hint="Average time until someone picked it up"
          trend={faster(cur?.avgFirstResponseHours, prev?.avgFirstResponseHours)}
          trendLabel="faster is up"
          icon={Timer}
          loading={loading}
        />
        <StatCard
          label="Time to resolve"
          value={loading ? "" : hoursLabel(cur?.avgResolutionHours)}
          hint="Average from report to resolution"
          trend={faster(cur?.avgResolutionHours, prev?.avgResolutionHours)}
          trendLabel="faster is up"
          icon={Clock}
          loading={loading}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Opened and resolved" subtitle={`Per day, ${range.label}`} height={280} loading={loading} empty={!daily.some((d) => d.opened || d.resolved)}>
            <TrendChart
              data={daily}
              xKey="date"
              kind="area"
              xFormat={range.xf}
              yFormat="count"
              series={[
                { key: "opened", label: "Opened", format: "count", color: "hsl(var(--chart-3))" },
                { key: "resolved", label: "Resolved", format: "count", color: "hsl(var(--chart-1))" },
              ]}
            />
          </ChartCard>
        </div>

        <Panel className="flex h-full flex-col">
          <PanelHeader title="Open backlog by priority" subtitle={loading ? "" : `${count(priorities.total)} open reports`} />
          <div className="flex flex-1 flex-col justify-center gap-4 px-5 pb-5 pt-3">
            {loading ? (
              <Skeleton className="h-28 w-full" />
            ) : !priorities.total ? (
              <EmptyState compact icon={CheckCircle2} title="Nothing open" description="Every report is resolved or closed." />
            ) : (
              <>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface">
                  {priorities.rows.map((row) => (row.width ? <span key={row.key} className={cx("h-full", PRIORITY_BAR[row.key])} style={{ width: `${row.width}%` }} title={`${PRIORITY_LABEL[row.key]}: ${count(row.count)}`} /> : null))}
                </div>
                <ul className="space-y-2">
                  {priorities.rows.map((row) => (
                    <li key={row.key}>
                      <Link href={row.key === "HIGH" ? "/support?view=high" : `/support?priority=${row.key}`} className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface">
                        <span className={cx("h-2.5 w-2.5 rounded-full", PRIORITY_BAR[row.key])} />
                        <span className="flex-1 text-sm font-semibold text-ink">{PRIORITY_LABEL[row.key]}</span>
                        <span className={cx("text-sm font-black tabular-nums", PRIORITY_TEXT[row.key])}>{count(row.count)}</span>
                        <span className="w-10 text-right text-xs tabular-nums text-ink-faint">{priorities.total ? Math.round((row.count / priorities.total) * 100) : 0}%</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="What customers are reporting" subtitle="Open reports by category, most common first. Each row opens the queue filtered to it." />
        <div className="px-5 pb-5 pt-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !categories.length ? (
            <EmptyState compact icon={CheckCircle2} title="No open reports" description="Categories appear here as reports come in." />
          ) : (
            <ol className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {categories.map((row, index) => (
                <li key={row.key}>
                  <Link href={`/support?category=${row.key}`} className="group flex items-center gap-3 rounded-2xl border border-line p-3 transition-colors hover:bg-surface">
                    <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black", index === 0 ? "bg-brand text-brand-ink" : "bg-surface text-ink-muted")}>{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-bold text-ink">{CATEGORY_LABEL[row.key as keyof typeof CATEGORY_LABEL] ?? row.key}</span>
                        <span className="shrink-0 text-sm font-black tabular-nums text-ink">{count(row.count)}</span>
                      </span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                          <span className={cx("block h-full rounded-full", index === 0 ? "bg-brand" : "bg-brand/50")} style={{ width: `${row.width}%` }} />
                        </span>
                        <span className="w-9 text-right text-[11px] tabular-nums text-ink-faint">{row.share}%</span>
                      </span>
                    </span>
                    <ArrowRight size={14} className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Panel>
    </div>
  );
}

function LiveTile({
  icon: Icon,
  label,
  value,
  sub,
  href,
  accent,
  urgent,
  loading,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  sub: string;
  href: string;
  accent: "brand" | "warning" | "danger";
  urgent?: boolean;
  loading: boolean;
}) {
  const chip = { brand: "bg-brand-soft text-brand-dark", warning: "bg-warning-soft text-warning", danger: "bg-danger-soft text-danger" }[accent];
  return (
    <Link href={href} className={cx("group flex min-w-0 items-center gap-3 rounded-2xl border p-3.5 transition-colors hover:bg-surface", urgent ? "border-danger/40 bg-danger-soft/30" : "border-line")}>
      <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", chip)}>
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <span className={cx("block text-2xl font-black leading-none tracking-tight tabular-nums", urgent ? "text-danger" : "text-ink")}>{loading ? <Skeleton className="h-6 w-10" /> : count(value)}</span>
        <span className="mt-1 block truncate text-xs font-semibold text-ink-muted">{label}</span>
        {sub ? <span className="block truncate text-[11px] text-ink-faint">{sub}</span> : null}
      </span>
    </Link>
  );
}
