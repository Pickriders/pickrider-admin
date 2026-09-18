"use client";

import { Award, BadgePercent, CalendarClock, Receipt, Ticket, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge, ChartCard, Panel, PanelHeader, StatCard, StatGrid, TrendChart } from "@/components/kit";
import { count, naira, percent } from "@/lib/admin/format";
import { useCouponsSummary } from "@/lib/admin/hooks";

/** Programme health: how many coupons are live, how much they are costing, which ones customers actually use. */
export function OverviewTab() {
  const router = useRouter();
  const { data, isPending } = useCouponsSummary();
  const redemptionRate = data?.rewardCoupons ? (data.rewardCouponsRedeemed / data.rewardCoupons) * 100 : 0;

  return (
    <div className="space-y-5">
      <StatGrid columns={6}>
        <StatCard
          label="Discount given · 30d"
          value={naira(data?.discount30d)}
          hint={`${naira(data?.discountTotal)} all time`}
          icon={Wallet}
          tone="brand"
          loading={isPending}
        />
        <StatCard
          label="Redemptions · 30d"
          value={count(data?.redemptions30d)}
          hint={`${count(data?.redemptionsTotal)} all time`}
          icon={Receipt}
          loading={isPending}
        />
        <StatCard
          label="Active coupons"
          value={count(data?.active)}
          hint={`${count(data?.total)} created in total`}
          icon={Ticket}
          loading={isPending}
          onClick={() => router.push("/coupons?tab=coupons&lifecycle=ACTIVE")}
        />
        <StatCard
          label="Expiring · 7d"
          value={count(data?.expiring7d)}
          hint="Still active, ending soon"
          icon={CalendarClock}
          loading={isPending}
          onClick={() => router.push("/coupons?tab=coupons&lifecycle=ACTIVE&sortBy=expirationDate&order=ASC")}
        />
        <StatCard
          label="Badge rewards issued"
          value={count(data?.rewardCoupons)}
          hint="Auto-issued when a customer unlocks a badge"
          icon={Award}
          loading={isPending}
          onClick={() => router.push("/coupons?tab=coupons&rewards=true")}
        />
        <StatCard
          label="Reward redemption"
          value={percent(redemptionRate, 0)}
          hint={`${count(data?.rewardCouponsRedeemed)} of ${count(data?.rewardCoupons)} used`}
          icon={BadgePercent}
          loading={isPending}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Redemptions and discount, last 30 days" loading={isPending} empty={!data?.daily.length}>
            <TrendChart
              data={data?.daily ?? []}
              xKey="date"
              kind="area"
              series={[
                { key: "count", label: "Redemptions", format: "count" },
                { key: "discount", label: "Discount", format: "naira", color: "hsl(var(--chart-2))" },
              ]}
              yFormat="count"
              xFormat={(value) => value.slice(5)}
            />
          </ChartCard>
        </div>
        <Panel>
          <PanelHeader title="Most used · 30d" subtitle="By redemptions" />
          <div className="px-6 pb-5">
            {isPending ? (
              <p className="text-xs text-ink-faint">Loading…</p>
            ) : data?.topCoupons.length ? (
              <ol className="divide-y divide-line">
                {data.topCoupons.map((row, index) => (
                  <li key={row.code} className="flex items-center gap-3 py-2.5">
                    <span className="w-5 text-xs font-bold text-ink-faint">{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`/coupons?tab=coupons&search=${row.code}`}
                        className="block truncate font-mono text-xs font-bold text-ink hover:underline"
                      >
                        {row.code}
                      </Link>
                      <span className="block truncate text-[11px] text-ink-muted">{row.name || "—"}</span>
                    </span>
                    <span className="text-right">
                      <Badge tone="brand">{count(row.count)}×</Badge>
                      <span className="mt-0.5 block text-[11px] text-ink-muted">{naira(row.discount)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-ink-faint">No redemptions in the last 30 days.</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
