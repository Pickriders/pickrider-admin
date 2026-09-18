"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowUpRight, BadgeCheck, Clock, LogIn, Mail, Package, Phone, Receipt } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { Avatar, Badge, Button, DataTable, EmptyState, Panel, PanelHeader, Skeleton, statusTone, type ColumnMeta, type FilterSpec, type Tone } from "@/components/kit";
import type { KycStatus, Order, Transaction, User } from "@/lib/admin/api";
import { ago, day, fullName, naira, statusLabel, when } from "@/lib/admin/format";
import { useOrders, useTransactions } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";

import { phoneLabel } from "./user-actions";
import { errorMessage } from "@/lib/admin/http";

/**
 * Pieces the customer and courier detail pages share: the identity header,
 * the orders and transactions tables (URL-driven, one visible at a time), the
 * activity feed, and the small licence helpers.
 */

// ── Licence helpers ───────────────────────────────────────────────────────────

export const LICENCE_LABEL: Record<KycStatus, string> = {
  APPROVE: "Licence verified",
  SUBMITTED: "Licence awaiting review",
  DISAPPROVE: "Licence rejected",
  SUSPENDED: "Licence suspended",
  PENDING: "No licence yet",
};

export function licenceTone(status: KycStatus | undefined): Tone {
  return statusTone(status ?? "PENDING");
}

/** The licence fields live flat on the user record; the client type is loose so read them here. */
export function licenceOf(user: User | undefined) {
  const raw = (user ?? {}) as Record<string, unknown>;
  return {
    number: typeof raw.driversLicense === "string" ? raw.driversLicense : "",
    doc: typeof raw.driversLicenseDoc === "string" ? raw.driversLicenseDoc : "",
    comment: typeof raw.driversLicenseVerifiedComment === "string" ? raw.driversLicenseVerifiedComment : "",
    status: (user?.driversLicenseVerified ?? "PENDING") as KycStatus,
  };
}

/** X axis labels for the stats series; the API buckets by day, week or month. */
export function bucketLabel(bucket: "day" | "week" | "month" | undefined) {
  return (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return bucket === "month"
      ? date.toLocaleDateString("en-NG", { month: "short", year: "2-digit" })
      : date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  };
}

// ── Header ────────────────────────────────────────────────────────────────────

export function UserHeader({
  user,
  loading,
  badges,
  actions,
  banner,
}: {
  user: User | undefined;
  loading?: boolean;
  badges?: ReactNode;
  actions?: ReactNode;
  banner?: ReactNode;
}) {
  if (loading || !user) {
    return (
      <Panel className="p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
      </Panel>
    );
  }
  const name = fullName(user) || "Unnamed user";
  return (
    <Panel className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar src={user.photo} name={name} size={56} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-black tracking-tight text-ink">{name}</h1>
              <Badge tone={statusTone(user.status)} dot>
                {statusLabel(user.status)}
              </Badge>
              {badges}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              {user.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={13} /> {phoneLabel(user.phone)}
                  {user.phoneVerified ? <BadgeCheck size={13} className="text-success" aria-label="Phone verified" /> : null}
                </span>
              ) : null}
              {user.email ? (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Mail size={13} /> <span className="truncate">{user.email}</span>
                  {user.emailVerified ? <BadgeCheck size={13} className="text-success" aria-label="Email verified" /> : null}
                </span>
              ) : null}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
              <span>Joined {day(user.createdAt)}</span>
              <span>{user.lastLoginDate ? `Last seen ${ago(user.lastLoginDate)}` : "Never signed in"}</span>
              {user.bvnVerified ? <span className="text-success">BVN verified</span> : null}
              {user.nin ? <span>NIN on file</span> : null}
            </div>
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {banner ? <div className="mt-4">{banner}</div> : null}
    </Panel>
  );
}

// ── Orders table ──────────────────────────────────────────────────────────────

const ORDER_STATUS_OPTIONS = ["INITIATED", "ACCEPTED", "ON_GOING", "COMPLETED", "CANCELLED"].map((value) => ({ value, label: statusLabel(value) }));
const ORDER_TYPE_OPTIONS = ["SINGLE", "BATCH", "BULK"].map((value) => ({ value, label: statusLabel(value) }));

const orderColumns: ColumnDef<Order, unknown>[] = [
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-ink">#{row.original.orderNumber ?? row.original._id.slice(-6)}</p>
        <p className="text-xs text-ink-faint">{statusLabel(row.original.type)}</p>
      </div>
    ),
    meta: { csv: { key: "orderNumber", label: "Order" } } satisfies ColumnMeta,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge tone={statusTone(row.original.status)} dot>
        {statusLabel(row.original.status)}
      </Badge>
    ),
    meta: { csv: { key: "status", label: "Status" } } satisfies ColumnMeta,
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => <span className="font-semibold tabular-nums">{naira(row.original.totalAmountPayable)}</span>,
    meta: { align: "right", csv: { key: "amount", label: "Amount (kobo)", value: (r) => (r as Order).totalAmountPayable } } satisfies ColumnMeta,
  },
  {
    id: "payment",
    header: "Payment",
    cell: ({ row }) => <span className="text-ink-muted">{row.original.paymentStatus ? statusLabel(String(row.original.paymentStatus)) : ""}</span>,
    meta: { hideBelow: "lg", csv: { key: "paymentStatus", label: "Payment" } } satisfies ColumnMeta,
  },
  {
    id: "route",
    header: "Route",
    cell: ({ row }) => {
      const pickup = row.original.pickup?.address;
      const stops = row.original.locations?.length ?? 0;
      return (
        <span className="block max-w-[260px] truncate text-xs text-ink-muted" title={pickup}>
          {pickup ?? ""}
          {stops ? ` · ${stops} stop${stops === 1 ? "" : "s"}` : ""}
        </span>
      );
    },
    meta: { hideBelow: "xl" } satisfies ColumnMeta,
  },
  {
    id: "createdAt",
    header: "Placed",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{when(row.original.createdAt)}</span>,
    meta: { sortKey: "createdAt", csv: { key: "createdAt", label: "Placed" } } satisfies ColumnMeta,
  },
];

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-ink">
          #{order.orderNumber ?? order._id.slice(-6)} <span className="text-xs font-medium text-ink-faint">{statusLabel(order.type)}</span>
        </p>
        <p className="truncate text-xs text-ink-muted">{order.pickup?.address ?? ""}</p>
        <p className="mt-1 text-xs text-ink-faint">{when(order.createdAt)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-semibold tabular-nums text-ink">{naira(order.totalAmountPayable)}</p>
        <Badge tone={statusTone(order.status)} className="mt-1">
          {statusLabel(order.status)}
        </Badge>
      </div>
    </div>
  );
}

/** Orders placed by a user. Filter keys are prefixed in the URL so they never collide with the transactions tab. */
export function UserOrdersTable({ userId, csvName }: { userId: string; csvName: string }) {
  const table = useTableState({ limit: 20, sortBy: "createdAt", order: "DESC" });
  const { state } = table;
  const query = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      sortBy: state.sortBy,
      order: state.order,
      byUserId: userId,
      orderNumber: state.search,
      status: state.filters.orderStatus,
      type: state.filters.orderType,
      dateRange: table.query.dateRange,
    }),
    [state, userId, table.query.dateRange],
  );
  const orders = useOrders(query);
  const filters: FilterSpec[] = [
    { key: "orderStatus", label: "Status", options: ORDER_STATUS_OPTIONS },
    { key: "orderType", label: "Type", options: ORDER_TYPE_OPTIONS },
  ];
  return (
    <DataTable
      columns={orderColumns}
      data={orders.data}
      loading={orders.isLoading}
      error={orders.error ? errorMessage(orders.error, "Could not load orders.") : null}
      onRetry={() => orders.refetch()}
      filters={filters}
      searchPlaceholder="Order number"
      csvName={csvName}
      defaultSort={{ sortBy: "createdAt", order: "DESC" }}
      emptyIcon={Package}
      emptyTitle="No orders yet"
      emptyDescription="Orders this customer places will show up here."
      rowHref={(row) => `/orders/${row._id}`}
      mobileCard={(row) => <OrderCard order={row} />}
    />
  );
}

// ── Transactions table ────────────────────────────────────────────────────────

const TX_STATUS_OPTIONS = ["SUCCESS", "PROCESSING", "FAILED", "CANCELLED"].map((value) => ({ value, label: statusLabel(value) }));
const TX_TYPE_OPTIONS = [
  { value: "CREDIT", label: "Credit" },
  { value: "DEBIT", label: "Debit" },
];
const TX_PURPOSE_OPTIONS = [
  "ORDER_PAYMENT",
  "ORDER_PAYMENT_REFUND",
  "ORDER_EARNING",
  "ORDER_EARNING_SPLIT",
  "WALLET_FUNDING",
  "WALLET_WITHDRAWAL",
  "REFERRAL_BONUS",
  "ORDER_DISCOUNT",
  "ORDER_SERVICE_CHARGE",
  "PLATFORM_TRANSFER",
].map((value) => ({ value, label: statusLabel(value) }));

const transactionColumns: ColumnDef<Transaction, unknown>[] = [
  {
    id: "purpose",
    header: "Transaction",
    cell: ({ row }) => {
      const credit = row.original.type === "CREDIT";
      return (
        <div className="flex items-center gap-2.5">
          <span className={credit ? "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-success-soft text-success" : "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger"}>
            {credit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">{statusLabel(row.original.purpose)}</p>
            <p className="truncate text-xs text-ink-faint">{row.original.reference ?? row.original.description ?? ""}</p>
          </div>
        </div>
      );
    },
    meta: { csv: { key: "purpose", label: "Purpose" } } satisfies ColumnMeta,
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className={row.original.type === "CREDIT" ? "font-semibold tabular-nums text-success" : "font-semibold tabular-nums text-ink"}>
        {row.original.type === "CREDIT" ? "+" : "-"}
        {naira(row.original.amount)}
      </span>
    ),
    meta: { align: "right", csv: { key: "amount", label: "Amount (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "balanceAfter",
    header: "Balance after",
    cell: ({ row }) => <span className="tabular-nums text-ink-muted">{row.original.balanceAfter != null ? naira(row.original.balanceAfter) : ""}</span>,
    meta: { align: "right", hideBelow: "lg", csv: { key: "balanceAfter", label: "Balance after (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <Badge tone={statusTone(row.original.status)}>{statusLabel(row.original.status)}</Badge>,
    meta: { csv: { key: "status", label: "Status" } } satisfies ColumnMeta,
  },
  {
    id: "reference",
    header: "Reference",
    cell: ({ row }) => <span className="font-mono text-xs text-ink-muted">{row.original.reference ?? ""}</span>,
    meta: { hideBelow: "xl", csv: { key: "reference", label: "Reference" } } satisfies ColumnMeta,
  },
  {
    id: "createdAt",
    header: "Date",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{when(row.original.createdAt)}</span>,
    meta: { sortKey: "createdAt", csv: { key: "createdAt", label: "Date" } } satisfies ColumnMeta,
  },
];

function TransactionCard({ tx }: { tx: Transaction }) {
  const credit = tx.type === "CREDIT";
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-ink">{statusLabel(tx.purpose)}</p>
        <p className="truncate text-xs text-ink-faint">{tx.reference ?? ""}</p>
        <p className="mt-1 text-xs text-ink-faint">{when(tx.createdAt)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={credit ? "font-semibold tabular-nums text-success" : "font-semibold tabular-nums text-ink"}>
          {credit ? "+" : "-"}
          {naira(tx.amount)}
        </p>
        <Badge tone={statusTone(tx.status)} className="mt-1">
          {statusLabel(tx.status)}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Wallet transactions for a user. `purpose` pins the list to a subset (the
 * rider earnings tab); when set the purpose filter is hidden.
 */
export function UserTransactionsTable({
  userId,
  csvName,
  purpose,
  emptyTitle = "No transactions yet",
  emptyDescription = "Wallet funding, payments, earnings and refunds will show up here.",
}: {
  userId: string;
  csvName: string;
  purpose?: string;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
}) {
  const table = useTableState({ limit: 20, sortBy: "createdAt", order: "DESC" });
  const { state } = table;
  const query = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      sortBy: state.sortBy,
      order: state.order,
      entityId: userId,
      status: state.filters.txStatus,
      type: state.filters.txType,
      purpose: purpose ?? state.filters.txPurpose,
      dateRange: table.query.dateRange,
    }),
    [state, userId, purpose, table.query.dateRange],
  );
  const transactions = useTransactions(query);
  // The endpoint has no free-text search, so the toolbar search narrows the
  // loaded page by reference or description instead of hitting the API.
  const data = useMemo(() => {
    if (!transactions.data) return undefined;
    const needle = state.search?.trim().toLowerCase();
    if (!needle) return transactions.data;
    const items = transactions.data.items.filter((t) => [t.reference, t.description, t.purpose].some((v) => String(v ?? "").toLowerCase().includes(needle)));
    return { ...transactions.data, items };
  }, [transactions.data, state.search]);

  const filters: FilterSpec[] = [
    { key: "txStatus", label: "Status", options: TX_STATUS_OPTIONS },
    { key: "txType", label: "Direction", options: TX_TYPE_OPTIONS },
    ...(purpose ? [] : [{ key: "txPurpose", label: "Purpose", options: TX_PURPOSE_OPTIONS }]),
  ];
  return (
    <DataTable
      columns={transactionColumns}
      data={data}
      loading={transactions.isLoading}
      error={transactions.error ? errorMessage(transactions.error, "Could not load transactions.") : null}
      onRetry={() => transactions.refetch()}
      filters={filters}
      searchPlaceholder="Reference on this page"
      csvName={csvName}
      defaultSort={{ sortBy: "createdAt", order: "DESC" }}
      emptyIcon={Receipt}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      mobileCard={(row) => <TransactionCard tx={row} />}
    />
  );
}

// ── Activity feed ─────────────────────────────────────────────────────────────

type ActivityItem =
  | { kind: "login"; date: string }
  | { kind: "tx"; date: string; tx: Transaction }
  | { kind: "order"; date: string; order: Order };

const PER_PAGE = 10;

/**
 * One timeline from the newest orders, wallet movements and the last sign-in.
 * Orders are only available for customers (the orders list has no rider
 * filter), so riders get transactions and the sign-in only.
 */
export function ActivityFeed({ user, includeOrders, enabled }: { user: User | undefined; includeOrders: boolean; enabled: boolean }) {
  const [page, setPage] = useState(1);
  const userId = user?._id ?? "";
  const orders = useOrders({ byUserId: userId, limit: 25, order: "DESC", sortBy: "createdAt" }, { enabled: enabled && includeOrders && Boolean(userId) });
  const transactions = useTransactions({ entityId: userId, limit: 25, order: "DESC", sortBy: "createdAt" }, enabled && Boolean(userId));

  const items = useMemo<ActivityItem[]>(() => {
    const out: ActivityItem[] = [];
    if (user?.lastLoginDate) out.push({ kind: "login", date: user.lastLoginDate });
    for (const tx of transactions.data?.items ?? []) out.push({ kind: "tx", date: tx.createdAt, tx });
    for (const order of orders.data?.items ?? []) out.push({ kind: "order", date: order.createdAt, order });
    return out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user?.lastLoginDate, transactions.data, orders.data]);

  const loading = transactions.isLoading || (includeOrders && orders.isLoading);
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const visible = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Panel>
      <PanelHeader title="Recent activity" subtitle={includeOrders ? "Latest orders, wallet movements and sign-in" : "Latest wallet movements and sign-in"} />
      <div className="px-5 pb-5 pt-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !items.length ? (
          <EmptyState compact icon={Clock} title="Nothing yet" description="Activity appears once this account is used." />
        ) : (
          <>
            <ol className="relative space-y-4 border-l border-line pl-5">
              {visible.map((item, index) => (
                <li key={`${item.kind}-${index}-${item.date}`} className="relative">
                  <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full border border-line bg-card text-ink-faint">
                    {item.kind === "login" ? <LogIn size={9} /> : item.kind === "tx" ? <Receipt size={9} /> : <Package size={9} />}
                  </span>
                  {item.kind === "login" ? (
                    <>
                      <p className="text-sm font-semibold text-ink">Signed in</p>
                      <p className="text-xs text-ink-muted">{when(item.date)}</p>
                    </>
                  ) : item.kind === "tx" ? (
                    <>
                      <p className="text-sm font-semibold text-ink">
                        {item.tx.type === "CREDIT" ? "Credit" : "Debit"}: {statusLabel(item.tx.purpose)}{" "}
                        <span className={item.tx.type === "CREDIT" ? "text-success" : "text-ink-muted"}>
                          {item.tx.type === "CREDIT" ? "+" : "-"}
                          {naira(item.tx.amount)}
                        </span>
                      </p>
                      <p className="text-xs text-ink-muted">
                        {when(item.date)} · {statusLabel(item.tx.status)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-ink">
                        <Link href={`/orders/${item.order._id}`} className="hover:underline">
                          Order #{item.order.orderNumber ?? item.order._id.slice(-6)}
                        </Link>{" "}
                        <span className="text-ink-muted">{naira(item.order.totalAmountPayable)}</span>
                      </p>
                      <p className="text-xs text-ink-muted">
                        {when(item.date)} · {statusLabel(item.order.status)}
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ol>
            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-end gap-2 text-xs text-ink-muted">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Newer
                </Button>
                <span>
                  {page} / {totalPages}
                </span>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Older
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Panel>
  );
}

// ── Money by purpose ──────────────────────────────────────────────────────────

/**
 * Lifetime successful transactions grouped by purpose, from the user overview.
 * A strip of tiles above the wallet table: each tile is one purpose with its
 * total, count and share of everything that moved, so two purposes read as
 * two tiles and eight purposes wrap, instead of a tall sidebar beside the table.
 */
export function MoneyByPurpose({ data, loading }: { data: Record<string, { amount: number; count: number }> | undefined; loading?: boolean }) {
  const rows = useMemo(() => Object.entries(data ?? {}).sort((a, b) => b[1].amount - a[1].amount), [data]);
  const total = rows.reduce((sum, [, v]) => sum + v.amount, 0) || 1;
  const columns = rows.length <= 2 ? "sm:grid-cols-2" : rows.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4";
  return (
    <Panel>
      <PanelHeader title="Money by purpose" subtitle="Lifetime, successful transactions only" />
      <div className="px-5 pb-5 pt-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !rows.length ? (
          <EmptyState compact icon={Receipt} title="No money moved yet" description="Totals appear after the first successful transaction." />
        ) : (
          <ul className={`grid grid-cols-1 gap-3 ${columns}`}>
            {rows.map(([purpose, value], index) => {
              const share = Math.round((value.amount / total) * 100);
              return (
                <li key={purpose} className={`rounded-2xl border p-4 ${index === 0 ? "border-brand/30 bg-brand-soft/40" : "border-line bg-surface"}`}>
                  <p className="truncate text-[11px] font-bold uppercase tracking-wide text-ink-muted">{statusLabel(purpose)}</p>
                  <p className="mt-1.5 text-xl font-black leading-none tracking-tight tabular-nums text-ink" title={naira(value.amount)}>
                    {naira(value.amount)}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(3, share)}%` }} />
                    </div>
                    <span className="shrink-0 text-[11px] tabular-nums text-ink-faint">
                      {value.count} {value.count === 1 ? "transaction" : "transactions"} · {share}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Panel>
  );
}
