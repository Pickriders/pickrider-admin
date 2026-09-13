"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PackageSearch } from "lucide-react";
import { useMemo } from "react";

import { Badge, DataTable, type ColumnMeta, type FilterSpec } from "@/components/kit";
import type { OrderRow, Paged } from "@/lib/admin/api";
import { fullName, naira, statusLabel, when } from "@/lib/admin/format";
import { useOrders } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { ORDER_STATUSES, ORDER_TYPES, TYPE_LABEL, orderNumber, paymentLabel, totalDistanceKm, typeLabel } from "../lib";
import { PartyCell, PaymentBadge, StatusWithTime, TypeBadge } from "./order-cells";

/**
 * Every order the platform has seen, server paginated. Search is by order
 * number (the only text the API indexes); status, type, scheduled and a date
 * range are URL filters so a view can be shared.
 */
const FILTERS: FilterSpec[] = [
  { key: "status", label: "Status", options: ORDER_STATUSES.map((status) => ({ value: status, label: statusLabel(status) })) },
  { key: "type", label: "Type", options: ORDER_TYPES.map((type) => ({ value: type, label: TYPE_LABEL[type] })) },
  {
    key: "isScheduled",
    label: "Scheduled",
    options: [
      { value: "true", label: "Scheduled only" },
      { value: "false", label: "Instant only" },
    ],
  },
];

const meta = (value: ColumnMeta) => value;

const COLUMNS: ColumnDef<OrderRow, unknown>[] = [
  {
    id: "order",
    header: "Order",
    meta: meta({ csv: { key: "orderNumber", label: "Order number" } }),
    cell: ({ row }) => (
      <span className="flex flex-col gap-1">
        <span className="text-sm font-bold text-ink">{orderNumber(row.original)}</span>
        <span className="flex flex-wrap items-center gap-1">
          <TypeBadge type={row.original.type} />
          {row.original.isScheduled ? <Badge tone="brand">Scheduled</Badge> : null}
        </span>
      </span>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    meta: meta({ csv: { key: "customer", label: "Customer", value: (row) => fullName((row as OrderRow).user) } }),
    cell: ({ row }) => (
      <PartyCell party={row.original.user} href={row.original.user ? `/customers/${row.original.user._id}` : undefined} fallback="Unknown" />
    ),
  },
  {
    id: "rider",
    header: "Courier",
    meta: meta({ hideBelow: "lg", csv: { key: "courier", label: "Courier", value: (row) => fullName((row as OrderRow).rider) } }),
    cell: ({ row }) => (
      <PartyCell
        party={row.original.rider}
        href={row.original.rider ? `/couriers/${row.original.rider._id}` : undefined}
        fallback={row.original.status === "INITIATED" ? `${(row.original.offers ?? []).length} bids` : "No rider"}
      />
    ),
  },
  {
    id: "amount",
    header: "Amount",
    meta: meta({ align: "right", csv: { key: "total", label: "Total (kobo)", value: (row) => (row as OrderRow).totalAmountPayable ?? 0 } }),
    cell: ({ row }) => (
      <span className="flex flex-col items-end gap-0.5">
        <span className="text-sm font-bold text-ink">{naira(row.original.totalAmountPayable)}</span>
        <span className="text-[11px] text-ink-muted">Rider {naira(row.original.negotiatedAmount)}</span>
        {(row.original.discountAmount ?? 0) > 0 ? (
          <span className="text-[11px] text-success">Discount {naira(row.original.discountAmount)}</span>
        ) : null}
      </span>
    ),
  },
  {
    id: "payment",
    header: "Payment",
    meta: meta({ hideBelow: "xl", csv: { key: "paymentStatus", label: "Payment", value: (row) => paymentLabel((row as OrderRow).paymentStatus) } }),
    cell: ({ row }) => (
      <span className="flex flex-col items-start gap-1">
        <PaymentBadge status={row.original.paymentStatus} />
        {row.original.paidDate ? <span className="text-[11px] text-ink-faint">{when(row.original.paidDate)}</span> : null}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    meta: meta({
      csv: { key: "status", label: "Status", value: (row) => statusLabel((row as OrderRow).status) },
    }),
    cell: ({ row }) => <StatusWithTime order={row.original} />,
  },
  {
    id: "distance",
    header: "Distance",
    meta: meta({ hideBelow: "xl", align: "right", csv: { key: "distanceKm", label: "Distance (km)", value: (row) => totalDistanceKm(row as OrderRow).toFixed(1) } }),
    cell: ({ row }) => <span className="text-sm text-ink-muted">{totalDistanceKm(row.original).toFixed(1)} km</span>,
  },
  {
    id: "createdAt",
    header: "Placed",
    meta: meta({ sortKey: "createdAt", hideBelow: "md", csv: { key: "createdAt", label: "Placed" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{when(row.original.createdAt)}</span>,
  },
];

export function AllOrdersTab() {
  const table = useTableState({ limit: 20 });
  const query = useMemo(() => {
    // The API sorts by createdAt only; `order` is the one sort knob it reads.
    const { sortBy: _ignored, ...rest } = table.query;
    void _ignored;
    return { ...rest, orderNumber: table.state.search };
  }, [table.query, table.state.search]);
  const orders = useOrders(query);
  const data = orders.data as Paged<OrderRow> | undefined;

  return (
    <DataTable<OrderRow>
      columns={COLUMNS}
      data={data}
      loading={orders.isLoading || orders.isFetching}
      error={orders.isError ? errorMessage(orders.error) : null}
      onRetry={() => void orders.refetch()}
      filters={FILTERS}
      searchPlaceholder="Search by order number"
      csvName="orders"
      defaultSort={{ sortBy: "createdAt", order: "DESC" }}
      emptyIcon={PackageSearch}
      emptyTitle="No orders match"
      emptyDescription="Try a wider date range or clear the filters."
      rowHref={(row) => `/orders/${row._id}`}
      mobileCard={(row) => (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">{orderNumber(row)}</p>
              <p className="text-[11px] text-ink-muted">
                {typeLabel(row.type)} · {when(row.createdAt)}
              </p>
            </div>
            <span className="text-sm font-bold text-ink">{naira(row.totalAmountPayable)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusWithTime order={row} />
            <PaymentBadge status={row.paymentStatus} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <PartyCell party={row.user} fallback="Unknown customer" size={24} />
            <PartyCell party={row.rider} fallback="No rider" size={24} />
          </div>
        </div>
      )}
    />
  );
}
