"use client";

import { ArrowRight, BadgeCheck, Ban, PackageX, Repeat, ShoppingBag, Smartphone, Sparkles, UserPlus, Users, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Avatar, Badge, ChartCard, DonutChart, EmptyState, Panel, PanelHeader, RangeTabs, Skeleton, StatCard, StatGrid, TrendChart, cx, statusTone } from "@/components/kit";
import { phoneLabel } from "@/components/users/user-actions";
import type { CustomerLeader } from "@/lib/admin/api";
import { ago, count, fullName, naira, nairaCompact, percent, statusLabel, trend } from "@/lib/admin/format";
import { useCustomersOverview } from "@/lib/admin/hooks";

import { useStatsRange } from "../../dashboard/_components/use-stats-range";

/**
 * The customer base in a window: how many joined, how many actually used the
 * app and ordered, how loyal they are, what they cost us in cancellations, and
 * the people behind the numbers. Every windowed tile compares with the window
 * before; "All" has nothing to compare with so trends are hidden.
 */
export function CustomersOverviewTab() {
  const range = useStatsRange(30);
  const overview = useCustomersOverview({ ...range.query, bucket: range.bucket });
  const data = overview.data;
  const cur = data?.current;
  const prev = data?.previous;
  const loading = overview.isPending && !data;
  const change = (current: number, previous: number) => (range.value.all ? null : trend(current, previous));

  const series = useMemo(() => data?.series ?? [], [data?.series]);
  const returningShare = cur?.active ? Math.round((cur.returning / cur.active) * 100) : 0;
  const previousReturningShare = prev?.active ? Math.round((prev.returning / prev.active) * 100) : 0;
  const customerCancelRate = cur?.orders ? (cur.cancelledByCustomer / cur.orders) * 100 : 0;
  const previousCustomerCancelRate = prev?.orders ? (prev.cancelledByCustomer / prev.orders) * 100 : 0;
  const activeShare = data?.base.total ? Math.round(((cur?.active ?? 0) / data.base.total) * 100) : 0;

  const frequency = useMemo(() => {
    const f = data?.frequency;
    return [
      { name: "One order", value: f?.one ?? 0, color: "hsl(var(--chart-3))" },
      { name: "2 to 3 orders", value: f?.twoToThree ?? 0, color: "hsl(var(--chart-1))" },
      { name: "4 to 9 orders", value: f?.fourToNine ?? 0, color: "hsl(var(--chart-2))" },
      { name: "10 or more", value: f?.tenPlus ?? 0, color: "hsl(var(--chart-4))" },
    ];
  }, [data?.frequency]);
  const frequencyTotal = frequency.reduce((sum, item) => sum + item.value, 0);

  const statuses = useMemo(() => {
    const by = data?.base.byStatus ?? {};
    return ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"].map((key) => ({ key, count: by[key] ?? 0 }));
  }, [data?.base.byStatus]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">{data ? `${count(data.base.total)} customers on the platform, ${count(data.base.everOrdered)} have ordered at least once` : "Loading the customer base"}</p>
        <RangeTabs value={range.value} onChange={range.setValue} />
      </div>

      {/* Who used the app */}
      <StatGrid columns={4}>
        <StatCard
          tone="brand"
          label="Active customers"
          value={loading ? "" : count(cur?.active)}
          hint={loading ? "" : `Placed an order, ${activeShare}% of the base`}
          trend={cur && prev ? change(cur.active, prev.active) : null}
          spark={series.map((p) => ({ value: p.activeCustomers }))}
          icon={Users}
          loading={loading}
        />
        <StatCard
          label="Opened the app"
          value={loading ? "" : count(cur?.signedIn)}
          hint={loading ? "" : `Signed in at least once, ${range.label}`}
          trend={cur && prev ? change(cur.signedIn, prev.signedIn) : null}
          icon={Smartphone}
          loading={loading}
        />
        <StatCard
          label="New customers"
          value={loading ? "" : count(cur?.newCustomers)}
          hint={loading ? "" : `${count(cur?.firstTimers)} placed their first ever order`}
          trend={cur && prev ? change(cur.newCustomers, prev.newCustomers) : null}
          spark={series.map((p) => ({ value: p.newCustomers }))}
          icon={UserPlus}
          loading={loading}
        />
        <StatCard
          label="Returning"
          value={loading ? "" : `${returningShare}%`}
          hint={loading ? "" : `${count(cur?.returning)} of the active customers had ordered before`}
          trend={cur && prev ? change(returningShare, previousReturningShare) : null}
          icon={Repeat}
          loading={loading}
        />
      </StatGrid>

      {/* What they did */}
      <StatGrid columns={4}>
        <StatCard
          label="Orders"
          value={loading ? "" : count(cur?.orders)}
          hint={loading ? "" : `${count(cur?.completed)} completed, ${cur?.ordersPerActive ?? 0} per active customer`}
          trend={cur && prev ? change(cur.orders, prev.orders) : null}
          spark={series.map((p) => ({ value: p.orders }))}
          icon={ShoppingBag}
          loading={loading}
        />
        <StatCard
          label="Spent"
          value={loading ? "" : nairaCompact(cur?.spent)}
          hint={loading ? "" : `${naira(cur?.spendPerActive)} per active customer`}
          trend={cur && prev ? change(cur.spent, prev.spent) : null}
          icon={Wallet}
          loading={loading}
        />
        <StatCard
          label="Cancelled by customers"
          value={loading ? "" : count(cur?.cancelledByCustomer)}
          hint={loading ? "" : `${percent(customerCancelRate)} of orders, ${count(cur?.cancelled)} cancelled in all`}
          trend={cur && prev ? change(-customerCancelRate, -previousCustomerCancelRate) : null}
          trendLabel="fewer is up"
          icon={PackageX}
          loading={loading}
        />
        <StatCard
          label="Phone verified"
          value={loading ? "" : data?.base.total ? `${Math.round(((data.base.phoneVerified ?? 0) / data.base.total) * 100)}%` : "0%"}
          hint={loading ? "" : `${count(data?.base.phoneVerified)} of ${count(data?.base.total)} customers, all time`}
          icon={BadgeCheck}
          loading={loading}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Customers over time" subtitle={`Active and new customers per ${range.bucket}, ${range.label}`} height={300} loading={loading} empty={!series.some((p) => p.activeCustomers || p.newCustomers)}>
            <TrendChart
              data={series}
              xKey="bucket"
              kind="area"
              xFormat={range.xf}
              yFormat="count"
              series={[
                { key: "activeCustomers", label: "Active (ordered)", format: "count" },
                { key: "newCustomers", label: "New signups", format: "count", color: "hsl(var(--chart-2))" },
              ]}
            />
          </ChartCard>
        </div>
        <ChartCard title="How often they order" subtitle={loading ? "" : `${count(frequencyTotal)} active customers, ${range.label}`} height={300} loading={loading} empty={!frequencyTotal}>
          <div className="flex h-full flex-col">
            <div className="min-h-0 flex-1">
              <DonutChart data={frequency} format="count" centerValue={count(frequencyTotal)} centerLabel="customers" />
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {frequency.map((item) => (
                <li key={item.name} className="flex items-center gap-1.5 text-[11px]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-ink-muted">{item.name}</span>
                  <span className="ml-auto font-bold tabular-nums text-ink">{frequencyTotal ? Math.round((item.value / frequencyTotal) * 100) : 0}%</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Orders and cancellations" subtitle={`Per ${range.bucket}, ${range.label}`} height={260} loading={loading} empty={!series.some((p) => p.orders)}>
            <TrendChart
              data={series}
              xKey="bucket"
              kind="line"
              xFormat={range.xf}
              yFormat="count"
              series={[
                { key: "orders", label: "Orders", format: "count" },
                { key: "cancelled", label: "Cancelled", format: "count", color: "hsl(var(--chart-6))" },
              ]}
            />
          </ChartCard>
        </div>
        <Panel className="flex h-full flex-col">
          <PanelHeader title="Account status" subtitle="The whole base, right now" />
          <div className="flex flex-1 flex-col justify-center gap-3 px-5 pb-5 pt-3">
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface">
                  {statuses.map((row) => {
                    const width = data?.base.total ? (row.count / data.base.total) * 100 : 0;
                    return width ? <span key={row.key} className={cx("h-full", STATUS_BAR[row.key])} style={{ width: `${width}%` }} title={`${statusLabel(row.key)}: ${count(row.count)}`} /> : null;
                  })}
                </div>
                <ul className="space-y-1.5">
                  {statuses.map((row) => (
                    <li key={row.key}>
                      <Link href={`/customers?tab=list&status=${row.key}`} className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface">
                        <span className={cx("h-2.5 w-2.5 rounded-full", STATUS_BAR[row.key])} />
                        <span className="flex-1 text-sm font-semibold text-ink">{statusLabel(row.key)}</span>
                        <span className="text-sm font-black tabular-nums text-ink">{count(row.count)}</span>
                        <span className="w-10 text-right text-xs tabular-nums text-ink-faint">{data?.base.total ? Math.round((row.count / data.base.total) * 100) : 0}%</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Leaderboard title="Biggest spenders" subtitle={`Completed orders, ${range.label}`} icon={Sparkles} rows={data?.topSpenders ?? []} loading={loading} metric={(row) => nairaCompact(row.spent)} metricLabel="spent" detail={(row) => `${count(row.orders)} orders`} tone="brand" />
        <Leaderboard title="Most orders" subtitle={`Placed, ${range.label}`} icon={ShoppingBag} rows={data?.mostOrders ?? []} loading={loading} metric={(row) => count(row.orders)} metricLabel="orders" detail={(row) => `${count(row.completed)} completed, ${nairaCompact(row.spent)} spent`} tone="info" />
        <Leaderboard
          title="Most cancellations"
          subtitle={`Cancelled orders, ${range.label}`}
          icon={Ban}
          rows={data?.mostCancelled ?? []}
          loading={loading}
          metric={(row) => count(row.cancelled)}
          metricLabel="cancelled"
          detail={(row) => `${count(row.cancelledByCustomer)} by them, ${row.orders ? Math.round((row.cancelled / row.orders) * 100) : 0}% of ${count(row.orders)} orders`}
          tone="danger"
          emptyTitle="No cancellations"
        />
      </div>
    </div>
  );
}

const STATUS_BAR: Record<string, string> = { ACTIVE: "bg-brand", INACTIVE: "bg-line-strong", SUSPENDED: "bg-warning", BANNED: "bg-danger" };

function Leaderboard({
  title,
  subtitle,
  icon: Icon,
  rows,
  loading,
  metric,
  metricLabel,
  detail,
  tone,
  emptyTitle = "Nothing in this window",
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  rows: CustomerLeader[];
  loading: boolean;
  metric: (row: CustomerLeader) => string;
  metricLabel: string;
  detail: (row: CustomerLeader) => string;
  tone: "brand" | "info" | "danger";
  emptyTitle?: string;
}) {
  const chip = { brand: "bg-brand-soft text-brand-dark", info: "bg-info-soft text-info", danger: "bg-danger-soft text-danger" }[tone];
  const rank = { brand: "bg-brand text-brand-ink", info: "bg-info text-white", danger: "bg-danger text-white" }[tone];
  return (
    <Panel className="flex h-full flex-col">
      <div className="flex items-start gap-3 px-5 pt-5">
        <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", chip)}>
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold tracking-tight text-ink">{title}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 px-3 pb-3 pt-3">
        {loading ? (
          <div className="space-y-2 px-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !rows.length ? (
          <EmptyState compact icon={Icon} title={emptyTitle} />
        ) : (
          <ol className="divide-y divide-line">
            {rows.map((row, index) => {
              const name = fullName(row.user) || row.user?.email || "Customer";
              return (
                <li key={row.userId}>
                  <Link href={`/customers/${row.userId}`} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface">
                    <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-black", index === 0 ? rank : "bg-surface text-ink-muted")}>{index + 1}</span>
                    <Avatar src={row.user?.photo} name={name} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-ink group-hover:text-brand-dark">{name}</span>
                        {row.user?.status && row.user.status !== "ACTIVE" ? <Badge tone={statusTone(row.user.status)}>{statusLabel(row.user.status)}</Badge> : null}
                      </span>
                      <span className="block truncate text-[11px] text-ink-muted">
                        {phoneLabel(row.user?.phone) || row.user?.email || ""} · {detail(row)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-black tabular-nums text-ink">{metric(row)}</span>
                      <span className="block text-[11px] text-ink-faint">{metricLabel}</span>
                    </span>
                    <ArrowRight size={14} className="hidden shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 sm:block" />
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
        {!loading && rows.length ? <p className="mt-1 px-2 text-[11px] text-ink-faint">Last order {ago(rows[0].lastOrderAt)} for the top row.</p> : null}
      </div>
    </Panel>
  );
}
