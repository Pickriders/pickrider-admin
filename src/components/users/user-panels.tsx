"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Clock,
  IdCard,
  LogIn,
  Mail,
  Package,
  Phone,
  Receipt,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { Avatar, Badge, Button, DataTable, EmptyState, Panel, PanelHeader, Skeleton, cx, statusTone, type ColumnMeta, type FilterSpec, type Tone } from "@/components/kit";
import type { KycStatus, Order, Transaction, User } from "@/lib/admin/api";
import { ago, day, fullName, naira, orderPaymentDisplay, statusLabel, when } from "@/lib/admin/format";
import { useOrders, useTransactions } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";

import { CopyButton } from "./person-card";
import { normalizePhone, phoneLabel } from "./user-actions";
import { errorMessage } from "@/lib/admin/http";
import { formatEmail } from "@/lib/admin/person";

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

/** One labelled line under the header: a small icon, a caption and the value. */
function HeaderFact({ icon: Icon, label, children, className }: { icon: LucideIcon; label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex min-w-0 items-center gap-2.5", className)}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-card text-ink-muted" aria-hidden>
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">{label}</dt>
        <dd className="flex min-w-0 items-center gap-1 text-sm font-semibold text-ink">{children}</dd>
      </div>
    </div>
  );
}

/** A skeleton bar centred in a box of the real line's height, so text arriving never shifts the layout. */
function Line({ box, bar }: { box: string; bar: string }) {
  return (
    <span className={cx("flex items-center", box)}>
      <Skeleton className={bar} />
    </span>
  );
}

/**
 * UserHeader while the profile loads: the same panel, paddings and grid, a 64px avatar with its
 * ring, name, subtitle and badge row at their real line heights, the action buttons at their real
 * sizes (two plus "More" below xl, three plus a separate Suspend from xl) and the four-fact strip.
 */
function UserHeaderSkeleton() {
  return (
    <Panel className="overflow-hidden" aria-busy="true" aria-label="Loading profile">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <span className="block shrink-0 rounded-full ring-4 ring-surface">
            <Skeleton className="h-16 w-16 rounded-full" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <Line box="h-[25px] sm:h-[30px]" bar="h-5 w-52 max-w-full sm:h-6 sm:w-64" />
            <Line box="mt-1 h-5" bar="h-3.5 w-72 max-w-full" />
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Skeleton className="h-[22px] w-16 rounded-full" />
              <Skeleton className="h-[22px] w-[4.5rem] rounded-full" />
              <Skeleton className="h-[22px] w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex w-full min-w-0 items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
          <Skeleton className="h-10 min-w-0 flex-1 rounded-xl lg:w-32 lg:flex-none" />
          <Skeleton className="h-10 min-w-0 flex-1 rounded-xl lg:w-32 lg:flex-none" />
          <Skeleton className="hidden h-10 w-32 shrink-0 rounded-xl xl:block" />
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <span className="mx-1 hidden h-6 w-px shrink-0 bg-line xl:block" aria-hidden />
          <Skeleton className="hidden h-10 w-24 shrink-0 rounded-xl xl:block" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line bg-surface/50 px-4 py-3.5 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        {["w-32", "w-44", "w-24", "w-20"].map((width, i) => (
          <div key={i} className="flex min-w-0 items-center gap-2.5">
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <Line box="h-[15px]" bar="h-2 w-12" />
              <Line box="h-5" bar={cx("h-3.5 max-w-full", width)} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/**
 * The identity block at the top of a customer or rider profile. Avatar, name (wraps rather than
 * truncating, so long names stay readable), status badges in one wrapping row, and the actions on
 * the right from `lg`. Underneath, a strip of labelled facts: phone and email with copy buttons,
 * join date and last seen. Stacks on phones.
 */
export function UserHeader({
  user,
  loading,
  badges,
  actions,
  banner,
  subtitle,
  online,
}: {
  user: User | undefined;
  loading?: boolean;
  badges?: ReactNode;
  actions?: ReactNode;
  banner?: ReactNode;
  /** A short line under the name, e.g. lifetime totals. */
  subtitle?: ReactNode;
  /** Riders: a presence dot on the avatar. */
  online?: boolean;
}) {
  if (loading || !user) return <UserHeaderSkeleton />;
  const name = fullName(user) || "Unnamed user";
  // Stored numbers vary (0803..., 234803..., +234803...); show and copy the international form.
  const phone = user.phone ? normalizePhone(user.phone) ?? phoneLabel(user.phone) : "";
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <span className="relative shrink-0">
            <span className="block rounded-full ring-4 ring-surface">
              <Avatar src={user.photo} name={name} size={64} />
            </span>
            {online !== undefined ? (
              <span
                className={cx("absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-[3px] border-card", online ? "bg-success" : "bg-line-strong")}
                title={online ? "Online now" : "Offline"}
                aria-label={online ? "Online now" : "Offline"}
              />
            ) : null}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="line-clamp-2 text-xl font-black leading-tight tracking-tight text-ink [overflow-wrap:anywhere] sm:text-2xl" title={name}>
              {name}
            </h1>
            {subtitle ? <p className="mt-1 text-sm text-ink-muted">{subtitle}</p> : null}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={statusTone(user.status)} dot>
                {statusLabel(user.status)}
              </Badge>
              {badges}
            </div>
          </div>
        </div>
        {actions ? <div className="min-w-0 lg:shrink-0">{actions}</div> : null}
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line bg-surface/50 px-4 py-3.5 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        <HeaderFact icon={Phone} label="Phone">
          {phone ? (
            <>
              <a href={`tel:${phone}`} className="min-w-0 truncate tabular-nums hover:underline">
                {phone}
              </a>
              {user.phoneVerified ? <BadgeCheck size={14} className="shrink-0 text-success" aria-label="Phone verified" /> : null}
              <CopyButton text={phone} label="Copy phone number" size="md" inline />
            </>
          ) : (
            <span className="font-medium text-ink-faint">Not set</span>
          )}
        </HeaderFact>
        <HeaderFact icon={Mail} label="Email">
          {formatEmail(user.email) ? (
            <>
              <a href={`mailto:${formatEmail(user.email)}`} className="min-w-0 truncate hover:underline" title={formatEmail(user.email)}>
                {formatEmail(user.email)}
              </a>
              {user.emailVerified ? <BadgeCheck size={14} className="shrink-0 text-success" aria-label="Email verified" /> : null}
              <CopyButton text={formatEmail(user.email)} label="Copy email address" size="md" inline />
            </>
          ) : (
            <span className="font-medium text-ink-faint">Not set</span>
          )}
        </HeaderFact>
        <HeaderFact icon={CalendarDays} label="Joined">
          <span className="truncate font-medium">{day(user.createdAt)}</span>
        </HeaderFact>
        <HeaderFact icon={Clock} label="Last seen">
          <span className="truncate font-medium" title={user.lastLoginDate ? when(user.lastLoginDate) : undefined}>
            {user.lastLoginDate ? ago(user.lastLoginDate) : "Never signed in"}
          </span>
        </HeaderFact>
        {user.bvnVerified || user.nin ? (
          <div className="flex flex-wrap items-center gap-1.5 sm:col-span-2 lg:col-span-4">
            {user.bvnVerified ? (
              <Badge tone="success">
                <ShieldCheck size={11} aria-hidden />
                BVN verified
              </Badge>
            ) : null}
            {user.nin ? (
              <Badge tone="neutral">
                <IdCard size={11} aria-hidden />
                NIN on file
              </Badge>
            ) : null}
          </div>
        ) : null}
      </dl>

      {banner ? <div className="border-t border-line p-4 sm:px-5">{banner}</div> : null}
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
        <p className="flex items-center gap-1.5 font-semibold text-ink">
          <span>#{row.original.orderNumber ?? row.original._id.slice(-6)}</span>
          {row.original.isScheduled ? <Badge tone="info">Scheduled</Badge> : null}
        </p>
        <p className="text-xs text-ink-faint">
          {statusLabel(row.original.type)}
          {row.original.isScheduled && row.original.scheduledFor ? ` · for ${when(row.original.scheduledFor)}` : ""}
        </p>
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
    cell: ({ row }) => {
      if (!row.original.paymentStatus) return null;
      const payment = orderPaymentDisplay({ ...row.original, channel: typeof row.original.channel === "string" ? row.original.channel : undefined });
      return (
        <span title={payment.hint} className={cx(payment.hint ? "cursor-help" : "", payment.tone === "info" ? "text-info" : "text-ink-muted")}>
          {payment.label}
        </span>
      );
    },
    meta: {
      hideBelow: "lg",
      csv: { key: "paymentStatus", label: "Payment", value: (r) => orderPaymentDisplay({ ...(r as Order), channel: typeof (r as Order).channel === "string" ? ((r as Order).channel as string) : undefined }).label },
    } satisfies ColumnMeta,
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
        <p className="flex flex-wrap items-center gap-1.5 font-semibold text-ink">
          <span>#{order.orderNumber ?? order._id.slice(-6)}</span>
          <span className="text-xs font-medium text-ink-faint">{statusLabel(order.type)}</span>
          {order.isScheduled ? <Badge tone="info">Scheduled</Badge> : null}
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
      isScheduled: state.filters.orderScheduled,
      dateRange: table.query.dateRange,
    }),
    [state, userId, table.query.dateRange],
  );
  const orders = useOrders(query);
  const filters: FilterSpec[] = [
    { key: "orderStatus", label: "Status", options: ORDER_STATUS_OPTIONS },
    { key: "orderType", label: "Type", options: ORDER_TYPE_OPTIONS },
    { key: "orderScheduled", label: "Scheduled", options: [{ value: "true", label: "Scheduled only" }, { value: "false", label: "Not scheduled" }] },
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
