"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingBag, TrendingUp, XCircle } from "lucide-react";
import { useGetOrderAnalyticsQuery } from "@/api/queries/orders";
import { useGetOrdersTimeseriesQuery } from "@/api/queries/analytics";
import { StatCard } from "@/components/StatCard";
import { BarSeriesChart, CHART_COLORS, ChartCard, ChartLegend, DonutChart, TrendAreaChart } from "@/components/charts";
import { cn } from "@/lib/utils";

const RANGES = [
  { id: 7, label: "7 days" },
  { id: 30, label: "30 days" },
  { id: 90, label: "90 days" },
];

const sum = (arr: any[] | undefined, key: string) => (arr ?? []).reduce((acc, row) => acc + (row[key] ?? 0), 0);

const OrderAnalysisPage = () => {
  const [days, setDays] = React.useState(30);
  const { data: overview } = useGetOrderAnalyticsQuery();
  const { data: series } = useGetOrdersTimeseriesQuery(days);

  const totalOrders = sum(series, "orders");
  const completed = sum(series, "completed");
  const cancelled = sum(series, "cancelled");
  const completionRate = totalOrders ? (completed / totalOrders) * 100 : 0;
  const cancellationRate = totalOrders ? (cancelled / totalOrders) * 100 : 0;

  const statusData = [
    { name: "Completed", value: overview?.totals.completed ?? 0, color: CHART_COLORS[0] },
    { name: "Ongoing", value: overview?.totals.ongoing ?? 0, color: CHART_COLORS[3] },
    { name: "Pending", value: overview?.totals.pending ?? 0, color: CHART_COLORS[2] },
    { name: "Cancelled", value: overview?.totals.cancelled ?? 0, color: CHART_COLORS[4] },
  ];
  const typeData = [
    { name: "Single", value: overview?.typeTotals.single ?? 0, color: CHART_COLORS[0] },
    { name: "Batch", value: overview?.typeTotals.batch ?? 0, color: CHART_COLORS[1] },
    { name: "Bulk", value: overview?.typeTotals.bulk ?? 0, color: CHART_COLORS[3] },
  ];

  return (
    <div>
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Order analysis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Volume, mix and outcomes across the platform.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setDays(r.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                days === r.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Orders (${days}d)`}
          value={totalOrders.toLocaleString()}
          icon={<ShoppingBag size={18} />}
          accent="#3FA49F"
          sparkData={series}
          sparkKey="orders"
        />
        <StatCard
          label="Completed"
          value={completed.toLocaleString()}
          icon={<CheckCircle2 size={18} />}
          accent="#16A34A"
          footer={`${completionRate.toFixed(1)}% completion rate`}
        />
        <StatCard
          label="Cancelled"
          value={cancelled.toLocaleString()}
          icon={<XCircle size={18} />}
          accent="#FF5244"
          footer={`${cancellationRate.toFixed(1)}% cancellation rate`}
        />
        <StatCard
          label="Avg / day"
          value={(totalOrders / days).toFixed(1)}
          icon={<TrendingUp size={18} />}
          accent="#7C3AED"
          footer={`Over ${days} days`}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Order volume" subtitle={`Daily, last ${days} days`}>
          <TrendAreaChart
            data={series ?? []}
            xKey="label"
            height={280}
            type="line"
            series={[{ key: "orders", label: "Orders", color: CHART_COLORS[0] }]}
          />
        </ChartCard>
        <ChartCard title="Status mix" subtitle="All time">
          <DonutChart data={statusData} centerValue={(overview?.totals ? Object.values(overview.totals).reduce((a, b) => a + b, 0) : 0).toLocaleString()} centerLabel="Orders" />
          <div className="mt-4">
            <ChartLegend items={statusData.map((s) => ({ label: s.name, value: s.value.toLocaleString(), color: s.color }))} />
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Orders by type" subtitle={`Daily, last ${days} days`}>
          <BarSeriesChart
            data={series ?? []}
            xKey="label"
            height={260}
            stacked
            series={[
              { key: "single", label: "Single", color: CHART_COLORS[0] },
              { key: "batch", label: "Batch", color: CHART_COLORS[1] },
              { key: "bulk", label: "Bulk", color: CHART_COLORS[3] },
            ]}
          />
        </ChartCard>
        <ChartCard title="Type mix" subtitle="All time">
          <DonutChart data={typeData} centerValue={typeData.reduce((a, b) => a + b.value, 0).toLocaleString()} centerLabel="Orders" />
          <div className="mt-4">
            <ChartLegend items={typeData.map((s) => ({ label: s.name, value: s.value.toLocaleString(), color: s.color }))} />
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Completed vs cancelled" subtitle={`Daily, last ${days} days`}>
          <TrendAreaChart
            data={series ?? []}
            xKey="label"
            height={240}
            series={[
              { key: "completed", label: "Completed", color: CHART_COLORS[0] },
              { key: "cancelled", label: "Cancelled", color: CHART_COLORS[4] },
            ]}
          />
        </ChartCard>
        <ChartCard title="Revenue from paid orders" subtitle={`Daily, last ${days} days`}>
          <TrendAreaChart
            data={series ?? []}
            xKey="label"
            height={240}
            currency
            series={[{ key: "revenue", label: "Revenue", color: CHART_COLORS[2] }]}
          />
        </ChartCard>
      </div>
    </div>
  );
};

export default OrderAnalysisPage;
