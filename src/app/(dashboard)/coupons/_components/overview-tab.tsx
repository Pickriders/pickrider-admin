"use client";

import { Award, BadgePercent, CalendarClock, ChevronRight, Receipt, Ticket, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge, ChartCard, EmptyState, Panel, PanelHeader, RangeTabs, Skeleton, StatCard, StatGrid, TrendChart, cx } from "@/components/kit";
import { count, naira, nairaCompact, percent, trend } from "@/lib/admin/format";
import { useCouponsSummary } from "@/lib/admin/hooks";

import { useStatsRange } from "../../dashboard/_components/use-stats-range";

/**
 * Programme health in the chosen window: what coupons cost, how often they are
 * used, which ones customers actually reach for, and what is live or ending
 * soon. Every windowed tile compares with the window before.
 */
export function OverviewTab() {
  const router = useRouter();
  const range = useStatsRange(30);
  const { data, isPending } = useCouponsSummary(range.query);
  const cur = data?.current;
  const prev = data?.previous;
  const loading = isPending && !data;
  const redemptionRate = data?.rewardCoupons ? (data.rewardCouponsRedeemed / data.rewardCoupons) * 100 : 0;
  // "All time" has no window before it to compare with.
  const change = (current: number, previous: number) => (range.value.all ? null : trend(current, previous));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">{data ? `${count(data.active)} coupons live out of ${count(data.total)} created` : "Loading the programme"}</p>
        <RangeTabs value={range.value} onChange={range.setValue} />
      </div>

      <StatGrid columns={3}>
        <StatCard
          label="Discount given"
          value={loading ? "" : nairaCompact(cur?.discount)}
          hint={loading ? "" : `${nairaCompact(data?.discountTotal)} all time`}
          trend={cur && prev ? change(cur.discount, prev.discount) : null}
          spark={(data?.daily ?? []).map((d) => ({ value: d.discount }))}
          icon={Wallet}
          tone="brand"
          loading={loading}
        />
        <StatCard
          label="Redemptions"
          value={loading ? "" : count(cur?.redemptions)}
          hint={loading ? "" : `${count(data?.redemptionsTotal)} all time`}
          trend={cur && prev ? change(cur.redemptions, prev.redemptions) : null}
          spark={(data?.daily ?? []).map((d) => ({ value: d.count }))}
          icon={Receipt}
          loading={loading}
        />
        <StatCard
          label="Coupons created"
          value={loading ? "" : count(cur?.newCoupons)}
          hint={loading ? "" : `${count(data?.active)} live right now`}
          trend={cur && prev ? change(cur.newCoupons, prev.newCoupons) : null}
          icon={Ticket}
          loading={loading}
          onClick={() => router.push("/coupons?tab=coupons&lifecycle=ACTIVE")}
        />
        <StatCard
          label="Expiring within 7 days"
          value={loading ? "" : count(data?.expiring7d)}
          hint="Still active, ending soon"
          icon={CalendarClock}
          loading={loading}
          onClick={() => router.push("/coupons?tab=coupons&lifecycle=ACTIVE&sortBy=expirationDate&order=ASC")}
        />
        <StatCard
          label="Badge rewards issued"
          value={loading ? "" : count(data?.rewardCoupons)}
          hint="Issued automatically when a customer unlocks a badge"
          icon={Award}
          loading={loading}
          onClick={() => router.push("/coupons?tab=coupons&rewards=true")}
        />
        <StatCard
          label="Reward redemption"
          value={loading ? "" : percent(redemptionRate, 0)}
          hint={loading ? "" : `${count(data?.rewardCouponsRedeemed)} of ${count(data?.rewardCoupons)} used, all time`}
          icon={BadgePercent}
          loading={loading}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Redemptions" subtitle={`Per day, ${range.label}. Discount given is on the tile above.`} height={280} loading={loading} empty={!data?.daily.some((d) => d.count)}>
            <TrendChart data={data?.daily ?? []} xKey="date" kind="area" xFormat={range.xf} series={[{ key: "count", label: "Redemptions", format: "count" }]} yFormat="count" />
          </ChartCard>
        </div>
        <Panel className="flex h-full flex-col">
          <PanelHeader
            title="Most used coupons"
            subtitle={`By redemptions, ${range.label}`}
            action={
              <Link href="/coupons?tab=coupons" className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline">
                All <ChevronRight size={13} />
              </Link>
            }
          />
          <div className="flex-1 px-5 pb-5 pt-3">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.topCoupons.length ? (
              <ol className="space-y-2">
                {data.topCoupons.map((row, index) => {
                  const top = data.topCoupons[0]?.count || 1;
                  return (
                    <li key={row.code}>
                      <Link href={`/coupons?tab=coupons&search=${row.code}`} className="flex items-center gap-3 rounded-2xl border border-line p-3 transition-colors hover:bg-surface">
                        <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black", index === 0 ? "bg-brand text-brand-ink" : "bg-surface text-ink-muted")}>{index + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="truncate font-mono text-xs font-bold text-ink">{row.code}</span>
                            <Badge tone="brand">{count(row.count)}×</Badge>
                          </span>
                          <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-surface">
                            <span className={cx("block h-full rounded-full", index === 0 ? "bg-brand" : "bg-brand/50")} style={{ width: `${Math.max(4, (row.count / top) * 100)}%` }} />
                          </span>
                          <span className="mt-1 block truncate text-[11px] text-ink-faint">
                            {row.name || "No name"} · {naira(row.discount)} given
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <EmptyState compact icon={Ticket} title="No redemptions in this window" description="Coupons appear here once customers apply them at checkout." />
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
