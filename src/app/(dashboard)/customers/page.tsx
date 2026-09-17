"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, Megaphone, Users } from "lucide-react";
import { Suspense, useMemo } from "react";

import { Avatar, Badge, DataTable, LinkButton, PageHeader, Skeleton, statusTone, type ColumnMeta, type FilterSpec } from "@/components/kit";
import { phoneLabel } from "@/components/users/user-actions";
import type { CustomerRow } from "@/lib/admin/api";
import { ago, count, day, fullName, naira, statusLabel } from "@/lib/admin/format";
import { useCustomers } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";
import { errorMessage } from "@/lib/admin/http";

/**
 * Every customer with wallet balance and order rollups in one request
 * (GET admins/stats/customers). Bulk suspend and delete from the old page
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
];

const columns: ColumnDef<CustomerRow, unknown>[] = [
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
              {u.phone && u.email ? " · " : ""}
              {u.email ?? ""}
            </p>
          </div>
        </div>
      );
    },
    meta: { sortKey: "name", csv: { key: "name", label: "Name", value: (r) => fullName(r as CustomerRow) } } satisfies ColumnMeta,
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
    id: "orders",
    header: "Orders",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="tabular-nums">
          <p className="font-semibold text-ink">{count(u.orders)}</p>
          <p className="text-xs text-ink-faint">
            {count(u.completedOrders)} done{u.cancelledOrders ? ` · ${count(u.cancelledOrders)} cancelled` : ""}
          </p>
        </div>
      );
    },
    meta: { sortKey: "orders", align: "right", csv: { key: "orders", label: "Orders" } } satisfies ColumnMeta,
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
    cell: ({ row }) => <span className="tabular-nums text-ink-muted">{naira(row.original.walletBalance)}</span>,
    meta: { align: "right", hideBelow: "lg", csv: { key: "walletBalance", label: "Wallet (kobo)" } } satisfies ColumnMeta,
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

function CustomerCard({ row }: { row: CustomerRow }) {
  const name = fullName(row) || "Unnamed";
  return (
    <div className="flex items-start gap-3">
      <Avatar src={row.photo} name={name} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-ink">{name}</p>
          <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
        </div>
        <p className="truncate text-xs text-ink-muted">{phoneLabel(row.phone) || row.email}</p>
        <p className="mt-1 text-xs text-ink-faint">
          {count(row.orders)} orders · {naira(row.spent)} spent · wallet {naira(row.walletBalance)}
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
    }),
    [state],
  );
  const customers = useCustomers(query);

  return (
    <DataTable
      columns={columns}
      data={customers.data}
      loading={customers.isLoading}
      error={customers.error ? errorMessage(customers.error, "Could not load customers.") : null}
      onRetry={() => customers.refetch()}
      filters={FILTERS}
      dateFilter={false}
      searchPlaceholder="Name, phone, email or NIN"
      csvName="customers"
      defaultSort={{ sortBy: "joined", order: "DESC" }}
      emptyIcon={Users}
      emptyTitle={table.activeFilterCount ? "No customers match" : "No customers yet"}
      emptyDescription={table.activeFilterCount ? "Try clearing a filter or the search." : "People who sign up on the customer app appear here."}
      rowHref={(row) => `/customers/${row._id}`}
      mobileCard={(row) => <CustomerCard row={row} />}
      toolbarExtra={
        <LinkButton href="/messaging?audience=CUSTOMERS" variant="outline" size="md" icon={Megaphone}>
          <span className="hidden sm:inline">Message customers</span>
        </LinkButton>
      }
    />
  );
}

export default function CustomersPage() {
  return (
    <div>
      <PageHeader title="Customers" description="Everyone who orders on Pickriders: balances, order history and account actions." />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CustomersList />
      </Suspense>
    </div>
  );
}
