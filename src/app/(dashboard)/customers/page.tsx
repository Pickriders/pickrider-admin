"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Ban, BadgeCheck, Banknote, CalendarCheck, Clock, Megaphone, Package, Sparkles, UserX, Users, Wallet, XCircle } from "lucide-react";
import { Suspense, useMemo } from "react";

import {
  Avatar,
  Badge,
  Chip,
  ChipDivider,
  DataTable,
  LinkButton,
  MenuFilters,
  MenuSelect,
  PageHeader,
  ProfileCardSkeleton,
  SkeletonLine,
  Tabs,
  TabsSkeleton,
  cx,
  statusTone,
  type ColumnMeta,
  type FilterSpec,
} from "@/components/kit";
import { phoneLabel } from "@/components/users/user-actions";
import type { CustomerRow } from "@/lib/admin/api";
import { ago, count, day, fullName, naira, statusLabel } from "@/lib/admin/format";
import { useCustomers } from "@/lib/admin/hooks";
import { useTabParam, useTableState } from "@/lib/admin/url-state";

import { CustomersOverviewTab } from "./_components/overview-tab";
import { errorMessage } from "@/lib/admin/http";
import { formatEmail } from "@/lib/admin/person";

/**
 * Every customer with wallet balance and order rollups in one request
 * (GET admins/stats/customers), with the same "Top by" rankings and quick
 * filter chips as the couriers page. The date picker filters on join date. Bulk suspend and delete from the old page
 * had no endpoint behind them and are gone; bulk email and push now live in
 * Messaging with a customer audience.
 */
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"].map((value) => ({ value, label: statusLabel(value) }));

const FILTERS: FilterSpec[] = [
  { key: "status", label: "Status", options: STATUS_OPTIONS },
  {
    key: "phoneVerified",
    label: "Phone",
    options: [
      { value: "true", label: "Verified" },
      { value: "false", label: "Not verified" },
    ],
  },
  {
    key: "hasOrdered",
    label: "Ordering",
    options: [
      { value: "true", label: "Has ordered" },
      { value: "false", label: "Never ordered" },
    ],
  },
  {
    key: "orderedWithinDays",
    label: "Last order",
    options: [
      { value: "7", label: "In the last 7 days" },
      { value: "30", label: "In the last 30 days" },
      { value: "90", label: "In the last 90 days" },
    ],
  },
];

/** The rankings GET admins/stats/customers can sort by (its sortBy whitelist). */
const SORTS = [
  { value: "joined", label: "Newest", icon: Sparkles },
  { value: "orders", label: "Most orders", icon: Package },
  { value: "spent", label: "Top spenders", icon: Banknote },
  { value: "lastLogin", label: "Recently active", icon: Clock },
  { value: "cancelled", label: "Most cancellations", icon: XCircle },
  { value: "wallet", label: "Wallet balance", icon: Wallet },
];

/** Sorting by one of these is a ranking, so the table shows each row's place. */
const RANKED = new Set(["orders", "spent", "cancelled", "wallet"]);

const MEDAL: Record<number, string> = {
  1: "bg-warning-soft text-warning",
  2: "bg-surface text-ink",
  3: "bg-brand-soft text-brand-dark",
};

const rankColumn = (offset: number): ColumnDef<CustomerRow, unknown> => ({
  id: "rank",
  header: "#",
  cell: ({ row }) => {
    const n = offset + row.index + 1;
    return <span className={cx("grid h-6 w-6 place-items-center rounded-full text-xs font-bold tabular-nums", MEDAL[n] ?? "text-ink-faint")}>{n}</span>;
  },
  meta: { width: "48px", skeleton: "line" } satisfies ColumnMeta,
});

const COLUMNS: ColumnDef<CustomerRow, unknown>[] = [
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const u = row.original;
      const name = fullName(u) || "Unnamed";
      return (
        <div className="flex items-center gap-3">
          <Avatar src={u.photo} name={name} size={36} />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <span className="truncate">{name}</span>
              {u.phoneVerified ? <BadgeCheck size={13} className="shrink-0 text-success" aria-label="Phone verified" /> : null}
            </p>
            <p className="truncate text-xs text-ink-muted">
              {phoneLabel(u.phone)}
              {u.phone && formatEmail(u.email) ? " · " : ""}
              {formatEmail(u.email)}
            </p>
          </div>
        </div>
      );
    },
    meta: { sortKey: "name", skeleton: "profile", csv: { key: "name", label: "Name", value: (r) => fullName(r as CustomerRow) } } satisfies ColumnMeta,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge tone={statusTone(row.original.status)} dot>
        {statusLabel(row.original.status)}
      </Badge>
    ),
    meta: { skeleton: "pill", csv: { key: "status", label: "Status" } } satisfies ColumnMeta,
  },
  {
    id: "orders",
    header: "Orders",
    cell: ({ row }) => {
      const u = row.original;
      return u.orders ? (
        <div className="tabular-nums">
          <p className="font-semibold text-ink">{count(u.orders)}</p>
          <p className="text-xs text-ink-faint">{count(u.completedOrders)} done</p>
        </div>
      ) : (
        <span className="text-xs text-ink-faint">Never ordered</span>
      );
    },
    meta: { sortKey: "orders", align: "right", skeleton: "stat", csv: { key: "orders", label: "Orders" } } satisfies ColumnMeta,
  },
  {
    id: "cancelled",
    header: "Cancelled",
    cell: ({ row }) => {
      const u = row.original;
      if (!u.cancelledOrders) return <span className="tabular-nums text-ink-faint">0</span>;
      const rate = u.orders ? Math.round((u.cancelledOrders / u.orders) * 100) : 0;
      return (
        <div className="tabular-nums">
          <p className={cx("font-semibold", rate >= 50 ? "text-danger" : "text-ink")}>{count(u.cancelledOrders)}</p>
          <p className="text-xs text-ink-faint">{rate}% of orders</p>
        </div>
      );
    },
    meta: { sortKey: "cancelled", align: "right", hideBelow: "lg", skeleton: "stat", csv: { key: "cancelledOrders", label: "Cancelled" } } satisfies ColumnMeta,
  },
  {
    id: "spent",
    header: "Spent",
    cell: ({ row }) => <span className="font-semibold tabular-nums text-ink">{naira(row.original.spent)}</span>,
    meta: { sortKey: "spent", align: "right", csv: { key: "spent", label: "Spent (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "wallet",
    header: "Wallet",
    cell: ({ row }) => (
      <span className={cx("tabular-nums", row.original.walletBalance ? "font-semibold text-ink" : "text-ink-faint")}>{naira(row.original.walletBalance)}</span>
    ),
    meta: { sortKey: "wallet", align: "right", hideBelow: "lg", csv: { key: "walletBalance", label: "Wallet (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "lastOrder",
    header: "Last order",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{row.original.lastOrderAt ? ago(row.original.lastOrderAt) : ""}</span>,
    meta: { hideBelow: "xl", csv: { key: "lastOrderAt", label: "Last order" } } satisfies ColumnMeta,
  },
  {
    id: "lastLogin",
    header: "Last seen",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{row.original.lastLoginDate ? ago(row.original.lastLoginDate) : ""}</span>,
    meta: { sortKey: "lastLogin", hideBelow: "xl", csv: { key: "lastLoginDate", label: "Last login" } } satisfies ColumnMeta,
  },
  {
    id: "joined",
    header: "Joined",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{day(row.original.createdAt)}</span>,
    meta: { sortKey: "joined", hideBelow: "md", csv: { key: "createdAt", label: "Joined" } } satisfies ColumnMeta,
  },
];

function CustomerCard({ row, rank }: { row: CustomerRow; rank?: number }) {
  const name = fullName(row) || "Unnamed";
  return (
    <div className="flex items-start gap-3">
      {rank ? <span className={cx("mt-2 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums", MEDAL[rank] ?? "text-ink-faint")}>{rank}</span> : null}
      <Avatar src={row.photo} name={name} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-ink">{name}</p>
          <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
        </div>
        <p className="truncate text-xs text-ink-muted">{phoneLabel(row.phone) || formatEmail(row.email)}</p>
        <p className="mt-1 text-xs text-ink-faint">
          {row.orders ? `${count(row.orders)} orders` : "Never ordered"}
          {row.cancelledOrders ? ` · ${count(row.cancelledOrders)} cancelled` : ""} · {naira(row.spent)} spent · wallet {naira(row.walletBalance)}
        </p>
      </div>
    </div>
  );
}

function CustomersList() {
  const table = useTableState({ limit: 20, sortBy: "joined", order: "DESC" });
  const { state } = table;
  const query = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      sortBy: state.sortBy,
      order: state.order,
      search: state.search,
      status: state.filters.status,
      phoneVerified: state.filters.phoneVerified,
      hasOrdered: state.filters.hasOrdered,
      orderedWithinDays: state.filters.orderedWithinDays,
      // The date picker filters on the join date.
      dateRange: table.query.dateRange,
    }),
    [state, table.query.dateRange],
  );
  const customers = useCustomers(query);
  const ranked = RANKED.has(state.sortBy ?? "");
  const offset = (state.page - 1) * state.limit;
  const columns = useMemo(() => (ranked ? [rankColumn(offset), ...COLUMNS] : COLUMNS), [ranked, offset]);

  const neverOrdered = state.filters.hasOrdered === "false";
  const recent = state.filters.orderedWithinDays === "30";
  const suspended = state.filters.status === "SUSPENDED";
  const sortBy = (value: string) => table.update({ sortBy: value, order: "DESC" });
  // "Never ordered" and "ordered recently" contradict each other, so each clears the other.
  const toggleNeverOrdered = () => table.update({ hasOrdered: neverOrdered ? undefined : "false", orderedWithinDays: undefined });
  const toggleRecent = () => table.update({ orderedWithinDays: recent ? undefined : "30", hasOrdered: undefined });
  const toggleSuspended = () => table.setFilter("status", suspended ? undefined : "SUSPENDED");

  return (
    <div className="space-y-3">
      {/* Phones and small tablets: two compact menus instead of wrapping chip rows. */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <MenuSelect label="Sort" title="Top by" value={state.sortBy} options={SORTS} onChange={sortBy} placeholder="Custom" />
        <MenuFilters
          title="Quick filters"
          align="end"
          onClear={() =>
            // Clear only what the quick filters set, so a value picked in the filter panel survives.
            table.update({
              hasOrdered: neverOrdered ? undefined : state.filters.hasOrdered,
              orderedWithinDays: recent ? undefined : state.filters.orderedWithinDays,
              status: suspended ? undefined : state.filters.status,
            })
          }
          toggles={[
            { id: "never", label: "Never ordered", icon: UserX, active: neverOrdered, onToggle: toggleNeverOrdered },
            { id: "recent", label: "Ordered in last 30 days", icon: CalendarCheck, active: recent, onToggle: toggleRecent },
            { id: "suspended", label: "Suspended", icon: Ban, tone: "warning", active: suspended, onToggle: toggleSuspended },
          ]}
        />
      </div>
      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <span className="mr-1 text-xs font-semibold text-ink-faint">Top by</span>
        {SORTS.map((s) => (
          <Chip key={s.value} active={state.sortBy === s.value} onClick={() => sortBy(s.value)}>
            {s.label}
          </Chip>
        ))}
        <ChipDivider />
        <Chip active={neverOrdered} onClick={toggleNeverOrdered}>
          <UserX size={13} />
          Never ordered
        </Chip>
        <Chip active={recent} onClick={toggleRecent}>
          <CalendarCheck size={13} />
          Ordered in last 30 days
        </Chip>
        <Chip tone="warning" active={suspended} onClick={toggleSuspended}>
          <Ban size={13} />
          Suspended
        </Chip>
      </div>
      {state.from || state.to ? (
        <p className="text-xs text-ink-muted">
          Showing customers who joined {state.from ? `from ${day(state.from)}` : ""}
          {state.from && state.to ? " " : ""}
          {state.to ? `up to ${day(state.to)}` : ""}.
        </p>
      ) : null}
      <DataTable
        columns={columns}
        data={customers.data}
        loading={customers.isLoading}
        error={customers.error ? errorMessage(customers.error, "Could not load customers.") : null}
        onRetry={() => customers.refetch()}
        filters={FILTERS}
        searchPlaceholder="Name, phone, email or NIN"
        csvName="customers"
        defaultSort={{ sortBy: "joined", order: "DESC" }}
        emptyIcon={Users}
        emptyTitle={table.activeFilterCount ? "No customers match" : "No customers yet"}
        emptyDescription={
          table.activeFilterCount ? "Try clearing a filter, the join dates or the search." : "People who sign up on the customer app appear here."
        }
        rowHref={(row) => `/customers/${row._id}`}
        mobileCard={(row) => {
          const index = customers.data?.items.indexOf(row) ?? -1;
          return <CustomerCard row={row} rank={ranked && index >= 0 ? offset + index + 1 : undefined} />;
        }}
        mobileCardSkeleton={<ProfileCardSkeleton />}
        toolbarExtra={
          <LinkButton href="/messaging?audience=CUSTOMERS" variant="outline" size="md" icon={Megaphone}>
            <span>Message customers</span>
          </LinkButton>
        }
      />
    </div>
  );
}

const TABS = ["overview", "list"] as const;
type Tab = (typeof TABS)[number];

const DESCRIPTION: Record<Tab, string> = {
  overview: "Who is using the app, how often they order, what they spend, and who cancels the most.",
  list: "Everyone who orders on Pickriders: balances, order history and account actions.",
};

function CustomersHub() {
  const [tab, setTab] = useTabParam<Tab>("overview", TABS);
  return (
    <div>
      <PageHeader title="Customers" description={DESCRIPTION[tab]} />
      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "overview", label: "Overview" },
          { id: "list", label: "Customers" },
        ]}
      />
      {tab === "overview" ? <CustomersOverviewTab /> : <CustomersList />}
    </div>
  );
}

/** Until the search params resolve: the real title, the description line and the two tabs. */
function CustomersFallback() {
  return (
    <div aria-busy="true">
      <PageHeader title="Customers" description={<SkeletonLine box="h-5" bar="h-3.5 w-96 max-w-full" />} />
      <TabsSkeleton widths={["w-24", "w-28"]} className="mb-4" />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomersFallback />}>
      <CustomersHub />
    </Suspense>
  );
}
