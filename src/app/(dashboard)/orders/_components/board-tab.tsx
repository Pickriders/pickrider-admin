"use client";

import { Bike, CheckCircle2, Clock, PackageSearch, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import {
  Badge,
  EmptyState,
  ErrorState,
  Panel,
  Skeleton,
  SkeletonLine,
  SkeletonOrder,
  SkeletonPerson,
  StatCard,
  StatGrid,
  cx,
  presetRange,
  rangeToQuery,
} from "@/components/kit";
import type { OrderRow, OrderStatus } from "@/lib/admin/api";
import { ago, count, naira, orderSource, when } from "@/lib/admin/format";
import { useOrders, useOverview } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { STALE_AFTER_MINUTES, isStale, typeLabel } from "../lib";
import { CourierCell, OrderCell, OrderPaymentBadge, PartyCell } from "./order-cells";

/**
 * The live board: every order that is not finished, in three columns by
 * stage. Awaiting-rider orders older than 15 minutes are flagged so ops can
 * step in. Fed by the 20s poll plus the socket invalidation in the shell.
 */
const COLUMNS: { status: OrderStatus; title: string; hint: string; tone: "warning" | "brand" | "info" }[] = [
  { status: "INITIATED", title: "Awaiting rider", hint: "No rider has accepted yet", tone: "warning" },
  { status: "ACCEPTED", title: "Rider assigned", hint: "Heading to pickup", tone: "brand" },
  { status: "ON_GOING", title: "In transit", hint: "Package on the move", tone: "info" },
];

const COLUMN_BAR: Record<(typeof COLUMNS)[number]["tone"], string> = {
  warning: "bg-warning",
  brand: "bg-brand",
  info: "bg-info",
};

export function BoardTab({ onShowAll }: { onShowAll: (status: OrderStatus) => void }) {
  const liveQuery = useMemo(() => rangeToQuery(presetRange(7)), []);
  const overview = useOverview(liveQuery);
  const live = overview.data?.live;

  const orders = useOrders({ status: "INITIATED,ACCEPTED,ON_GOING", limit: 100, order: "DESC" }, { poll: true });
  const rows = useMemo(() => orders.data?.items ?? [], [orders.data]);
  const grouped = useMemo(() => {
    const map: Record<OrderStatus, OrderRow[]> = { INITIATED: [], ACCEPTED: [], ON_GOING: [], COMPLETED: [], CANCELLED: [] };
    for (const row of rows as OrderRow[]) map[row.status]?.push(row);
    // Oldest first inside a column: the ones waiting longest need eyes first.
    for (const key of Object.keys(map) as OrderStatus[]) {
      map[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return map;
  }, [rows]);

  const staleCount = grouped.INITIATED.filter(isStale).length;

  return (
    <div className="space-y-5">
      <StatGrid columns={3}>
        <StatCard
          label="Awaiting rider"
          value={count(live?.awaitingRider ?? grouped.INITIATED.length)}
          icon={PackageSearch}
          loading={overview.isLoading && orders.isLoading}
          hint={
            (live?.awaitingRiderStale ?? staleCount) > 0 ? (
              <span className="font-semibold text-warning">{count(live?.awaitingRiderStale ?? staleCount)} waiting over {STALE_AFTER_MINUTES} min</span>
            ) : (
              "All recent"
            )
          }
        />
        <StatCard label="Rider assigned" value={count(live?.accepted ?? grouped.ACCEPTED.length)} icon={Bike} loading={overview.isLoading && orders.isLoading} />
        <StatCard label="In transit" value={count(live?.ongoing ?? grouped.ON_GOING.length)} icon={Truck} loading={overview.isLoading && orders.isLoading} />
        <StatCard label="Completed today" value={count(live?.completedToday)} icon={CheckCircle2} loading={overview.isLoading} onClick={() => onShowAll("COMPLETED")} hint="Open the list" />
        <StatCard label="Cancelled today" value={count(live?.cancelledToday)} icon={XCircle} loading={overview.isLoading} onClick={() => onShowAll("CANCELLED")} hint="Open the list" />
        <StatCard label="Riders online" value={count(live?.ridersOnline)} icon={Clock} loading={overview.isLoading} hint={`${count(live?.placedToday)} placed today`} />
      </StatGrid>

      {orders.isError ? (
        <ErrorState message={errorMessage(orders.error)} onRetry={() => void orders.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {COLUMNS.map((column) => {
            const items = grouped[column.status];
            return (
              <Panel key={column.status} className="flex min-h-[18rem] flex-col overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 pt-4">
                  <div className="flex items-center gap-2">
                    <span className={cx("h-2.5 w-2.5 rounded-full", COLUMN_BAR[column.tone])} />
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-ink">{column.title}</h3>
                      <p className="text-[11px] text-ink-muted">{column.hint}</p>
                    </div>
                  </div>
                  {orders.isLoading && !items.length ? (
                    <Skeleton className="h-[22px] w-8 rounded-full" />
                  ) : (
                    <Badge tone={column.tone}>{count(items.length)}</Badge>
                  )}
                </div>
                <div className="admin-scroll mt-3 flex-1 space-y-2 overflow-y-auto px-3 pb-3 lg:max-h-[70vh]">
                  {orders.isLoading && !items.length ? (
                    Array.from({ length: 3 }).map((_, index) => <BoardCardSkeleton key={index} />)
                  ) : items.length ? (
                    items.map((order) => <BoardCard key={order._id} order={order} />)
                  ) : (
                    <EmptyState compact title="Nothing here" description={`Orders will appear as soon as one is ${column.title.toLowerCase()}.`} />
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
      {orders.data && orders.data.total > rows.length ? (
        <p className="text-xs text-ink-faint">
          Showing the {count(rows.length)} most recent of {count(orders.data.total)} live orders.{" "}
          <button type="button" className="font-semibold text-brand-dark hover:underline" onClick={() => onShowAll("INITIATED")}>
            Open the full list
          </button>
        </p>
      ) : null}
    </div>
  );
}

/** BoardCard while the board loads: number and amount, the customer and courier box, the drop-off line. */
function BoardCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-card p-3" aria-hidden>
      <div className="flex items-start justify-between gap-3">
        <SkeletonOrder />
        <span className="block shrink-0">
          <SkeletonLine box="h-[18px] justify-end" bar="h-3.5 w-16" />
          <SkeletonLine box="mt-1 h-3.5 justify-end" bar="h-2.5 w-12" />
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2.5 rounded-lg bg-surface/70 px-2.5 py-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
        {["Customer", "Courier"].map((label) => (
          <div key={label} className="min-w-0">
            <SkeletonLine box="mb-1 h-[15px]" bar="h-2 w-14" />
            <SkeletonPerson size={24} name="w-24" />
          </div>
        ))}
      </div>
      <SkeletonLine box="mt-2 h-4" bar="h-2.5 w-3/4" />
    </div>
  );
}

function BoardCard({ order }: { order: OrderRow }) {
  const stale = isStale(order);
  const dropoffs = (order.locations ?? []).filter((stop) => stop.type === "DROPOFF");
  const firstDrop = dropoffs[0]?.address;
  return (
    <Link
      href={`/orders/${order._id}`}
      className={cx(
        "block rounded-xl border bg-card p-3 transition-colors hover:bg-surface",
        stale ? "border-warning/60 bg-warning-soft/40" : "border-line",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <OrderCell order={order} />
        <span className="flex shrink-0 flex-col items-end leading-tight tabular-nums">
          <span className="text-sm font-bold text-ink">{naira(order.totalAmountPayable)}</span>
          <span className="mt-1 text-[11px] text-ink-faint" title={when(order.createdAt)}>
            {ago(order.createdAt)}
          </span>
        </span>
      </div>
      {/* Storefront orders are prepaid off-platform; say so, since "Paid" alone would mislead. */}
      {orderSource(order.channel) === "STORE" ? (
        <div className="mt-2">
          <OrderPaymentBadge order={order} />
        </div>
      ) : null}
      {stale ? (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-warning">
          <Clock size={12} /> Waiting {Math.round((Date.now() - new Date(order.scheduleDispatchedAt ?? order.createdAt).getTime()) / 60_000)} min for a rider
        </p>
      ) : null}
      <div className="mt-3 grid grid-cols-1 gap-2.5 rounded-lg bg-surface/70 px-2.5 py-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">Customer</p>
          <PartyCell party={order.user} fallback="Unknown" size={24} />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">Courier</p>
          <CourierCell order={order} size={24} />
        </div>
      </div>
      {firstDrop ? (
        <p className="mt-2 truncate text-[11px] text-ink-muted" title={firstDrop}>
          To {firstDrop}
          {dropoffs.length > 1 ? ` and ${dropoffs.length - 1} more` : ""}
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-ink-faint">{typeLabel(order.type)}</p>
      )}
    </Link>
  );
}
