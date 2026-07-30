"use client";

import * as React from "react";
import { CheckCircle2, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import {
  useGetOrdersTimeseriesQuery,
  useGetPlatformOverviewQuery,
  useGetTransactionMixQuery,
  useGetUserGrowthQuery,
} from "@/api/queries/analytics";
import { formatMoney } from "@/utils";
import { StatCard } from "@/components/StatCard";
import { BarSeriesChart, CHART_COLORS, ChartCard, ChartLegend, DonutChart, TrendAreaChart } from "@/components/charts";
import { RangeTabs } from "./RangeTabs";

const sum = (arr: any[] | undefined, key: string) => (arr ?? []).reduce((acc, row) => acc + (row[key] ?? 0), 0);

const AnalyticsPage = () => {
  const [days, setDays] = React.useState(30);
  const { data: overview } = useGetPlatformOverviewQuery();
  const { data: timeseries } = useGetOrdersTimeseriesQuery(days);
  const { data: userGrowth } = useGetUserGrowthQuery(days);
  const { data: txnMix } = useGetTransactionMixQuery(days);

  const currency = overview?.currency;
  const totalOrders = sum(timeseries, "orders");
  const totalRevenue = sum(timeseries, "revenue");
  const totalPaid = sum(timeseries, "paid");
  const totalCompleted = sum(timeseries, "completed");
  const completionRate = totalOrders ? (totalCompleted / totalOrders) * 100 : 0;
  const avgOrderValue = totalPaid ? totalRevenue / totalPaid : 0;

  const statusData = [
    { name: "Completed", value: overview?.orders.completed ?? 0, color: CHART_COLORS[0] },
    { name: "Ongoing", value: overview?.orders.ongoing ?? 0, color: CHART_COLORS[3] },
    { name: "Pending", value: overview?.orders.pending ?? 0, color: CHART_COLORS[2] },
    { name: "Cancelled", value: overview?.orders.cancelled ?? 0, color: CHART_COLORS[4] },
  ];

  const typeData = [
    { name: "Single", value: overview?.types.single ?? 0, color: CHART_COLORS[0] },
    { name: "Batch", value: overview?.types.batch ?? 0, color: CHART_COLORS[1] },
    { name: "Bulk", value: overview?.types.bulk ?? 0, color: CHART_COLORS[3] },
  ];

  const txnMixData = (txnMix ?? []).map((entry, i) => ({
    name: entry.category.charAt(0) + entry.category.slice(1).toLowerCase(),
    value: entry.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-clash-display text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform-wide trends across orders, revenue and users.</p>
        </div>
        <RangeTabs value={days} onChange={setDays} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Orders (${days}d)`}
          value={totalOrders.toLocaleString()}
          icon={<ShoppingBag size={18} />}
          accent="#3FA49F"
          sparkData={timeseries}
          sparkKey="orders"
        />
        <StatCard
          label={`Revenue (${days}d)`}
          value={formatMoney(totalRevenue, { currency })}
          icon={<TrendingUp size={18} />}
          accent="#F59E0B"
          sparkData={timeseries}
          sparkKey="revenue"
        />
        <StatCard
          label="Completion rate"
          value={`${completionRate.toFixed(1)}%`}
          icon={<CheckCircle2 size={18} />}
          accent="#16A34A"
          footer={`${totalCompleted.toLocaleString()} completed`}
        />
        <StatCard
          label="Avg. order value"
          value={formatMoney(avgOrderValue, { currency })}
          icon={<Receipt size={18} />}
          accent="#7C3AED"
          footer={`${totalPaid.toLocaleString()} paid orders`}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Order volume" subtitle={`Daily, last ${days} days`}>
          <TrendAreaChart
            data={timeseries ?? []}
            xKey="label"
            height={280}
            type="line"
            series={[{ key: "orders", label: "Orders", color: CHART_COLORS[0] }]}
          />
        </ChartCard>
        <ChartCard title="Order status" subtitle="All time">
          <DonutChart data={statusData} centerValue={(overview?.orders.total ?? 0).toLocaleString()} centerLabel="Orders" />
          <div className="mt-4">
            <ChartLegend items={statusData.map((s) => ({ label: s.name, value: s.value.toLocaleString(), color: s.color }))} />
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Revenue" subtitle={`Paid-order value, last ${days} days`}>
          <TrendAreaChart
            data={timeseries ?? []}
            xKey="label"
            height={260}
            currency
            series={[{ key: "revenue", label: "Revenue", color: CHART_COLORS[2] }]}
          />
        </ChartCard>
        <ChartCard title="Order types" subtitle="All time">
          <DonutChart
            data={typeData}
            centerValue={typeData.reduce((a, b) => a + b.value, 0).toLocaleString()}
            centerLabel="Orders"
          />
          <div className="mt-4">
            <ChartLegend items={typeData.map((s) => ({ label: s.name, value: s.value.toLocaleString(), color: s.color }))} />
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Orders by type" subtitle={`Daily, last ${days} days`}>
          <BarSeriesChart
            data={timeseries ?? []}
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
        <ChartCard title="Transaction mix" subtitle={`Successful, last ${days} days`}>
          <DonutChart
            data={txnMixData}
            centerValue={txnMixData.reduce((a, b) => a + b.value, 0).toLocaleString()}
            centerLabel="Transactions"
          />
          <div className="mt-4">
            <ChartLegend items={txnMixData.map((s) => ({ label: s.name, value: s.value.toLocaleString(), color: s.color }))} />
          </div>
        </ChartCard>
      </div>

      <div className="mt-5">
        <ChartCard title="User growth" subtitle={`New signups (customers vs riders), last ${days} days`}>
          <BarSeriesChart
            data={userGrowth ?? []}
            xKey="label"
            height={260}
            stacked
            series={[
              { key: "customers", label: "Customers", color: CHART_COLORS[0] },
              { key: "riders", label: "Riders", color: CHART_COLORS[1] },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
