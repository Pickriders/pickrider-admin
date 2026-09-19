"use client";

import { Medal, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge, EmptyState, ErrorState, Input, Panel, Select, Skeleton, Tabs, cx } from "@/components/kit";
import type { AchievementCategory, AchievementDefinition } from "@/lib/admin/api";
import { count, naira, percent } from "@/lib/admin/format";
import { useAchievementCatalogue } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { CATEGORY_LABEL, TIER_CHIP, TierBadge } from "./shared";

/** The catalogue as cards, grouped the way the app shows them, each with its own unlock/reward numbers. */
export function BadgesTab() {
  const { data, isPending, error, refetch } = useAchievementCatalogue();
  const [category, setCategory] = useState<AchievementCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"popular" | "recent" | "tier" | "name">("popular");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const list = (data ?? []).filter(
      (row) => (category === "ALL" || row.category === category) && (!needle || row.title.toLowerCase().includes(needle) || row.description.toLowerCase().includes(needle)),
    );
    const by: Record<typeof sort, (a: AchievementDefinition, b: AchievementDefinition) => number> = {
      popular: (a, b) => b.unlockedCount - a.unlockedCount,
      recent: (a, b) => b.unlocked30d - a.unlocked30d,
      tier: (a, b) => b.tier - a.tier || b.unlockedCount - a.unlockedCount,
      name: (a, b) => a.title.localeCompare(b.title),
    };
    return [...list].sort(by[sort]);
  }, [data, category, search, sort]);
  const topUnlocks = useMemo(() => Math.max(1, ...(data ?? []).map((row) => row.unlockedCount)), [data]);
  const counts = useMemo(() => {
    const out: Partial<Record<AchievementCategory, number>> = {};
    for (const row of data ?? []) out[row.category] = (out[row.category] ?? 0) + 1;
    return out;
  }, [data]);

  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-4">
      <Tabs
        value={category}
        onChange={setCategory}
        items={[
          { id: "ALL" as const, label: "All", count: data?.length },
          ...(Object.keys(CATEGORY_LABEL) as AchievementCategory[]).map((id) => ({
            id,
            label: CATEGORY_LABEL[id],
            count: counts[id],
          })),
        ]}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input left={<Search size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search badges" aria-label="Search badges" />
        </div>
        <span className="block w-full sm:w-48">
          <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort badges">
            <option value="popular">Most unlocked</option>
            <option value="recent">Most unlocked, 30 days</option>
            <option value="tier">Highest tier first</option>
            <option value="name">Name</option>
          </Select>
        </span>
      </div>
      {isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : rows.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <BadgeCard key={row.key} row={row} share={row.unlockedCount / topUnlocks} top={row.unlockedCount > 0 && row.unlockedCount === topUnlocks} />
          ))}
        </div>
      ) : (
        <EmptyState title={search ? "No badges match" : "No badges in this category"} description={search ? "Try another word." : undefined} />
      )}
    </div>
  );
}

function BadgeCard({ row, share, top }: { row: AchievementDefinition; share: number; top: boolean }) {
  const redemption = row.rewardsIssued ? (row.rewardsRedeemed / row.rewardsIssued) * 100 : 0;
  return (
    <Panel className={cx("flex flex-col p-5", top && "border-brand/40")}>
      <div className="flex items-start gap-3">
        <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", TIER_CHIP[row.tier] ?? TIER_CHIP[1])} aria-hidden>
          <Medal size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-black tracking-tight text-ink">{row.title}</h3>
            <TierBadge tier={row.tier} percent={row.rewardPercent} />
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">{row.description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
        <Badge tone="neutral">{CATEGORY_LABEL[row.category]}</Badge>
        {top ? <Badge tone="brand">Most unlocked</Badge> : null}
        <span>
          Target: {count(row.target)} {row.unit}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface" title="Unlocks relative to the most unlocked badge">
        <div className={cx("h-full rounded-full", top ? "bg-brand" : "bg-brand/50")} style={{ width: `${Math.max(2, share * 100)}%` }} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
        <Stat
          label="Unlocked"
          value={count(row.unlockedCount)}
          hint={`+${count(row.unlocked30d)} · 30d`}
          href={`/achievements?tab=unlocks&key=${row.key}`}
        />
        <Stat
          label="Reward used"
          value={percent(redemption, 0)}
          hint={`${count(row.rewardsRedeemed)} of ${count(row.rewardsIssued)}`}
          href={`/achievements?tab=unlocks&key=${row.key}&reward=redeemed`}
        />
        <Stat label="Discount given" value={naira(row.discountTotal)} />
      </dl>
    </Panel>
  );
}

function Stat({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className={cx("mt-0.5 text-base font-black tracking-tight text-ink", href && "group-hover:underline")}>
        {value}
      </dd>
      {hint ? <dd className="text-[11px] text-ink-muted">{hint}</dd> : null}
    </>
  );
  return href ? (
    <Link href={href} className="group block min-w-0">
      {body}
    </Link>
  ) : (
    <div className="min-w-0">{body}</div>
  );
}
