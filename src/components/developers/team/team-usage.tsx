"use client";

import { Activity, CheckCircle2, Package, Receipt, Webhook } from "lucide-react";
import { useState } from "react";

import { BarsChart, ChartCard, DonutChart, ErrorState, Panel, StatCard, StatGrid } from "@/components/kit";
import type { DeveloperUsage, DeveloperUsagePeriod } from "@/lib/admin/api";
import { count, naira, percent } from "@/lib/admin/format";
import { useDeveloperUsage } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { CardTitle, Segmented, type Mode } from "./team-shared";

const PERIODS: { value: DeveloperUsagePeriod; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

/** "12 Nov" from a Lagos day, for chart axes. */
export const dayLabel = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "UTC" });

/** A 0–1 rate as a percentage, or a dash with nothing to rate. */
const pct = (value: number | null | undefined) => (value === null || value === undefined ? "—" : percent(value * 100));

/** The orders-per-day chart, shared with the overview. */
export function OrdersPerDay({
  usage,
  loading,
  title = "Orders per day",
  height = 280,
}: {
  usage?: DeveloperUsage;
  loading: boolean;
  title?: string;
  height?: number;
}) {
  const days = usage?.orders.per_day ?? [];
  return (
    <ChartCard
      title={title}
      subtitle="Created, and how many of those were delivered"
      loading={loading}
      empty={!days.some((d) => d.created)}
      height={height}
    >
      <BarsChart
        data={days.map((d) => ({ ...d }))}
        xKey="date"
        xFormat={dayLabel}
        series={[
          { key: "created", label: "Created" },
          { key: "delivered", label: "Delivered" },
        ]}
      />
    </ChartCard>
  );
}

function Meter({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  const width = total ? Math.max(2, Math.round((value / total) * 100)) : 0;
  const bar = { success: "bg-success", warning: "bg-warning", danger: "bg-danger", neutral: "bg-line-strong" }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold tabular-nums text-ink">{count(value)}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

/** The team's usage for a period in the page's mode: the same numbers their own dashboard shows. */
export function TeamUsage({ teamId, mode }: { teamId: string; mode: Mode }) {
  const [period, setPeriod] = useState<DeveloperUsagePeriod>("30d");
  const usage = useDeveloperUsage(teamId, mode === "live", period);
  const u = usage.data;
  const loading = usage.isLoading;

  if (usage.isError && !u)
    return (
      <ErrorState message={errorMessage(usage.error, "Could not load usage.")} onRetry={() => void usage.refetch()} />
    );

  const finished = (u?.orders.delivered ?? 0) + (u?.orders.failed ?? 0) + (u?.orders.cancelled ?? 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {mode === "live" ? "Live" : "Test"} mode, counted in Lagos days. Spend is order payments less refunds.
        </p>
        <Segmented label="Period" value={period} onChange={setPeriod} options={PERIODS} />
      </div>

      <StatGrid columns={5}>
        <StatCard
          label="Orders created"
          value={count(u?.orders.created)}
          icon={Package}
          loading={loading}
          hint={u ? `${count(u.orders.delivered)} delivered` : undefined}
        />
        <StatCard
          label="Delivery success"
          value={pct(u?.orders.success_rate)}
          icon={CheckCircle2}
          loading={loading}
          hint="Delivered of delivered + failed"
        />
        <StatCard
          label="Spend"
          value={naira(u?.spend.amount)}
          icon={Receipt}
          tone={mode === "live" ? "brand" : "default"}
          loading={loading}
          hint={mode === "test" ? "Test money" : undefined}
        />
        <StatCard
          label="API error rate"
          value={pct(u?.api.error_rate)}
          icon={Activity}
          loading={loading}
          hint={u ? `${count(u.api.errors)} of ${count(u.api.requests)} requests` : undefined}
        />
        <StatCard
          label="Webhook success"
          value={pct(u?.webhooks.success_rate)}
          icon={Webhook}
          loading={loading}
          hint={u ? `${count(u.webhooks.deliveries)} deliveries` : undefined}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <OrdersPerDay usage={u} loading={loading} />
        </div>
        <ChartCard
          title="How orders ended"
          subtitle="Their cancellations don't count against success"
          loading={loading}
          empty={!finished}
          height={280}
        >
          <DonutChart
            centerLabel="finished"
            centerValue={count(finished)}
            data={[
              { name: "Delivered", value: u?.orders.delivered ?? 0, color: "var(--chart-2)" },
              { name: "Couldn't deliver", value: u?.orders.failed ?? 0, color: "var(--chart-5)" },
              { name: "They cancelled", value: u?.orders.cancelled ?? 0, color: "var(--chart-4)" },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel>
          <CardTitle
            title="API requests"
            icon={Activity}
            hint="Errors are 400 and above; server errors (5xx) are ours, not theirs."
          />
          <div className="space-y-3.5 px-5 pb-5 pt-4">
            <Meter label="Requests" value={u?.api.requests ?? 0} total={u?.api.requests ?? 0} tone="neutral" />
            <Meter
              label="Answered with an error"
              value={u?.api.errors ?? 0}
              total={u?.api.requests ?? 0}
              tone="warning"
            />
            <Meter
              label="Server errors (5xx)"
              value={u?.api.server_errors ?? 0}
              total={u?.api.requests ?? 0}
              tone="danger"
            />
          </div>
        </Panel>
        <Panel>
          <CardTitle
            title="Webhook deliveries"
            icon={Webhook}
            hint="Test pings left out. Failed means every retry failed."
          />
          <div className="space-y-3.5 px-5 pb-5 pt-4">
            <Meter
              label="Deliveries"
              value={u?.webhooks.deliveries ?? 0}
              total={u?.webhooks.deliveries ?? 0}
              tone="neutral"
            />
            <Meter
              label="Succeeded"
              value={u?.webhooks.succeeded ?? 0}
              total={u?.webhooks.deliveries ?? 0}
              tone="success"
            />
            <Meter label="Failed" value={u?.webhooks.failed ?? 0} total={u?.webhooks.deliveries ?? 0} tone="danger" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
