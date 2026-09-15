"use client";

import { ArrowLeft, CheckCircle2, Package, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";

import { Badge, ChartCard, ErrorState, PageHeader, RangeTabs, Skeleton, StatCard, StatGrid, Tabs, TrendChart, presetRange, rangeToQuery, type RangeValue } from "@/components/kit";
import { UserActions } from "@/components/users/user-actions";
import { ActivityFeed, MoneyByPurpose, UserHeader, UserOrdersTable, UserTransactionsTable, bucketLabel } from "@/components/users/user-panels";
import { fullName, naira, count, percent, trend } from "@/lib/admin/format";
import { useSeries, useUserOverview } from "@/lib/admin/hooks";
import { useTabParam } from "@/lib/admin/url-state";

/**
 * One customer: identity, wallet, how they order over the picked window,
 * their orders and wallet history, and the account actions.
 */
const TABS = ["orders", "transactions", "activity"] as const;
type Tab = (typeof TABS)[number];

function CustomerDetail({ id }: { id: string }) {
  const [range, setRange] = useState<RangeValue>(() => presetRange(30));
  const rangeQuery = useMemo(() => rangeToQuery(range), [range]);
  const overview = useUserOverview(id, rangeQuery);
  const series = useSeries({ ...rangeQuery, userId: id });
  const [tab, setTab] = useTabParam<Tab>("orders", TABS);

  const data = overview.data;
  const user = data?.user;
  const current = data?.asCustomer.current;
  const previous = data?.asCustomer.previous;
  const lifetime = data?.asCustomer.lifetime;
  const loading = overview.isLoading;
  const windowLabel = range.all ? "all time" : range.preset ? `last ${range.preset} days` : "this range";

  if (overview.error && !data) {
    return (
      <div>
        <PageHeader breadcrumb={<Link href="/customers">Customers</Link>} title="Customer" />
        <ErrorState message="Could not load this customer." onRetry={() => overview.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={
          <Link href="/customers" className="inline-flex items-center gap-1 hover:text-ink">
            <ArrowLeft size={12} /> Customers
          </Link>
        }
        title={user ? fullName(user) || "Customer" : <Skeleton className="h-8 w-56" />}
        description={lifetime ? `${count(lifetime.orders)} orders lifetime · ${naira(lifetime.completedVolume)} spent on completed orders` : undefined}
        actions={<RangeTabs value={range} onChange={setRange} />}
      />

      <UserHeader
        user={user}
        loading={loading}
        badges={data?.business ? <Badge tone="info">Business: {data.business.name}</Badge> : null}
        actions={user ? <UserActions user={user} wallet={data?.wallet} showRefund /> : null}
      />

      <StatGrid columns={5}>
        <StatCard
          label={`Orders, ${windowLabel}`}
          value={count(current?.orders)}
          icon={Package}
          loading={loading}
          trend={current && previous ? trend(current.orders, previous.orders) : undefined}
          hint={current ? `${count(current.completed)} completed · ${count(current.cancelled)} cancelled` : undefined}
        />
        <StatCard
          label={`Spent, ${windowLabel}`}
          value={naira(current?.completedVolume)}
          icon={Receipt}
          loading={loading}
          trend={current && previous ? trend(current.completedVolume, previous.completedVolume) : undefined}
          hint={current ? `${naira(current.volume)} across all orders placed` : undefined}
        />
        <StatCard
          label="Completion rate"
          value={percent(current?.completionRate)}
          icon={CheckCircle2}
          loading={loading}
          hint={lifetime ? `${percent(lifetime.completionRate)} lifetime` : undefined}
        />
        <StatCard
          label="Average order"
          value={naira(current?.averageOrderValue)}
          loading={loading}
          hint={lifetime ? `${naira(lifetime.averageOrderValue)} lifetime` : undefined}
        />
        <StatCard
          label="Wallet balance"
          value={naira(data?.wallet?.balance)}
          icon={Wallet}
          tone="brand"
          loading={loading}
          hint={data?.wallet ? `${data.wallet.currency ?? "NGN"} wallet${data.wallet.status ? ` · ${String(data.wallet.status).toLowerCase()}` : ""}` : "No wallet yet"}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="Orders over time"
            subtitle="Placed, completed and cancelled per bucket"
            loading={series.isLoading}
            empty={!series.data?.points.length}
            height={260}
          >
            <TrendChart
              data={series.data?.points ?? []}
              xKey="bucket"
              xFormat={bucketLabel(series.data?.bucket)}
              series={[
                { key: "orders", label: "Placed" },
                { key: "completed", label: "Completed" },
                { key: "cancelled", label: "Cancelled" },
              ]}
            />
          </ChartCard>
        </div>
        <ChartCard title="Spend over time" subtitle="Order value per bucket" loading={series.isLoading} empty={!series.data?.points.length} height={260}>
          <TrendChart data={series.data?.points ?? []} xKey="bucket" xFormat={bucketLabel(series.data?.bucket)} yFormat="naira" series={[{ key: "volume", label: "Spend", format: "naira" }]} />
        </ChartCard>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "orders", label: "Orders", count: lifetime?.orders },
          { id: "transactions", label: "Wallet history" },
          { id: "activity", label: "Activity" },
        ]}
      />

      {tab === "orders" ? <UserOrdersTable userId={id} csvName={`customer-${id}-orders`} /> : null}
      {tab === "transactions" ? (
        <div className="space-y-4">
          <MoneyByPurpose data={data?.transactions} loading={loading} />
          <UserTransactionsTable userId={id} csvName={`customer-${id}-transactions`} />
        </div>
      ) : null}
      {tab === "activity" ? <ActivityFeed user={user} includeOrders enabled={tab === "activity"} /> : null}
    </div>
  );
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CustomerDetail id={params.id} />
    </Suspense>
  );
}
