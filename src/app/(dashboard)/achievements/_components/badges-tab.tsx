"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge, EmptyState, ErrorState, Panel, Skeleton, Tabs, cx } from "@/components/kit";
import type { AchievementCategory, AchievementDefinition } from "@/lib/admin/api";
import { count, naira, percent } from "@/lib/admin/format";
import { useAchievementCatalogue } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { CATEGORY_LABEL, TierBadge } from "./shared";

/** The catalogue as cards, grouped the way the app shows them, each with its own unlock/reward numbers. */
export function BadgesTab() {
  const { data, isPending, error, refetch } = useAchievementCatalogue();
  const [category, setCategory] = useState<AchievementCategory | "ALL">("ALL");

  const rows = useMemo(
    () => (data ?? []).filter((row) => category === "ALL" || row.category === category),
    [data, category],
  );
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
      {isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : rows.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <BadgeCard key={row.key} row={row} />
          ))}
        </div>
      ) : (
        <EmptyState title="No badges in this category" />
      )}
    </div>
  );
}

function BadgeCard({ row }: { row: AchievementDefinition }) {
  const redemption = row.rewardsIssued ? (row.rewardsRedeemed / row.rewardsIssued) * 100 : 0;
  return (
    <Panel className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black tracking-tight text-ink">{row.title}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">{row.description}</p>
        </div>
        <TierBadge tier={row.tier} percent={row.rewardPercent} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
        <Badge tone="neutral">{CATEGORY_LABEL[row.category]}</Badge>
        <span>
          Target: {count(row.target)} {row.unit}
        </span>
        <span className="font-mono text-ink-faint">{row.key}</span>
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
