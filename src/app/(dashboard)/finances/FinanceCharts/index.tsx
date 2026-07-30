"use client";

import {
  useGetOrdersTimeseriesQuery,
  useGetPlatformOverviewQuery,
  useGetTransactionMixQuery,
} from "@/api/queries/analytics";
import { BarSeriesChart, CHART_COLORS, ChartCard, ChartLegend, DonutChart, TrendAreaChart } from "@/components/charts";

export const FinanceCharts = () => {
  const { data: overview } = useGetPlatformOverviewQuery();
  const { data: timeseries } = useGetOrdersTimeseriesQuery(30);
  const { data: txnMix } = useGetTransactionMixQuery(30);

  const txnMixData = (txnMix ?? []).map((entry, i) => ({
    name: entry.category.charAt(0) + entry.category.slice(1).toLowerCase(),
    value: entry.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const flow = [
    { name: "Credits", value: overview?.money.creditTxns ?? 0, credits: overview?.money.creditTxns ?? 0, debits: 0 },
    { name: "Debits", value: overview?.money.debitTxns ?? 0, credits: 0, debits: overview?.money.debitTxns ?? 0 },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
      <ChartCard className="lg:col-span-2" title="Revenue trend" subtitle="Paid-order value, last 30 days">
        <TrendAreaChart
          data={timeseries ?? []}
          xKey="label"
          height={260}
          currency
          series={[{ key: "revenue", label: "Revenue", color: CHART_COLORS[2] }]}
        />
      </ChartCard>

      <ChartCard title="Transaction mix" subtitle="Successful, last 30 days">
        <DonutChart
          data={txnMixData}
          centerValue={txnMixData.reduce((a, b) => a + b.value, 0).toLocaleString()}
          centerLabel="Transactions"
        />
        <div className="mt-4">
          <ChartLegend items={txnMixData.map((s) => ({ label: s.name, value: s.value.toLocaleString(), color: s.color }))} />
        </div>
      </ChartCard>

      <ChartCard className="lg:col-span-3" title="Credits vs debits" subtitle="Successful platform-wallet transactions">
        <BarSeriesChart
          data={flow}
          xKey="name"
          height={220}
          series={[
            { key: "credits", label: "Credits", color: CHART_COLORS[0] },
            { key: "debits", label: "Debits", color: CHART_COLORS[4] },
          ]}
        />
      </ChartCard>
    </div>
  );
};
