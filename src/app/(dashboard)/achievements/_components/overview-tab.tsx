"use client";

import { Award, Gift, Medal, Users, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

import { BarsChart, ChartCard, KeyValue, Panel, PanelHeader, StatCard, StatGrid, TrendChart } from "@/components/kit";
import { count, naira, percent } from "@/lib/admin/format";
import { useAchievementCatalogue, useAchievementsSummary } from "@/lib/admin/hooks";

/** Programme totals plus the reward rules currently in force (set in the backend catalogue). */
export function OverviewTab() {
  const router = useRouter();
  const summary = useAchievementsSummary();
  const catalogue = useAchievementCatalogue();
  const data = summary.data;
  const redemption = data?.rewardsIssued ? (data.rewardsRedeemed / data.rewardsIssued) * 100 : 0;
  const top = [...(catalogue.data ?? [])].sort((a, b) => b.unlockedCount - a.unlockedCount).slice(0, 8);

  return (
    <div className="space-y-5">
      <StatGrid columns={5}>
        <StatCard
          label="Customers with badges"
          value={count(data?.customersWithBadges)}
          hint={`${count(data?.badges)} badges in the catalogue`}
          icon={Users}
          tone="brand"
          loading={summary.isPending}
        />
        <StatCard
          label="Badges unlocked"
          value={count(data?.unlocksTotal)}
          hint={`${count(data?.unlocks30d)} in the last 30 days`}
          icon={Medal}
          loading={summary.isPending}
          onClick={() => router.push("/achievements?tab=unlocks")}
        />
        <StatCard
          label="Rewards issued"
          value={count(data?.rewardsIssued)}
          hint={`${count(data?.rewardsOutstanding)} unused and still valid`}
          icon={Gift}
          loading={summary.isPending}
          onClick={() => router.push("/achievements?tab=unlocks&reward=unredeemed")}
        />
        <StatCard
          label="Rewards redeemed"
          value={percent(redemption, 0)}
          hint={`${count(data?.rewardsRedeemed)} of ${count(data?.rewardsIssued)} used`}
          icon={Award}
          loading={summary.isPending}
          onClick={() => router.push("/achievements?tab=unlocks&reward=redeemed")}
        />
        <StatCard
          label="Discount given"
          value={naira(data?.discountTotal)}
          hint="Through badge reward coupons"
          icon={Wallet}
          loading={summary.isPending}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Unlocks per day, last 30 days" loading={summary.isPending} empty={!data?.daily.length}>
            <TrendChart
              data={data?.daily ?? []}
              xKey="date"
              kind="area"
              series={[{ key: "count", label: "Unlocks", format: "count" }]}
              yFormat="count"
              xFormat={(value) => value.slice(5)}
            />
          </ChartCard>
        </div>
        <Panel>
          <PanelHeader title="Reward rules" subtitle="Applied when a badge unlocks" />
          <div className="px-6 pb-5">
            <KeyValue
              columns={1}
              items={[
                { label: "Tier 1 badges", value: `${data?.rewardPercentByTier?.["1"] ?? "—"}% off the next delivery` },
                { label: "Tier 2 badges", value: `${data?.rewardPercentByTier?.["2"] ?? "—"}% off the next delivery` },
                { label: "Tier 3 badges", value: `${data?.rewardPercentByTier?.["3"] ?? "—"}% off the next delivery` },
                { label: "Cap per reward", value: naira(data?.rewardMaxDiscount) },
                { label: "Valid for", value: data ? `${data.rewardValidityDays} days` : undefined },
              ]}
            />
            <p className="mt-3 text-[11px] text-ink-faint">
              Rules live in the backend catalogue; change them there and they apply to new unlocks only.
            </p>
          </div>
        </Panel>
      </div>

      <ChartCard
        title="Most unlocked badges"
        subtitle="All time"
        loading={catalogue.isPending}
        empty={!top.length}
        height={300}
      >
        <BarsChart
          data={top.map((row) => ({ badge: row.title, unlocked: row.unlockedCount, redeemed: row.rewardsRedeemed }))}
          xKey="badge"
          series={[
            { key: "unlocked", label: "Unlocked", format: "count" },
            { key: "redeemed", label: "Reward redeemed", format: "count", color: "hsl(var(--chart-2))" },
          ]}
          yFormat="count"
          horizontal
        />
      </ChartCard>
    </div>
  );
}
