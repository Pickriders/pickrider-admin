"use client";

import { Bike, CircleDollarSign, Package, Zap } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import { useOverview, useSeries } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { count, naira, nairaCompact, percent, trend } from "@/lib/admin/format";
import { ChartCard, TrendChart } from "@/components/kit/charts";
import { ErrorState, PageHeader, Skeleton, Tabs } from "@/components/kit/primitives";
import { RangeTabs } from "@/components/kit/range-tabs";
import { StatCard, StatGrid } from "@/components/kit/stat-card";

import { AttentionStrip } from "./_components/attention-strip";
import { Community } from "./_components/community";
import { LiveRow } from "./_components/live-row";
import { MoneyMoved } from "./_components/money-moved";
import { OrdersBreakdown } from "./_components/orders-breakdown";
import { PeakHours } from "./_components/peak-hours";
import { RecentOrders } from "./_components/recent-orders";
import { TopRiders } from "./_components/top-riders";
import { useStatsRange } from "./_components/use-stats-range";

/**
 * Platform overview. What needs a person, what is live, the four numbers
 * that matter for the window, then the shape of the orders and the people.
 * Room to breathe on purpose: the detail lives one click away on each page.
 */
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      }
    >
      <Overview />
    </Suspense>
  );
}

function Overview() {
  const range = useStatsRange(30);
  const overview = useOverview(range.query);
  const series = useSeries({ ...range.query, bucket: range.bucket });
  const [trendMetric, setTrendMetric] = useState<"volume" | "orders">("volume");

  const o = overview.data;
  const cur = o?.current;
  const prev = o?.previous;
  const loading = overview.isLoading && !o;
  const points = useMemo(() => series.data?.points ?? [], [series.data]);
  const spark = (key: "volume" | "orders" | "serviceCharge" | "riderFees") => points.map((p) => ({ value: p[key] }));

  if (overview.error && !o) {
    return (
      <>
        <PageHeader title="Overview" description="Everything happening across Pickriders at a glance." />
        <ErrorState message={errorMessage(overview.error, "Could not load the overview.")} onRetry={() => void overview.refetch()} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description={`Everything across Pickriders, ${range.label}. Money in naira, times in Lagos.`} actions={<RangeTabs value={range.value} onChange={range.setValue} />} />

      <AttentionStrip />

      <StatGrid columns={4}>
        <StatCard
          tone="brand"
          label="Order volume"
          value={loading ? "" : nairaCompact(cur?.volume)}
          hint={loading ? "" : `${nairaCompact(cur?.completedVolume)} from completed orders`}
          trend={cur && prev ? trend(cur.volume, prev.volume) : null}
          spark={spark("volume")}
          icon={CircleDollarSign}
          loading={loading}
        />
        <StatCard
          label="Orders"
          value={loading ? "" : count(cur?.orders)}
          hint={loading ? "" : `${percent(cur?.completionRate, 0)} completed, average ${naira(cur?.averageOrderValue)}`}
          trend={cur && prev ? trend(cur.orders, prev.orders) : null}
          spark={spark("orders")}
          icon={Package}
          loading={loading}
        />
        <StatCard
          label="Platform revenue"
          value={loading ? "" : nairaCompact(cur?.serviceCharge)}
          hint={loading ? "" : "Service charge on completed trips"}
          trend={cur && prev ? trend(cur.serviceCharge, prev.serviceCharge) : null}
          spark={spark("serviceCharge")}
          icon={Zap}
          loading={loading}
        />
        <StatCard
          label="Rider earnings"
          value={loading ? "" : nairaCompact(cur?.riderFees)}
          hint={loading ? "" : `Across ${count(cur?.riders)} riders`}
          trend={cur && prev ? trend(cur.riderFees, prev.riderFees) : null}
          spark={spark("riderFees")}
          icon={Bike}
          loading={loading}
        />
      </StatGrid>

      <LiveRow live={o?.live} loading={loading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="Orders and volume"
            subtitle={`Per ${range.bucket}, ${range.label}`}
            height={340}
            loading={series.isLoading && !series.data}
            empty={!points.some((p) => p.orders)}
            action={
              <Tabs
                value={trendMetric}
                onChange={setTrendMetric}
                items={[
                  { id: "volume", label: "Volume" },
                  { id: "orders", label: "Orders" },
                ]}
              />
            }
          >
            {trendMetric === "volume" ? (
              <TrendChart
                data={points as unknown as Record<string, unknown>[]}
                xKey="bucket"
                xFormat={range.xf}
                kind="area"
                yFormat="naira"
                series={[
                  { key: "volume", label: "Volume", format: "naira" },
                  { key: "riderFees", label: "Rider earnings", format: "naira", color: "hsl(var(--chart-4))" },
                  { key: "serviceCharge", label: "Platform revenue", format: "naira", color: "hsl(var(--chart-3))" },
                ]}
              />
            ) : (
              <TrendChart
                data={points as unknown as Record<string, unknown>[]}
                xKey="bucket"
                xFormat={range.xf}
                kind="area"
                yFormat="count"
                series={[
                  { key: "orders", label: "Placed", format: "count" },
                  { key: "completed", label: "Completed", format: "count", color: "hsl(var(--chart-2))" },
                  { key: "cancelled", label: "Cancelled", format: "count", color: "hsl(var(--chart-6))" },
                ]}
              />
            )}
          </ChartCard>
        </div>
        <OrdersBreakdown current={cur} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopRiders query={range.query} limit={5} />
        <RecentOrders limit={6} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <PeakHours query={range.query} />
        </div>
        <div className="xl:col-span-2">
          <Community users={o?.users} vehicles={o?.vehicles} loading={loading} windowLabel={range.label} />
        </div>
      </div>

      <MoneyMoved transactions={o?.transactions} wallets={o?.wallets} loading={loading} windowLabel={range.label} />
    </div>
  );
}
