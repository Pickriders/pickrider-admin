"use client";

import { ArrowLeft, Bike, Car, ExternalLink, Landmark, PauseCircle, ShieldCheck, Star, UserRound, Wallet, XCircle } from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";

import {
  Badge,
  ChartCard,
  EmptyState,
  ErrorState,
  KeyValue,
  LinkButton,
  PageHeader,
  Panel,
  PanelHeader,
  RangeTabs,
  Skeleton,
  StatCard,
  StatGrid,
  Tabs,
  TrendChart,
  presetRange,
  rangeToQuery,
  statusTone,
  type RangeValue,
} from "@/components/kit";
import { DispatchDialog, UserActions } from "@/components/users/user-actions";
import { ActivityFeed, LICENCE_LABEL, MoneyByPurpose, UserHeader, UserTransactionsTable, bucketLabel, licenceOf, licenceTone } from "@/components/users/user-panels";
import type { Vehicle } from "@/lib/admin/api";
import { count, fullName, maskAccount, naira, percent, statusLabel, trend, when } from "@/lib/admin/format";
import { useSeries, useUserOverview } from "@/lib/admin/hooks";
import { useTabParam } from "@/lib/admin/url-state";

/**
 * One rider: how they deliver over the picked window, lifetime totals,
 * rating, vehicles, wallet and settlement account, earnings and wallet
 * history, plus the dispatch pause and the shared account actions.
 *
 * The orders list has no rider filter, so per-order history as a rider is
 * not shown; the earnings tab (ORDER_EARNING transactions) is the closest
 * per-delivery record and lifetime totals come from the overview.
 */
const TABS = ["earnings", "transactions", "activity"] as const;
type Tab = (typeof TABS)[number];
const EARNING_PURPOSES = "ORDER_EARNING,ORDER_EARNING_SPLIT";

function RatingPanel({ reviews, loading }: { reviews: { average: number | null; count: number; distribution: number[] } | undefined; loading: boolean }) {
  const total = reviews?.count ?? 0;
  return (
    <Panel>
      <PanelHeader title="Rating" subtitle={total ? `${count(total)} review${total === 1 ? "" : "s"} from customers` : "No reviews yet"} />
      <div className="px-5 pb-5 pt-4">
        {loading ? (
          <Skeleton className="h-28 w-full" />
        ) : (
          <div className="flex items-start gap-5">
            <div className="shrink-0 text-center">
              <p className="text-4xl font-black tracking-tight text-ink">{reviews?.average != null ? reviews.average.toFixed(1) : "–"}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-faint">
                <Star size={12} className="text-warning" /> out of 5
              </p>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = reviews?.distribution?.[star - 1] ?? 0;
                const width = total ? Math.round((n / total) * 100) : 0;
                return (
                  <li key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-right font-semibold text-ink-muted">{star}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-warning" style={{ width: `${width}%` }} />
                    </div>
                    <span className="w-6 text-right tabular-nums text-ink-faint">{n}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
}

function VehiclesPanel({ vehicles, loading }: { vehicles: Vehicle[] | undefined; loading: boolean }) {
  return (
    <Panel>
      <PanelHeader title="Vehicles" subtitle={vehicles?.length ? `${vehicles.length} on this rider` : "What this rider delivers with"} />
      <div className="px-5 pb-5 pt-4">
        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : !vehicles?.length ? (
          <EmptyState compact icon={Car} title="No vehicles added" description="Vehicles the rider registers in the app show up here." />
        ) : (
          <ul className="divide-y divide-line">
            {vehicles.map((v) => (
              <li key={v._id}>
                <Link href={`/vehicles/${v._id}/verification`} className="flex items-center gap-3 py-2.5 hover:bg-surface">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark">
                    <Car size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{[v.make, v.model].filter(Boolean).join(" ") || v.name || "Vehicle"}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {[v.plateNumber, v.color, v.type].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Badge tone={statusTone(v.status)}>{statusLabel(v.status)}</Badge>
                  <ExternalLink size={14} className="shrink-0 text-ink-faint" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

function CourierDetail({ id }: { id: string }) {
  const [range, setRange] = useState<RangeValue>(() => presetRange(30));
  const rangeQuery = useMemo(() => rangeToQuery(range), [range]);
  const overview = useUserOverview(id, rangeQuery);
  const series = useSeries({ ...rangeQuery, riderId: id });
  const [tab, setTab] = useTabParam<Tab>("earnings", TABS);
  const [dispatchOpen, setDispatchOpen] = useState(false);

  const data = overview.data;
  const user = data?.user;
  const current = data?.asRider.current;
  const previous = data?.asRider.previous;
  const lifetime = data?.asRider.lifetime;
  const loading = overview.isLoading;
  const licence = licenceOf(user);
  const settlement = data?.wallet?.settlement;
  const windowLabel = range.all ? "all time" : range.preset ? `last ${range.preset} days` : "this range";

  if (overview.error && !data) {
    return (
      <div>
        <PageHeader breadcrumb={<Link href="/couriers">Couriers</Link>} title="Rider" />
        <ErrorState message="Could not load this rider." onRetry={() => overview.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={
          <Link href="/couriers" className="inline-flex items-center gap-1 hover:text-ink">
            <ArrowLeft size={12} /> Couriers
          </Link>
        }
        title={user ? fullName(user) || "Rider" : <Skeleton className="h-8 w-56" />}
        description={lifetime ? `${count(lifetime.completed)} deliveries lifetime · ${naira(lifetime.riderFees)} earned` : undefined}
        actions={
          <>
            <LinkButton href={`/couriers/${id}/verification`} icon={ShieldCheck}>
              Licence
            </LinkButton>
            <LinkButton href={`/couriers/${id}/edit`} icon={UserRound}>
              Profile
            </LinkButton>
            <RangeTabs value={range} onChange={setRange} />
          </>
        }
      />

      <UserHeader
        user={user}
        loading={loading}
        badges={
          <>
            <Badge tone={user?.isOnline ? "success" : "neutral"} dot>
              {user?.isOnline ? "Online" : "Offline"}
            </Badge>
            <Link href={`/couriers/${id}/verification`}>
              <Badge tone={licenceTone(licence.status)}>{LICENCE_LABEL[licence.status]}</Badge>
            </Link>
            {data?.business ? <Badge tone="info">Business: {data.business.name}</Badge> : null}
          </>
        }
        actions={user ? <UserActions user={user} wallet={data?.wallet} showDispatch /> : null}
        banner={
          user?.dispatchPaused ? (
            <div className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <PauseCircle size={18} className="mt-0.5 shrink-0 text-warning" />
                <div className="text-sm">
                  <p className="font-bold text-ink">Not receiving new orders</p>
                  <p className="text-ink-muted">
                    Dispatch paused {when(user.dispatchPausedAt)}
                    {user.dispatchPausedReason ? `: ${user.dispatchPausedReason}` : ""}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setDispatchOpen(true)} className="shrink-0 text-sm font-bold text-brand-dark hover:underline">
                Resume dispatch
              </button>
            </div>
          ) : null
        }
      />
      {user ? <DispatchDialog user={user} open={dispatchOpen} onClose={() => setDispatchOpen(false)} /> : null}

      <StatGrid columns={6}>
        <StatCard
          label={`Deliveries, ${windowLabel}`}
          value={count(current?.completed)}
          icon={Bike}
          loading={loading}
          trend={current && previous ? trend(current.completed, previous.completed) : undefined}
          hint={lifetime ? `${count(lifetime.completed)} lifetime` : undefined}
        />
        <StatCard
          label="Cancelled"
          value={count(current?.cancelled)}
          icon={XCircle}
          loading={loading}
          hint={current ? `${percent(current.cancellationRate)} of ${count(current.orders)} assigned` : undefined}
        />
        <StatCard
          label={`Earned, ${windowLabel}`}
          value={naira(current?.riderFees)}
          loading={loading}
          trend={current && previous ? trend(current.riderFees, previous.riderFees) : undefined}
          hint={lifetime ? `${naira(lifetime.riderFees)} lifetime` : undefined}
        />
        <StatCard
          label="Volume handled"
          value={naira(current?.completedVolume)}
          loading={loading}
          hint={lifetime ? `${naira(lifetime.completedVolume)} lifetime` : undefined}
        />
        <StatCard
          label="Rating"
          value={data?.reviews.average != null ? data.reviews.average.toFixed(1) : "–"}
          icon={Star}
          loading={loading}
          hint={data ? `${count(data.reviews.count)} reviews` : undefined}
        />
        <StatCard
          label="Wallet balance"
          value={naira(data?.wallet?.balance)}
          icon={Wallet}
          tone="brand"
          loading={loading}
          hint={data?.wallet ? `${data.wallet.currency ?? "NGN"} earnings wallet` : "No wallet yet"}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Deliveries over time" subtitle="Assigned, completed and cancelled per bucket" loading={series.isLoading} empty={!series.data?.points.length} height={260}>
            <TrendChart
              data={series.data?.points ?? []}
              xKey="bucket"
              xFormat={bucketLabel(series.data?.bucket)}
              series={[
                { key: "orders", label: "Assigned" },
                { key: "completed", label: "Completed" },
                { key: "cancelled", label: "Cancelled" },
              ]}
            />
          </ChartCard>
        </div>
        <ChartCard title="Earnings over time" subtitle="Rider fees per bucket" loading={series.isLoading} empty={!series.data?.points.length} height={260}>
          <TrendChart data={series.data?.points ?? []} xKey="bucket" xFormat={bucketLabel(series.data?.bucket)} yFormat="naira" series={[{ key: "riderFees", label: "Earned", format: "naira" }]} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RatingPanel reviews={data?.reviews} loading={loading} />
        <VehiclesPanel vehicles={data?.vehicles} loading={loading} />
        <Panel>
          <PanelHeader title="Wallet and settlement" subtitle="Where withdrawals go" />
          <div className="px-5 pb-5 pt-4">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : !data?.wallet ? (
              <EmptyState compact icon={Wallet} title="No wallet yet" description="A wallet is created the first time the rider earns." />
            ) : (
              <div className="space-y-4">
                <KeyValue
                  columns={2}
                  items={[
                    { label: "Balance", value: naira(data.wallet.balance) },
                    { label: "Wallet status", value: data.wallet.status ? statusLabel(String(data.wallet.status)) : "Active" },
                  ]}
                />
                {settlement?.accountNumber ? (
                  <div className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3">
                    <Landmark size={16} className="mt-0.5 shrink-0 text-ink-muted" />
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-semibold text-ink">{settlement.accountName ?? "Account name not set"}</p>
                      <p className="text-ink-muted">
                        {settlement.bankName ?? "Bank"} · {maskAccount(settlement.accountNumber)}
                      </p>
                    </div>
                    <Badge tone={settlement.isVerified ? "success" : "warning"} className="ml-auto shrink-0">
                      {settlement.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-xs text-ink-faint">No settlement account yet. The rider adds one in the app before withdrawing.</p>
                )}
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "earnings", label: "Earnings", count: lifetime?.completed },
          { id: "transactions", label: "Wallet history" },
          { id: "activity", label: "Activity" },
        ]}
      />

      {tab === "earnings" ? (
        <UserTransactionsTable
          userId={id}
          csvName={`rider-${id}-earnings`}
          purpose={EARNING_PURPOSES}
          emptyTitle="No earnings yet"
          emptyDescription="Each completed delivery credits the rider's wallet and shows up here."
        />
      ) : null}
      {tab === "transactions" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <UserTransactionsTable userId={id} csvName={`rider-${id}-transactions`} />
          </div>
          <MoneyByPurpose data={data?.transactions} loading={loading} />
        </div>
      ) : null}
      {tab === "activity" ? <ActivityFeed user={user} includeOrders={false} enabled={tab === "activity"} /> : null}
    </div>
  );
}

export default function CourierDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CourierDetail id={params.id} />
    </Suspense>
  );
}
