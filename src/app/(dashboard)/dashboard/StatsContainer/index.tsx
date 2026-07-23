"use client";

import * as React from "react";
import { Package, ShoppingBag, Users, Wallet } from "lucide-react";
import {
  useGetOrdersTimeseriesQuery,
  useGetPlatformOverviewQuery,
  useGetTransactionMixQuery,
  useGetUserGrowthQuery,
} from "@/api/queries/analytics";
import { formatMoney, subUnitToBaseUnit } from "@/utils";
import { StatCard } from "@/components/StatCard";
import {
  BarSeriesChart,
  CHART_COLORS,
  ChartCard,
  ChartLegend,
  DonutChart,
  TrendAreaChart,
} from "@/components/charts";

const sum = (arr: any[] | undefined, key: string) => (arr ?? []).reduce((acc, row) => acc + (row[key] ?? 0), 0);
const pctChange = (current: number, prior: number): number | null =>
  prior === 0 ? (current === 0 ? 0 : null) : ((current - prior) / prior) * 100;

const MiniStat = ({ label, value, tone }: { label: string; value: number; tone?: "up" | "down" | "muted" }) => (
  <div className="rounded-xl border bg-surface px-4 py-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p
      className={
        "mt-1 font-clash-display text-lg font-semibold " +
        (tone === "up" ? "text-emerald-600" : tone === "down" ? "text-red-500" : "text-foreground")
      }
    >
      {value.toLocaleString()}
    </p>
  </div>
);

export const StatsContainer = () => {
  const { data: overview, isLoading } = useGetPlatformOverviewQuery();
  const { data: timeseries } = useGetOrdersTimeseriesQuery(30);
  const { data: userGrowth } = useGetUserGrowthQuery(30);
  const { data: txnMix } = useGetTransactionMixQuery(30);

  const currency = overview?.currency;
  const revenue30 = sum(timeseries, "revenue");
  const orders7 = sum(timeseries?.slice(-7), "orders");
  const ordersPrev7 = sum(timeseries?.slice(-14, -7), "orders");
  const revenue7 = sum(timeseries?.slice(-7), "revenue");
  const revenuePrev7 = sum(timeseries?.slice(-14, -7), "revenue");

  const statusData = [
    { name: "Completed", value: overview?.orders.completed ?? 0, color: CHART_COLORS[0] },
    { name: "Ongoing", value: overview?.orders.ongoing ?? 0, color: CHART_COLORS[3] },
    { name: "Pending", value: overview?.orders.pending ?? 0, color: CHART_COLORS[2] },
    { name: "Cancelled", value: overview?.orders.cancelled ?? 0, color: CHART_COLORS[4] },
  ];

  const txnMixData = (txnMix ?? []).map((entry, i) => ({
    name: entry.category.charAt(0) + entry.category.slice(1).toLowerCase(),
    value: entry.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="mt-6 space-y-5">
      {/* Hero stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="brand"
          label="Platform Balance"
          value={formatMoney(subUnitToBaseUnit(overview?.balance ?? 0), { currency })}
          icon={<Wallet size={18} />}
          footer="Settlement wallet"
          loading={isLoading}
        />
        <StatCard
          label="Orders (30d)"
          value={sum(timeseries, "orders").toLocaleString()}
          icon={<ShoppingBag size={18} />}
          accent="#3FA49F"
          trend={pctChange(orders7, ordersPrev7)}
          sparkData={timeseries}
          sparkKey="orders"
        />
        <StatCard
          label="Revenue (30d)"
          value={formatMoney(revenue30, { currency })}
          icon={<Package size={18} />}
          accent="#7C3AED"
          trend={pctChange(revenue7, revenuePrev7)}
          sparkData={timeseries}
          sparkKey="revenue"
        />
        <StatCard
          label="Total Customers"
          value={(overview?.people.customers ?? 0).toLocaleString()}
          icon={<Users size={18} />}
          accent="#0284C7"
          footer={`${overview?.people.activeCustomers ?? 0} active`}
          loading={isLoading}
        />
      </div>

      {/* Orders trend + status */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Orders & revenue"
          subtitle="Last 30 days"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS[0] }} /> Orders
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS[2] }} /> Revenue
              </span>
            </div>
          }
        >
          <TrendAreaChart
            data={timeseries ?? []}
            xKey="label"
            height={280}
            series={[
              { key: "orders", label: "Orders", color: CHART_COLORS[0] },
              { key: "revenue", label: "Revenue", color: CHART_COLORS[2] },
            ]}
          />
        </ChartCard>

        <ChartCard title="Order status" subtitle="All time">
          <DonutChart data={statusData} centerValue={(overview?.orders.total ?? 0).toLocaleString()} centerLabel="Total orders" />
          <div className="mt-4">
            <ChartLegend items={statusData.map((s) => ({ label: s.name, value: s.value.toLocaleString(), color: s.color }))} />
          </div>
        </ChartCard>
      </div>

      {/* Order type + user growth + txn mix */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="Orders by type" subtitle="Daily, last 30 days">
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

        <ChartCard title="Transaction mix" subtitle="Successful, last 30 days">
          <DonutChart data={txnMixData} centerValue={txnMixData.reduce((a, b) => a + b.value, 0).toLocaleString()} centerLabel="Transactions" />
          <div className="mt-4">
            <ChartLegend items={txnMixData.map((s) => ({ label: s.name, value: s.value.toLocaleString(), color: s.color }))} />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard className="lg:col-span-2" title="New signups" subtitle="Customers vs riders, last 30 days">
          <TrendAreaChart
            data={userGrowth ?? []}
            xKey="label"
            height={240}
            series={[
              { key: "customers", label: "Customers", color: CHART_COLORS[0] },
              { key: "riders", label: "Riders", color: CHART_COLORS[1] },
            ]}
          />
        </ChartCard>

        <ChartCard title="Fleet" subtitle="Vehicles on the platform">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Total vehicles" value={overview?.fleet.vehicles ?? 0} />
            <MiniStat label="Verified" value={overview?.fleet.verified ?? 0} tone="up" />
            <MiniStat label="Pending" value={overview?.fleet.pending ?? 0} tone="down" />
            <MiniStat label="Active riders" value={overview?.people.activeRiders ?? 0} />
          </div>
        </ChartCard>
      </div>

      {/* Community — every count the dashboard has always shown */}
      <ChartCard title="Community" subtitle="Customers, businesses & couriers">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <MiniStat label="Customers" value={overview?.people.customers ?? 0} />
          <MiniStat label="Active customers" value={overview?.people.activeCustomers ?? 0} tone="up" />
          <MiniStat label="Inactive customers" value={overview?.people.inactiveCustomers ?? 0} tone="down" />
          <MiniStat label="Businesses" value={overview?.people.businesses ?? 0} />
          <MiniStat label="Verified business" value={overview?.people.activeBusinesses ?? 0} tone="up" />
          <MiniStat label="Unverified business" value={overview?.people.inactiveBusinesses ?? 0} tone="down" />
          <MiniStat label="Couriers" value={overview?.people.riders ?? 0} />
          <MiniStat label="Active couriers" value={overview?.people.activeRiders ?? 0} tone="up" />
          <MiniStat label="Inactive couriers" value={overview?.people.inactiveRiders ?? 0} tone="down" />
          <MiniStat label="Single orders" value={overview?.types.single ?? 0} />
          <MiniStat label="Batch orders" value={overview?.types.batch ?? 0} />
          <MiniStat label="Bulk orders" value={overview?.types.bulk ?? 0} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Credit txns (success)" value={overview?.money.creditTxns ?? 0} tone="up" />
          <MiniStat label="Debit txns (success)" value={overview?.money.debitTxns ?? 0} tone="down" />
          <MiniStat label="Completed orders" value={overview?.orders.completed ?? 0} tone="up" />
          <MiniStat label="Cancelled orders" value={overview?.orders.cancelled ?? 0} tone="down" />
        </div>
      </ChartCard>
    </div>
  );
};
