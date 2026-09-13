"use client";

import { CheckCircle2, ShoppingBag, TrendingUp, Wallet, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { BarsChart, ChartCard, DonutChart, RangeTabs, StatCard, StatGrid, TrendChart, presetRange, rangeToQuery, type RangeValue } from "@/components/kit";
import type { OrderWindow } from "@/lib/admin/api";
import { count, naira, nairaCompact, percent, statusLabel, trend } from "@/lib/admin/format";
import { useOverview, useSeries } from "@/lib/admin/hooks";

import { TYPE_LABEL, paymentLabel } from "../lib";

/**
 * Volume, mix and outcomes for a window. Series and the overview both come
 * from admin-stats so the tiles and the charts agree to the order.
 */
function bucketLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });
}

function breakdown(map: Record<string, number> | undefined, label: (key: string) => string) {
  return Object.entries(map ?? {})
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ name: label(key), value }));
}

const CHART_STATUS = ["COMPLETED", "ON_GOING", "ACCEPTED", "INITIATED", "CANCELLED"];

export function AnalysisTab() {
  const [range, setRange] = useState<RangeValue>(() => presetRange(30));
  const query = useMemo(() => rangeToQuery(range), [range]);
  const overview = useOverview(query);
  const series = useSeries(query);

  const current: OrderWindow | undefined = overview.data?.current;
  const previous: OrderWindow | undefined = overview.data?.previous;
  const points = useMemo(() => (series.data?.points ?? []) as unknown as Record<string, unknown>[], [series.data]);
  const days = useMemo(() => {
    const from = overview.data?.range.from;
    const to = overview.data?.range.to;
    if (!from || !to) return range.preset && range.preset > 0 ? range.preset : 0;
    return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000) + 1);
  }, [overview.data, range.preset]);

  const statusMix = useMemo(
    () =>
      Object.entries(current?.byStatus ?? {})
        .filter(([, value]) => value > 0)
        .sort((a, b) => CHART_STATUS.indexOf(a[0]) - CHART_STATUS.indexOf(b[0]))
        .map(([key, value]) => ({ name: statusLabel(key), value })),
    [current],
  );
  const typeMix = useMemo(() => breakdown(current?.byType, (key) => TYPE_LABEL[key as keyof typeof TYPE_LABEL] ?? key), [current]);
  const paymentMix = useMemo(() => breakdown(current?.byPaymentStatus, paymentLabel), [current]);

  const windowLabel = range.all ? "All time" : `Last ${days} days`;
  const bucketWord = series.data?.bucket === "month" ? "Monthly" : series.data?.bucket === "week" ? "Weekly" : "Daily";
  const loading = overview.isLoading;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Volume, mix and outcomes for the window.</p>
        <RangeTabs value={range} onChange={setRange} />
      </div>

      <StatGrid columns={5}>
        <StatCard
          label="Orders"
          value={count(current?.orders)}
          icon={ShoppingBag}
          tone="brand"
          loading={loading}
          trend={current && previous ? trend(current.orders, previous.orders) : null}
          spark={points}
          sparkKey="orders"
        />
        <StatCard
          label="Completed"
          value={count(current?.completed)}
          icon={CheckCircle2}
          loading={loading}
          trend={current && previous ? trend(current.completed, previous.completed) : null}
          hint={`${percent(current?.completionRate)} completion rate`}
        />
        <StatCard
          label="Cancelled"
          value={count(current?.cancelled)}
          icon={XCircle}
          loading={loading}
          trend={current && previous ? trend(current.cancelled, previous.cancelled) : null}
          hint={`${percent(current?.cancellationRate)} cancellation rate`}
        />
        <StatCard
          label="Volume"
          value={nairaCompact(current?.volume)}
          icon={Wallet}
          loading={loading}
          trend={current && previous ? trend(current.volume, previous.volume) : null}
          hint={`${naira(current?.averageOrderValue)} average order`}
        />
        <StatCard
          label="Per day"
          value={days ? (Math.round(((current?.orders ?? 0) / days) * 10) / 10).toLocaleString("en-NG") : count(current?.orders)}
          icon={TrendingUp}
          loading={loading}
          hint={`${count(current?.customers)} customers, ${count(current?.riders)} riders`}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Order volume" subtitle={`${bucketWord}, ${windowLabel.toLowerCase()}`} height={280} loading={series.isLoading} empty={!points.length}>
            <TrendChart data={points} xKey="bucket" kind="area" xFormat={bucketLabel} series={[{ key: "orders", label: "Orders" }]} />
          </ChartCard>
        </div>
        <ChartCard title="Status mix" subtitle={windowLabel} height={280} loading={loading} empty={!statusMix.length}>
          <DonutChart data={statusMix} centerValue={count(current?.orders)} centerLabel="Orders" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Orders by type" subtitle={`${bucketWord}, ${windowLabel.toLowerCase()}`} height={260} loading={series.isLoading} empty={!points.length}>
            <BarsChart
              data={points}
              xKey="bucket"
              stacked
              xFormat={bucketLabel}
              series={[
                { key: "single", label: TYPE_LABEL.SINGLE },
                { key: "batch", label: TYPE_LABEL.BATCH },
                { key: "bulk", label: TYPE_LABEL.BULK },
              ]}
            />
          </ChartCard>
        </div>
        <ChartCard title="Type mix" subtitle={windowLabel} height={260} loading={loading} empty={!typeMix.length}>
          <DonutChart data={typeMix} centerValue={count(current?.orders)} centerLabel="Orders" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Completed vs cancelled" subtitle={`${bucketWord}, ${windowLabel.toLowerCase()}`} height={240} loading={series.isLoading} empty={!points.length}>
          <TrendChart
            data={points}
            xKey="bucket"
            kind="line"
            xFormat={bucketLabel}
            series={[
              { key: "completed", label: "Completed" },
              { key: "cancelled", label: "Cancelled" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Money through orders" subtitle={`${bucketWord}, ${windowLabel.toLowerCase()}`} height={240} loading={series.isLoading} empty={!points.length}>
          <TrendChart
            data={points}
            xKey="bucket"
            kind="area"
            yFormat="naira"
            xFormat={bucketLabel}
            series={[
              { key: "volume", label: "Volume", format: "naira" },
              { key: "riderFees", label: "Rider fees", format: "naira" },
              { key: "serviceCharge", label: "Service charge", format: "naira" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Payment status" subtitle={windowLabel} height={240} loading={loading} empty={!paymentMix.length}>
          <DonutChart data={paymentMix} centerValue={nairaCompact(current?.completedVolume)} centerLabel="Completed volume" />
        </ChartCard>
      </div>
    </div>
  );
}
