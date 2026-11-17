"use client";

import { Activity, AlertOctagon, ArrowUpRight, Gauge, Hourglass, ShieldAlert, Siren, Webhook } from "lucide-react";
import Link from "next/link";

import { Badge, ErrorState, Panel, PanelHeader, Skeleton, StatCard, cx } from "@/components/kit";
import type { DeveloperMonitoring, DeveloperMonitoringWindow } from "@/lib/admin/api";
import { count, percent } from "@/lib/admin/format";
import { useDeveloperMonitoring } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

const pct = (rate: number | null) => (rate === null ? "–" : percent(rate * 100, rate < 0.1 ? 1 : 0));
const ms = (value: number | null) =>
  value === null ? "–" : value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${count(value)} ms`;

export type HealthCheck = {
  id: string;
  label: string;
  value: string;
  limit: string;
  state: "ok" | "breached" | "quiet";
};

/** The alert rules applied to the current window, as the cron check does. Exported for the test. */
export function healthChecks(m: DeveloperMonitoring): HealthCheck[] {
  const t = m.thresholds;
  const w = m.now;
  const traffic = w.requests >= t.minRequests;
  const hooks = w.webhookAttempts >= t.minWebhookAttempts;
  const check = (
    id: string,
    label: string,
    enough: boolean,
    value: number | null,
    limit: number,
    show: (v: number | null) => string,
  ): HealthCheck => ({
    id,
    label,
    value: show(value),
    limit: show(limit),
    state: !enough ? "quiet" : (value ?? 0) >= limit ? "breached" : "ok",
  });
  return [
    check("errors", "5xx errors", traffic, w.errorRate, t.errorRate, pct),
    check("latency", "p95 latency", traffic, w.p95Ms, t.p95Ms, ms),
    check("rateLimited", "Rate limited (429)", traffic, w.rateLimitedRate, t.rateLimitedRate, pct),
    check("webhooks", "Webhook failures", hooks, w.webhookFailureRate, t.webhookFailureRate, pct),
    {
      id: "backlog",
      label: "Late webhook deliveries",
      value: count(m.queue.overdue),
      limit: count(t.overdueDeliveries),
      state: m.queue.overdue >= t.overdueDeliveries ? "breached" : "ok",
    },
  ];
}

const ROWS: { label: string; show: (w: DeveloperMonitoringWindow) => string }[] = [
  { label: "Requests", show: (w) => count(w.requests) },
  { label: "5xx errors", show: (w) => `${pct(w.errorRate)} (${count(w.errors)})` },
  { label: "p95 latency", show: (w) => ms(w.p95Ms) },
  { label: "Rate limited", show: (w) => `${pct(w.rateLimitedRate)} (${count(w.rateLimited)})` },
  { label: "Webhook attempts", show: (w) => count(w.webhookAttempts) },
  { label: "Webhook failures", show: (w) => `${pct(w.webhookFailureRate)} (${count(w.webhookFailures)})` },
];

function Windows({ m }: { m: DeveloperMonitoring }) {
  const windows = [
    { label: `Last ${m.now.minutes} min`, w: m.now },
    { label: "Last hour", w: m.lastHour },
    { label: "Last 24 hours", w: m.last24Hours },
  ];
  return (
    <div className="overflow-x-auto px-6 pb-5">
      <table className="w-full min-w-[28rem] text-sm">
        <thead>
          <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-ink-faint">
            <th scope="col" className="py-2 pr-4 font-bold">
              Measure
            </th>
            {windows.map((col) => (
              <th key={col.label} scope="col" className="py-2 pr-4 text-right font-bold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="py-2.5 pr-4 text-left font-medium text-ink-muted">
                {row.label}
              </th>
              {windows.map((col) => (
                <td key={col.label} className="py-2.5 pr-4 text-right font-semibold tabular-nums text-ink">
                  {row.show(col.w)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DeveloperMonitoringPanel() {
  const query = useDeveloperMonitoring();
  const m = query.data;

  if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />;

  const checks = m ? healthChecks(m) : [];
  const breached = checks.filter((c) => c.state === "breached");
  const loading = query.isLoading;

  return (
    <div className="space-y-4">
      {m ? (
        <div
          role="status"
          className={cx(
            "flex flex-wrap items-center gap-3 rounded-2xl border px-5 py-4",
            breached.length ? "border-danger/30 bg-danger-soft" : "border-success/30 bg-success-soft",
          )}
        >
          {breached.length ? (
            <Siren size={20} className="text-danger" aria-hidden />
          ) : (
            <Activity size={20} className="text-success" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">
              {breached.length
                ? `${breached.map((c) => c.label).join(", ")} over the limit`
                : "The developer API is healthy"}
            </p>
            <p className="text-xs text-ink-muted">
              Checked every minute over the last {m.now.minutes} minutes. Crossing a limit raises an alert and it clears
              itself once things recover.
            </p>
          </div>
          <Link
            href="/alerts"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark hover:underline"
          >
            Alerts <ArrowUpRight size={12} aria-hidden />
          </Link>
        </div>
      ) : (
        <Skeleton className="h-[74px] w-full rounded-2xl" />
      )}

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
        {(loading
          ? Array.from({ length: 5 }, (_, i) => ({
              id: String(i),
              label: "",
              value: "",
              limit: "",
              state: "ok" as const,
            }))
          : checks
        ).map((c, i) => (
          <StatCard
            key={c.id}
            label={c.label || " "}
            loading={loading}
            icon={[AlertOctagon, Gauge, ShieldAlert, Webhook, Hourglass][i]}
            value={<span className={c.state === "breached" ? "text-danger" : undefined}>{c.value}</span>}
            hint={c.state === "quiet" ? "Too little traffic to judge" : `Alert at ${c.limit}`}
            tone={c.state === "breached" ? "dark" : "default"}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <Panel>
          <PanelHeader
            title="Over time"
            subtitle="Test and live traffic together. 4xx answers are the developer's mistakes and don't count as errors."
          />
          {m ? <Windows m={m} /> : <Skeleton className="mx-6 mb-5 h-48" />}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Webhook queue" subtitle="Deliveries waiting to be sent or retried." />
            <div className="grid grid-cols-2 gap-3 px-6 pb-5 pt-3">
              <div>
                <p className="text-[11px] font-semibold text-ink-muted">Waiting</p>
                <p className="text-xl font-bold tabular-nums text-ink">{m ? count(m.queue.pending) : "–"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-ink-muted">Over a minute late</p>
                <p className={cx("text-xl font-bold tabular-nums", m?.queue.overdue ? "text-warning" : "text-ink")}>
                  {m ? count(m.queue.overdue) : "–"}
                </p>
                {m?.queue.oldestOverdueSeconds ? (
                  <p className="text-[11px] text-ink-faint">
                    oldest {Math.round(m.queue.oldestOverdueSeconds / 60)} min late
                  </p>
                ) : null}
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Teams seeing errors" subtitle="Most 5xx answers in the last hour." />
            <div className="px-6 pb-5 pt-2">
              {m && m.errorTeams.length === 0 ? (
                <p className="text-sm text-ink-muted">No team got a 5xx in the last hour.</p>
              ) : null}
              <ul className="divide-y divide-line">
                {m?.errorTeams.map((team) => (
                  <li key={team.teamId}>
                    <Link
                      href={`/developers/${team.teamId}?tab=requests&mode=live`}
                      className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:text-brand-dark"
                    >
                      <span className="min-w-0 truncate text-sm font-semibold text-ink">
                        {team.name ?? "Deleted team"}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-ink-muted">
                        {count(team.requests)} requests
                        <Badge tone="danger">{count(team.errors)} errors</Badge>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
