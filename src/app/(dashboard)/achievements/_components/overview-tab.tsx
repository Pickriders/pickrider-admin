"use client";

import { Award, ChevronRight, Gift, Medal, Trophy, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Badge, ChartCard, EmptyState, Panel, PanelHeader, RangeTabs, Skeleton, StatCard, StatGrid, TrendChart, cx } from "@/components/kit";
import type { AchievementBadgeRollup } from "@/lib/admin/api";
import { count, naira, nairaCompact, percent, trend } from "@/lib/admin/format";
import { useAchievementsSummary } from "@/lib/admin/hooks";

import { useStatsRange } from "../../dashboard/_components/use-stats-range";
import { CATEGORY_LABEL, TIER_CHIP, TierBadge } from "./shared";

/**
 * The badge programme in the chosen window: how many customers are earning
 * badges, what the rewards cost, which badges land most, and the rules that
 * decide what a badge pays. Every tile compares with the window before.
 */
export function OverviewTab() {
  const range = useStatsRange(30);
  const summary = useAchievementsSummary(range.query);
  const data = summary.data;
  const cur = data?.current;
  const prev = data?.previous;
  const loading = summary.isPending && !data;

  const redemption = cur?.rewardsIssued ? (cur.rewardsRedeemed / cur.rewardsIssued) * 100 : 0;
  const previousRedemption = prev?.rewardsIssued ? (prev.rewardsRedeemed / prev.rewardsIssued) * 100 : 0;
  // "All time" has no window before it to compare with.
  const change = (current: number, previous: number) => (range.value.all ? null : trend(current, previous));
  const daily = useMemo(() => (data?.daily ?? []).map((row) => ({ date: row.date, count: row.count })), [data?.daily]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          {data ? `${count(data.customersWithBadges)} customers hold at least one of ${count(data.badges)} badges` : "Loading the programme"}
        </p>
        <RangeTabs value={range.value} onChange={range.setValue} />
      </div>

      <StatGrid columns={3}>
        <StatCard
          tone="brand"
          label="Badges unlocked"
          value={loading ? "" : count(cur?.unlocks)}
          hint={loading ? "" : `${count(data?.unlocksTotal)} all time`}
          trend={cur && prev ? change(cur.unlocks, prev.unlocks) : null}
          spark={daily.map((d) => ({ value: d.count }))}
          icon={Medal}
          loading={loading}
        />
        <StatCard
          label="Rewards issued"
          value={loading ? "" : count(cur?.rewardsIssued)}
          hint={loading ? "" : `${count(data?.rewardsOutstanding)} unused and still valid right now`}
          trend={cur && prev ? change(cur.rewardsIssued, prev.rewardsIssued) : null}
          icon={Gift}
          loading={loading}
        />
        <StatCard
          label="Rewards redeemed"
          value={loading ? "" : percent(redemption, 0)}
          hint={loading ? "" : `${count(cur?.rewardsRedeemed)} of ${count(cur?.rewardsIssued)} issued in this window`}
          trend={cur && prev ? change(redemption, previousRedemption) : null}
          icon={Award}
          loading={loading}
        />
        <StatCard
          label="Discount given"
          value={loading ? "" : nairaCompact(cur?.discount)}
          hint={loading ? "" : `${nairaCompact(data?.discountTotal)} all time, through reward coupons`}
          trend={cur && prev ? change(cur.discount, prev.discount) : null}
          icon={Wallet}
          loading={loading}
        />
        <StatCard
          label="Customers with badges"
          value={loading ? "" : count(data?.customersWithBadges)}
          hint="Hold at least one badge, all time"
          icon={Users}
          loading={loading}
        />
        <StatCard
          label="Badges in the catalogue"
          value={loading ? "" : count(data?.badges)}
          hint="What customers can earn today"
          icon={Trophy}
          loading={loading}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Unlocks over time" subtitle={`Per day, ${range.label}`} height={280} loading={loading} empty={!daily.some((d) => d.count)}>
            <TrendChart data={daily} xKey="date" kind="area" xFormat={range.xf} series={[{ key: "count", label: "Unlocks", format: "count" }]} yFormat="count" />
          </ChartCard>
        </div>
        <RewardRules
          tiers={data?.rewardPercentByTier}
          cap={data?.rewardMaxDiscount}
          validityDays={data?.rewardValidityDays}
          loading={loading}
        />
      </div>

      <MostUnlocked rows={data?.byBadge ?? []} loading={loading} windowLabel={range.label} allTime={range.value.all} />
    </div>
  );
}

/** The three tiers as a ladder, so what a badge pays is obvious at a glance. */
function RewardRules({ tiers, cap, validityDays, loading }: { tiers?: Record<string, number>; cap?: number; validityDays?: number; loading: boolean }) {
  const ladder = [
    { tier: 3, tone: "bg-brand text-brand-ink", label: "Tier 3", hint: "The hardest to earn, so they pay the most" },
    { tier: 2, tone: "bg-info-soft text-info", label: "Tier 2", hint: "Milestones a regular customer reaches" },
    { tier: 1, tone: "bg-surface text-ink-muted", label: "Tier 1", hint: "First steps, earned early on" },
  ];
  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader title="What a badge pays" subtitle="A one-time coupon on the next delivery" />
      <div className="flex flex-1 flex-col justify-between gap-4 px-5 pb-5 pt-3">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <ul className="space-y-2">
            {ladder.map((step) => (
              <li key={step.tier} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black", step.tone)}>{step.tier}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">{step.label} badges</span>
                  <span className="block text-xs text-ink-muted">{step.hint}</span>
                </span>
                <span className="text-xl font-black tabular-nums text-ink">{tiers?.[String(step.tier)] ?? 0}%</span>
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-surface px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Cap per reward</p>
            <p className="mt-0.5 text-base font-black text-ink">{loading ? "" : naira(cap)}</p>
          </div>
          <div className="rounded-xl bg-surface px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Valid for</p>
            <p className="mt-0.5 text-base font-black text-ink">{loading ? "" : `${count(validityDays)} days`}</p>
          </div>
        </div>
        <p className="text-[11px] text-ink-faint">Rules live in the backend catalogue and apply to new unlocks only.</p>
      </div>
    </Panel>
  );
}

/**
 * Which badges customers actually reach. Ranked by unlocks in the window with
 * a bar relative to the top badge, the change against the window before, how
 * many of those rewards got used, and the lifetime total for context.
 */
function MostUnlocked({ rows, loading, windowLabel, allTime }: { rows: AchievementBadgeRollup[]; loading: boolean; windowLabel: string; allTime?: boolean }) {
  const active = rows.filter((row) => row.unlocks > 0);
  const quiet = rows.filter((row) => row.unlocks === 0);
  const top = active[0]?.unlocks || 1;
  const totalUnlocks = active.reduce((sum, row) => sum + row.unlocks, 0);

  return (
    <Panel>
      <PanelHeader
        title="Most unlocked badges"
        subtitle={loading ? "" : active.length ? `${count(totalUnlocks)} unlocks across ${count(active.length)} badges, ${windowLabel}` : `No badge was unlocked ${windowLabel}`}
        action={
          <Link href="/achievements?tab=badges" className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline">
            Catalogue <ChevronRight size={13} />
          </Link>
        }
      />
      <div className="px-5 pb-5 pt-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !active.length ? (
          <EmptyState compact icon={Medal} title="Nothing unlocked in this window" description="Widen the window, or check back once customers complete more deliveries." />
        ) : (
          <ol className="space-y-2">
            {active.map((row, index) => {
              const change = trend(row.unlocks, row.previousUnlocks);
              void change;
              const usage = row.unlocks ? Math.round((row.rewardsRedeemed / row.unlocks) * 100) : 0;
              return (
                <li key={row.key}>
                  <Link
                    href={`/achievements?tab=unlocks&key=${row.key}`}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-line p-3 transition-colors hover:bg-surface sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-4"
                  >
                    <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", TIER_CHIP[row.tier] ?? TIER_CHIP[1])} aria-hidden>
                      <Medal size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="truncate text-sm font-bold text-ink">{row.title}</span>
                        <TierBadge tier={row.tier} percent={0} compact />
                      </span>
                      <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-surface">
                        <span className={cx("block h-full rounded-full", index === 0 ? "bg-brand" : "bg-brand/50")} style={{ width: `${Math.max(3, (row.unlocks / top) * 100)}%` }} />
                      </span>
                      <span className="mt-1 block text-[11px] text-ink-faint">
                        {CATEGORY_LABEL[row.category] ?? row.category} · {count(row.lifetime)} all time
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-xl font-black leading-none tabular-nums text-ink">{count(row.unlocks)}</span>
                      <span className="block text-[11px] text-ink-faint">unlocks</span>
                    </span>
                    <span className="hidden text-right sm:block">
                      <span className="block text-sm font-bold tabular-nums text-ink">{usage}%</span>
                      <span className="block text-[11px] text-ink-faint">reward used</span>
                    </span>
                    <span className="hidden w-16 justify-end sm:flex">
                      {allTime ? null : change == null ? (
                        <Badge tone="brand">New</Badge>
                      ) : (
                        <Badge tone={change > 0 ? "success" : change < 0 ? "danger" : "neutral"}>
                          {change > 0 ? "+" : ""}
                          {change}%
                        </Badge>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
        {!loading && quiet.length ? (
          <p className="mt-3 text-[11px] text-ink-faint">
            Not unlocked in this window: {quiet.map((row) => row.title).join(", ")}.
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
