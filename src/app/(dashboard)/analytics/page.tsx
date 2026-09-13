"use client";

import { CheckCircle2, CircleDollarSign, Package, PackageX, Receipt } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import type { SeriesPoint } from "@/lib/admin/api";
import { useOverview, useSeries } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { count, naira, nairaCompact, percent, statusLabel, trend } from "@/lib/admin/format";
import { BarsChart, ChartCard, DonutChart, TrendChart, type SeriesSpec } from "@/components/kit/charts";
import { ErrorState, PageHeader, Select, Skeleton } from "@/components/kit/primitives";
import { RangeTabs } from "@/components/kit/range-tabs";
import { StatCard, StatGrid } from "@/components/kit/stat-card";

import { PeakHours } from "../dashboard/_components/peak-hours";
import { TopRiders } from "../dashboard/_components/top-riders";
import { useStatsRange } from "../dashboard/_components/use-stats-range";

/**
 * Deeper cuts of the same numbers as the overview: pick a metric and see it
 * over time, the order mix per bucket, rates, peak hours and the rider table.
 */
type MetricId = "volume" | "orders" | "outcomes" | "serviceCharge" | "riderFees" | "signups" | "money";

const METRICS: Record<MetricId, { label: string; title: string; yFormat: "naira" | "count"; series: SeriesSpec[] }> = {
  volume: { label: "Order volume", title: "Order volume", yFormat: "naira", series: [{ key: "volume", label: "Volume", format: "naira" }] },
  orders: { label: "Orders placed", title: "Orders placed", yFormat: "count", series: [{ key: "orders", label: "Orders", format: "count" }] },
  outcomes: {
    label: "Completed vs cancelled",
    title: "Completed vs cancelled",
    yFormat: "count",
    series: [
      { key: "completed", label: "Completed", format: "count", color: "hsl(var(--chart-2))" },
      { key: "cancelled", label: "Cancelled", format: "count", color: "hsl(var(--chart-6))" },
    ],
  },
  serviceCharge: { label: "Platform revenue", title: "Platform revenue (service charge)", yFormat: "naira", series: [{ key: "serviceCharge", label: "Service charge", format: "naira", color: "hsl(var(--chart-3))" }] },
  riderFees: { label: "Rider fees", title: "Rider fees", yFormat: "naira", series: [{ key: "riderFees", label: "Rider fees", format: "naira", color: "hsl(var(--chart-4))" }] },
  signups: {
    label: "New customers vs riders",
    title: "New signups",
    yFormat: "count",
    series: [
      { key: "newCustomers", label: "Customers", format: "count" },
      { key: "newRiders", label: "Riders", format: "count", color: "hsl(var(--chart-4))" },
    ],
  },
  money: {
    label: "Money in vs out",
    title: "Money in vs out",
    yFormat: "naira",
    series: [
      { key: "moneyIn", label: "Money in", format: "naira", color: "hsl(var(--chart-2))" },
      { key: "moneyOut", label: "Money out", format: "naira", color: "hsl(var(--chart-6))" },
    ],
  },
};

const METRIC_IDS = Object.keys(METRICS) as MetricId[];
const TYPE_LABEL: Record<string, string> = { SINGLE: "Single", BATCH: "Batch", BULK: "Bulk" };

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      }
    >
      <Analytics />
    </Suspense>
  );
}

function Analytics() {
  const range = useStatsRange(30);
  const overview = useOverview(range.query);
  const series = useSeries({ ...range.query, bucket: range.bucket });
  const [metric, setMetric] = useState<MetricId>("volume");

  const o = overview.data;
  const cur = o?.current;
  const prev = o?.previous;
  const loading = overview.isLoading && !o;
  const seriesLoading = series.isLoading && !series.data;
  const points = useMemo(() => series.data?.points ?? [], [series.data]);
  const spark = (key: keyof SeriesPoint) => points.map((p) => ({ value: p[key] }));
  const spec = METRICS[metric];
  const hasMetric = points.some((p) => spec.series.some((s) => (p[s.key as keyof SeriesPoint] as number) > 0));

  const typeDonut = useMemo(() => Object.entries(cur?.byType ?? {}).map(([type, n]) => ({ name: TYPE_LABEL[type] ?? type, value: n })), [cur?.byType]);
  const statusDonut = useMemo(() => Object.entries(cur?.byStatus ?? {}).map(([status, n]) => ({ name: statusLabel(status), value: n })), [cur?.byStatus]);
  const moneyDonut = useMemo(() => {
    const t = o?.transactions;
    if (!t) return [];
    return [
      { name: "Deposits", value: t.deposits ?? 0 },
      { name: "Withdrawals", value: t.withdrawals ?? 0, color: "hsl(var(--chart-6))" },
      { name: "Fees", value: t.fees ?? 0, color: "hsl(var(--chart-3))" },
      { name: "Reversals", value: t.reversals ?? 0, color: "hsl(var(--chart-4))" },
    ];
  }, [o?.transactions]);

  if (overview.error && !o) {
    return (
      <>
        <PageHeader title="Analytics" description="Platform-wide trends across orders, money and people." />
        <ErrorState message={errorMessage(overview.error, "Could not load analytics.")} onRetry={() => void overview.refetch()} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Platform-wide trends across orders, money and people. Every trend compares to the window before it."
        actions={<RangeTabs value={range.value} onChange={range.setValue} />}
      />

      <StatGrid columns={5}>
        <StatCard
          tone="brand"
          label="Order volume"
          value={loading ? "" : nairaCompact(cur?.volume)}
          hint={loading ? "" : `${naira(cur?.completedVolume)} completed`}
          trend={cur && prev ? trend(cur.volume, prev.volume) : null}
          spark={spark("volume")}
          icon={CircleDollarSign}
          loading={loading}
        />
        <StatCard
          label="Orders"
          value={loading ? "" : count(cur?.orders)}
          hint={loading ? "" : `${count(cur?.customers)} customers · ${count(cur?.riders)} riders`}
          trend={cur && prev ? trend(cur.orders, prev.orders) : null}
          spark={spark("orders")}
          icon={Package}
          loading={loading}
        />
        <StatCard
          label="Completion rate"
          value={loading ? "" : percent(cur?.completionRate)}
          hint={loading ? "" : `${count(cur?.completed)} completed`}
          trend={cur && prev ? trend(cur.completionRate, prev.completionRate) : null}
          spark={spark("completed")}
          icon={CheckCircle2}
          loading={loading}
        />
        <StatCard
          label="Cancellation rate"
          value={loading ? "" : percent(cur?.cancellationRate)}
          hint={loading ? "" : `${count(cur?.cancelled)} cancelled`}
          trend={cur && prev ? trend(cur.cancellationRate, prev.cancellationRate) : null}
          spark={spark("cancelled")}
          icon={PackageX}
          loading={loading}
        />
        <StatCard
          label="Average order"
          value={loading ? "" : naira(cur?.averageOrderValue)}
          hint={loading ? "" : `${nairaCompact(cur?.serviceCharge)} platform revenue`}
          trend={cur && prev ? trend(cur.averageOrderValue, prev.averageOrderValue) : null}
          icon={Receipt}
          loading={loading}
        />
      </StatGrid>

      <ChartCard
        title={spec.title}
        subtitle={`Per ${range.bucket}, ${range.label}`}
        height={320}
        loading={seriesLoading}
        empty={!hasMetric}
        action={
          <Select value={metric} onChange={(e) => setMetric(e.target.value as MetricId)} className="h-9 w-auto min-w-[12rem] text-xs" aria-label="Metric">
            {METRIC_IDS.map((id) => (
              <option key={id} value={id}>
                {METRICS[id].label}
              </option>
            ))}
          </Select>
        }
      >
        <TrendChart data={points as unknown as Record<string, unknown>[]} xKey="bucket" xFormat={range.xf} kind={spec.series.length > 1 ? "line" : "area"} yFormat={spec.yFormat} series={spec.series} />
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Orders by type over time" subtitle={`Single, batch and bulk per ${range.bucket}`} height={280} loading={seriesLoading} empty={!points.some((p) => p.orders)}>
            <BarsChart
              data={points as unknown as Record<string, unknown>[]}
              xKey="bucket"
              xFormat={range.xf}
              stacked
              series={[
                { key: "single", label: "Single", format: "count" },
                { key: "batch", label: "Batch", format: "count", color: "hsl(var(--chart-3))" },
                { key: "bulk", label: "Bulk", format: "count", color: "hsl(var(--chart-4))" },
              ]}
            />
          </ChartCard>
        </div>
        <ChartCard title="Order types" subtitle="Share of orders in the window" height={280} loading={loading} empty={!cur?.orders}>
          <DonutChart data={typeDonut} format="count" centerValue={count(cur?.orders)} centerLabel="orders" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Order status" subtitle="Where orders in the window ended up" height={260} loading={loading} empty={!cur?.orders}>
          <DonutChart data={statusDonut} format="count" centerValue={percent(cur?.completionRate, 0)} centerLabel="completed" />
        </ChartCard>
        <ChartCard title="Transaction mix" subtitle={`Successful, by category. ${count(o?.transactions?.count)} transactions.`} height={260} loading={loading} empty={!moneyDonut.some((d) => d.value)}>
          <DonutChart data={moneyDonut} format="naira" centerValue={nairaCompact(o?.transactions?.volume)} centerLabel="moved" />
        </ChartCard>
        <ChartCard title="New signups" subtitle={`Customers and riders per ${range.bucket}`} height={260} loading={seriesLoading} empty={!points.some((p) => p.newCustomers || p.newRiders)}>
          <BarsChart
            data={points as unknown as Record<string, unknown>[]}
            xKey="bucket"
            xFormat={range.xf}
            stacked
            series={[
              { key: "newCustomers", label: "Customers", format: "count" },
              { key: "newRiders", label: "Riders", format: "count", color: "hsl(var(--chart-4))" },
            ]}
          />
        </ChartCard>
      </div>

      <PeakHours query={range.query} callout />

      <TopRiders query={range.query} limit={20} exportable subtitle="Top 20 by completed deliveries in this window" />
    </div>
  );
}
