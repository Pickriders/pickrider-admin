"use client";

import { ArrowDownLeft, ArrowUpRight, Banknote, Coins, Landmark, Link2, Receipt, Undo2, Users, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { useExternalPayments, useFinanceStatus, useOverview, usePlatformWallet, useSeries, useTransactionSummary } from "@/lib/admin/hooks";
import { count, naira } from "@/lib/admin/format";
import {
  ChartCard,
  DonutChart,
  ErrorState,
  KeyValue,
  Panel,
  PanelHeader,
  RangeTabs,
  StatCard,
  StatGrid,
  TrendChart,
  presetRange,
  rangeToQuery,
  type RangeValue,
} from "@/components/kit";
import { PinCard, PinDrawer, SettlementCard, SettlementDrawer, WalletHero } from "./finance-setup";
import { rangeToDateRange } from "./lib";

const CATEGORY_COLORS: Record<string, string> = {
  Deposits: "hsl(var(--chart-1))",
  Withdrawals: "hsl(var(--chart-2))",
  Fees: "hsl(var(--chart-3))",
  Reversals: "hsl(var(--chart-4))",
  Charges: "hsl(var(--chart-5))",
};

function shortDay(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function OverviewTab() {
  const [range, setRange] = useState<RangeValue>(() => presetRange(30));
  const [drawer, setDrawer] = useState<null | "bank" | "pin">(null);

  const status = useFinanceStatus();
  const wallet = usePlatformWallet();
  const rangeQuery = useMemo(() => rangeToQuery(range), [range]);
  const dateRange = useMemo(() => rangeToDateRange(range), [range]);
  const overview = useOverview(rangeQuery);
  const series = useSeries({ ...rangeQuery, bucket: range.all ? "week" : "day" });
  const summary = useTransactionSummary(dateRange ? { dateRange } : undefined);
  const external = useExternalPayments(dateRange ? { dateRange } : undefined);

  const tx = overview.data?.transactions ?? {};
  const wallets = overview.data?.wallets ?? {};
  const sum = (summary.data ?? {}) as Record<string, number>;
  const ext = (external.data ?? {}) as Record<string, number>;
  const setupLoading = status.isLoading && wallet.isLoading;

  const mix = useMemo(
    () =>
      [
        { name: "Deposits", value: sum.deposits ?? 0 },
        { name: "Withdrawals", value: sum.withdrawals ?? 0 },
        { name: "Fees", value: sum.fees ?? 0 },
        { name: "Reversals", value: sum.refunds ?? 0 },
        { name: "Charges", value: sum.charges ?? 0 },
      ]
        .filter((slice) => slice.value > 0)
        .map((slice) => ({ ...slice, color: CATEGORY_COLORS[slice.name] })),
    [sum.deposits, sum.withdrawals, sum.fees, sum.refunds, sum.charges],
  );

  const points = useMemo(
    () => (series.data?.points ?? []).map((p) => ({ bucket: p.bucket, moneyIn: p.moneyIn, moneyOut: p.moneyOut })),
    [series.data],
  );
  const hasFlow = points.some((p) => p.moneyIn || p.moneyOut);

  return (
    <div className="space-y-6">
      {status.isError && wallet.isError ? (
        <ErrorState message="The platform wallet could not be loaded." onRetry={() => { void status.refetch(); void wallet.refetch(); }} />
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
        <WalletHero status={status.data} wallet={wallet.data} loading={setupLoading} />
        <SettlementCard status={status.data} loading={status.isLoading} onChange={() => setDrawer("bank")} />
        <PinCard status={status.data} loading={status.isLoading} onChange={() => setDrawer("pin")} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-black tracking-tight text-ink">Money moved</h2>
          <p className="text-xs text-ink-muted">Successful transactions across every wallet on the platform.</p>
        </div>
        <RangeTabs value={range} onChange={setRange} />
      </div>

      <StatGrid columns={4}>
        <StatCard label="Money in" value={naira(tx.moneyIn)} icon={ArrowDownLeft} hint="Credits to wallets" loading={overview.isLoading} />
        <StatCard label="Money out" value={naira(tx.moneyOut)} icon={ArrowUpRight} hint="Debits from wallets" loading={overview.isLoading} />
        <StatCard label="Transactions" value={count(tx.count)} icon={Receipt} hint={`${naira(tx.volume)} total volume`} loading={overview.isLoading} />
        <StatCard label="Provider fees" value={naira(tx.fees)} icon={Coins} hint="Charges taken by Paystack and co" loading={overview.isLoading} />
      </StatGrid>

      <StatGrid columns={4}>
        <StatCard label="Deposits" value={naira(tx.deposits)} icon={Banknote} loading={overview.isLoading} />
        <StatCard label="Withdrawals" value={naira(tx.withdrawals)} icon={Landmark} loading={overview.isLoading} />
        <StatCard label="Reversals" value={naira(tx.reversals)} icon={Undo2} loading={overview.isLoading} />
        <StatCard
          label="Net flow"
          value={naira((tx.moneyIn ?? 0) - (tx.moneyOut ?? 0))}
          icon={Wallet}
          hint="Money in minus money out"
          loading={overview.isLoading}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Money in vs money out"
            subtitle={range.all ? "Weekly, all time" : "Daily, over the picked window"}
            loading={series.isLoading}
            empty={!series.isLoading && !hasFlow}
            height={280}
          >
            <TrendChart
              data={points}
              xKey="bucket"
              kind="area"
              yFormat="naira"
              xFormat={shortDay}
              series={[
                { key: "moneyIn", label: "Money in", format: "naira" },
                { key: "moneyOut", label: "Money out", format: "naira" },
              ]}
            />
          </ChartCard>
        </div>
        <ChartCard title="By category" subtitle="Share of successful volume" loading={summary.isLoading} empty={!summary.isLoading && !mix.length} height={280}>
          <DonutChart data={mix} format="naira" centerLabel="Volume" centerValue={naira(sum.totalVolume)} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Successful transactions" subtitle="Totals from the transactions ledger for this window" />
          <div className="px-5 pb-5 pt-4">
            {summary.isError ? (
              <ErrorState message="The summary could not be loaded." onRetry={() => void summary.refetch()} />
            ) : (
              <KeyValue
                columns={2}
                items={[
                  { label: "Total volume", value: summary.isLoading ? "…" : naira(sum.totalVolume) },
                  { label: "Count", value: summary.isLoading ? "…" : count(sum.count) },
                  { label: "Inflow", value: summary.isLoading ? "…" : naira(sum.inflow) },
                  { label: "Outflow", value: summary.isLoading ? "…" : naira(sum.outflow) },
                  { label: "Deposits", value: summary.isLoading ? "…" : naira(sum.deposits) },
                  { label: "Withdrawals", value: summary.isLoading ? "…" : naira(sum.withdrawals) },
                  { label: "Fees", value: summary.isLoading ? "…" : naira(sum.fees) },
                  { label: "Refunds", value: summary.isLoading ? "…" : naira(sum.refunds) },
                  { label: "Charges", value: summary.isLoading ? "…" : naira(sum.charges) },
                  { label: "Wallets involved", value: summary.isLoading ? "…" : count(sum.uniqueEntities) },
                ]}
              />
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Wallets held" subtitle="Balances sitting in wallets right now, not windowed" />
          <div className="px-5 pb-5 pt-4">
            <KeyValue
              columns={2}
              items={[
                { label: "Customer and rider balances", value: overview.isLoading ? "…" : naira(wallets.userBalances) },
                { label: "User wallets", value: overview.isLoading ? "…" : count(wallets.userWallets) },
                { label: "Business balances", value: overview.isLoading ? "…" : naira(wallets.businessBalances) },
                { label: "Business wallets", value: overview.isLoading ? "…" : count(wallets.businessWallets) },
                { label: "Platform balance", value: overview.isLoading ? "…" : naira(wallets.platformBalance) },
              ]}
            />
          </div>
        </Panel>
      </div>

      <div>
        <div className="mb-3">
          <h2 className="text-base font-black tracking-tight text-ink">Someone else pays</h2>
          <p className="text-xs text-ink-muted">Orders funded by a third party through a shared pay link, same window.</p>
        </div>
        {external.isError ? (
          <ErrorState message="Pay link metrics could not be loaded." onRetry={() => void external.refetch()} />
        ) : (
          <StatGrid columns={5}>
            <StatCard label="Payments" value={count(ext.count)} icon={Link2} loading={external.isLoading} />
            <StatCard label="Total funded" value={naira(ext.totalFunded)} icon={Banknote} loading={external.isLoading} />
            <StatCard label="Fees charged" value={naira(ext.totalFees)} icon={Coins} loading={external.isLoading} />
            <StatCard label="Net received" value={naira(ext.netReceived)} icon={Wallet} loading={external.isLoading} />
            <StatCard label="Unique payers" value={count(ext.uniqueCustomers)} icon={Users} loading={external.isLoading} />
          </StatGrid>
        )}
      </div>

      <SettlementDrawer open={drawer === "bank"} onClose={() => setDrawer(null)} />
      <PinDrawer open={drawer === "pin"} onClose={() => setDrawer(null)} hasPin={Boolean(status.data?.hasPin)} />
    </div>
  );
}
