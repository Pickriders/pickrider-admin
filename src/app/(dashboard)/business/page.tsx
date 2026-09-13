"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Megaphone } from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo } from "react";

import type { BusinessRow, Paged } from "@/lib/admin/api";
import { count, fullName, naira, when } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/http";
import { useBusinesses } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";
import { Avatar, Badge, DataTable, LinkButton, PageHeader, type ColumnMeta } from "@/components/kit";

/**
 * Businesses with their owner, wallet and activity in one page from
 * GET admins/stats/businesses. Rows open the business detail; messaging
 * lives on the messaging page with the audience preselected.
 */
function businessLogo(row: BusinessRow) {
  return (row.photo as string | undefined) ?? row.logo ?? null;
}

function stop(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

const COLUMNS: ColumnDef<BusinessRow, unknown>[] = [
  {
    id: "business",
    header: "Business",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar src={businessLogo(row.original)} name={row.original.name} size={36} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{row.original.name}</p>
          <p className="truncate text-xs text-ink-muted">{row.original.businessHandle ? `@${row.original.businessHandle}` : row.original.email || ""}</p>
        </div>
      </div>
    ),
    meta: { sortKey: "name", csv: { key: "name", label: "Business" } } satisfies ColumnMeta,
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const owner = row.original.owner;
      if (!owner) return <span className="text-ink-faint">No owner</span>;
      return (
        <Link href={`/customers/${owner._id}`} onClick={stop} className="min-w-0 hover:underline">
          <span className="block truncate text-ink">{fullName(owner) || owner.email || "Owner"}</span>
          <span className="block truncate text-xs text-ink-muted">{owner.phone || owner.email || ""}</span>
        </Link>
      );
    },
    meta: { hideBelow: "md", csv: { key: "owner", label: "Owner", value: (r) => fullName((r as BusinessRow).owner) } } satisfies ColumnMeta,
  },
  {
    id: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive === false ? (
        <Badge tone="danger" dot>
          Inactive
        </Badge>
      ) : (
        <Badge tone="success" dot>
          Active
        </Badge>
      ),
    meta: { csv: { key: "isActive", label: "Active", value: (r) => ((r as BusinessRow).isActive === false ? "No" : "Yes") } } satisfies ColumnMeta,
  },
  {
    id: "riders",
    header: "Riders",
    cell: ({ row }) => count(row.original.ridersCount),
    meta: { align: "right", hideBelow: "lg", csv: { key: "ridersCount", label: "Riders" } } satisfies ColumnMeta,
  },
  {
    id: "vehicles",
    header: "Vehicles",
    cell: ({ row }) => count(row.original.vehiclesCount),
    meta: { align: "right", hideBelow: "lg", csv: { key: "vehiclesCount", label: "Vehicles" } } satisfies ColumnMeta,
  },
  {
    id: "orders",
    header: "Orders",
    cell: ({ row }) => (
      <span>
        {count(row.original.orders)}
        {row.original.orders ? <span className="text-xs text-ink-muted"> · {count(row.original.completedOrders)} done</span> : null}
      </span>
    ),
    meta: { align: "right", hideBelow: "md", csv: { key: "orders", label: "Orders" } } satisfies ColumnMeta,
  },
  {
    id: "volume",
    header: "Volume",
    cell: ({ row }) => <span className="whitespace-nowrap">{naira(row.original.volume)}</span>,
    meta: { align: "right", hideBelow: "xl", csv: { key: "volume", label: "Volume (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "wallet",
    header: "Wallet",
    cell: ({ row }) => <span className="whitespace-nowrap font-semibold text-ink">{naira(row.original.walletBalance)}</span>,
    meta: { align: "right", csv: { key: "walletBalance", label: "Wallet (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "joined",
    header: "Joined",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{when(row.original.createdAt)}</span>,
    meta: { sortKey: "joined", hideBelow: "lg", csv: { key: "createdAt", label: "Joined" } } satisfies ColumnMeta,
  },
];

function BusinessList() {
  const table = useTableState();
  const query = useMemo(() => {
    // The stats route has no date filter; keep the rest of the URL state.
    const { dateRange: _unused, ...rest } = table.query;
    void _unused;
    return { ...rest, search: table.state.search };
  }, [table.query, table.state.search]);
  const data = useBusinesses(query);

  return (
    <div>
      <PageHeader
        title="Business"
        description="Partner businesses running their own couriers and vehicles on the platform."
        actions={
          <LinkButton href="/messaging?audience=BUSINESSES" icon={Megaphone}>
            Message businesses
          </LinkButton>
        }
      />
      <DataTable<BusinessRow>
        columns={COLUMNS}
        data={data.data as Paged<BusinessRow> | undefined}
        loading={data.isPending || data.isFetching}
        error={data.error ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        searchPlaceholder="Name, handle, email, phone"
        dateFilter={false}
        filters={[
          {
            key: "isActive",
            label: "Status",
            options: [
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ],
          },
        ]}
        csvName="businesses"
        defaultSort={{ sortBy: "joined", order: "DESC" }}
        rowHref={(row) => `/business/${row._id}/business-details`}
        mobileCard={(row) => (
          <div className="flex items-start gap-3">
            <Avatar src={businessLogo(row)} name={row.name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold text-ink">{row.name}</p>
                {row.isActive === false ? <Badge tone="danger">Inactive</Badge> : <Badge tone="success">Active</Badge>}
              </div>
              <p className="truncate text-xs text-ink-muted">{fullName(row.owner) || row.email || ""}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {count(row.ridersCount)} riders · {count(row.vehiclesCount)} vehicles · {count(row.orders)} orders
              </p>
              <p className="mt-0.5 text-xs font-semibold text-ink">{naira(row.walletBalance)} in wallet</p>
            </div>
          </div>
        )}
        emptyIcon={Building2}
        emptyTitle="No businesses yet"
        emptyDescription="Businesses appear here once they sign up on the business app."
      />
    </div>
  );
}

export default function BusinessPage() {
  return (
    <Suspense>
      <BusinessList />
    </Suspense>
  );
}
