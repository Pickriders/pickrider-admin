"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PackageSearch } from "lucide-react";
import { useMemo } from "react";

import { DataTable, Skeleton, SkeletonLine, SkeletonOrder, SkeletonPerson, type ColumnMeta, type FilterSpec } from "@/components/kit";
import type { OrderRow, Paged } from "@/lib/admin/api";
import { ORDER_SOURCE_LABEL, ago, fullName, naira, orderPaymentDisplay, orderSource, statusLabel, when } from "@/lib/admin/format";
import { useOrders } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { ORDER_STATUSES, ORDER_TYPES, TYPE_LABEL, orderNumber, statusAt, totalDistanceKm } from "../lib";
import { CourierCell, OrderCell, OrderPaymentBadge, OrderStatusBadge, PartiesLine, PartyCell, PaymentLine, StatusWithTime } from "./order-cells";

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
  // Orders a rider was taken off at least once before pickup (riderReleaseCount > 0).
  { key: "releasedOnly", label: "Rider released", options: [{ value: "true", label: "Rider released" }] },
];

const meta = (value: ColumnMeta) => value;

/**
 * Widths keep the columns steady from page to page; the people columns take what is left and
 * truncate. Payment and distance only show on the widest screens, so a laptop with the sidebar
 * open never scrolls sideways; below 2xl the payment state rides under the amount instead.
 */
const COLUMNS: ColumnDef<OrderRow, unknown>[] = [
  {
    id: "order",
    header: "Order",
    meta: meta({
      width: "128px",
      skeleton: "order",
      csv: {
        key: "orderNumber",
        label: "Order number (source)",
        value: (row) => `${orderNumber(row as OrderRow)} (${ORDER_SOURCE_LABEL[orderSource((row as OrderRow).channel)]})`,
      },
    }),
    cell: ({ row }) => <OrderCell order={row.original} />,
  },
  {
    id: "customer",
    header: "Customer",
    meta: meta({ skeleton: "person", csv: { key: "customer", label: "Customer", value: (row) => fullName((row as OrderRow).user) } }),
    cell: ({ row }) => (
      <PartyCell
        party={row.original.user}
        href={row.original.user ? `/customers/${row.original.user._id}` : undefined}
        fallback="Unknown"
        className="max-w-[200px]"
      />
    ),
  },
  {
    id: "rider",
    header: "Courier",
    meta: meta({ hideBelow: "lg", skeleton: "person", csv: { key: "courier", label: "Courier", value: (row) => fullName((row as OrderRow).rider) } }),
    cell: ({ row }) => (
      <span className="block max-w-[200px]">
        <CourierCell order={row.original} href={row.original.rider ? `/couriers/${row.original.rider._id}/details` : undefined} />
      </span>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    meta: meta({ width: "120px", align: "right", skeleton: "lines", csv: { key: "total", label: "Total (kobo)", value: (row) => (row as OrderRow).totalAmountPayable ?? 0 } }),
    cell: ({ row }) => (
      <span className="flex flex-col items-end leading-tight tabular-nums">
        <span className="text-[13px] font-bold text-ink">{naira(row.original.totalAmountPayable)}</span>
        <span className="mt-1 whitespace-nowrap text-[11px] text-ink-muted">Rider {naira(row.original.negotiatedAmount)}</span>
        {(row.original.discountAmount ?? 0) > 0 ? (
          <span className="whitespace-nowrap text-[11px] text-success">Discount {naira(row.original.discountAmount)}</span>
        ) : null}
        <PaymentLine order={row.original} className="max-w-[120px] 2xl:hidden" />
      </span>
    ),
  },
  {
    id: "payment",
    header: "Payment",
    meta: meta({ width: "150px", hideBelow: "2xl", skeleton: "badge", csv: { key: "paymentStatus", label: "Payment", value: (row) => orderPaymentDisplay(row as OrderRow).label } }),
    cell: ({ row }) => (
      <span className="flex flex-col items-start gap-1 leading-tight">
        <OrderPaymentBadge order={row.original} />
        {row.original.paidDate ? <span className="whitespace-nowrap text-[11px] tabular-nums text-ink-faint">{when(row.original.paidDate)}</span> : null}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    meta: meta({
      width: "140px",
      skeleton: "badge",
      csv: { key: "status", label: "Status", value: (row) => statusLabel((row as OrderRow).status) },
    }),
    cell: ({ row }) => <StatusWithTime order={row.original} />,
  },
  {
    id: "distance",
    header: "Distance",
    meta: meta({ width: "88px", hideBelow: "2xl", align: "right", csv: { key: "distanceKm", label: "Distance (km)", value: (row) => totalDistanceKm(row as OrderRow).toFixed(1) } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-[13px] tabular-nums text-ink-muted">{totalDistanceKm(row.original).toFixed(1)} km</span>,
  },
  {
    id: "createdAt",
    header: "Placed",
    meta: meta({ width: "128px", sortKey: "createdAt", hideBelow: "lg", skeleton: "lines", csv: { key: "createdAt", label: "Placed" } }),
    cell: ({ row }) => (
      <span className="flex flex-col leading-tight tabular-nums">
        <span className="whitespace-nowrap text-[13px] text-ink">{when(row.original.createdAt)}</span>
        <span className="mt-1 whitespace-nowrap text-[11px] text-ink-faint">{ago(row.original.createdAt)}</span>
      </span>
    ),
  },
];

/** The phone card: number, status and amount up top, then who sent it and who carries it. */
function OrderCard({ row }: { row: OrderRow }) {
  const at = statusAt(row) ?? row.createdAt;
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <OrderCell order={row} />
        <span className="flex shrink-0 flex-col items-end leading-tight tabular-nums">
          <span className="text-sm font-bold text-ink">{naira(row.totalAmountPayable)}</span>
          <span className="mt-1 text-[11px] text-ink-muted">Rider {naira(row.negotiatedAmount)}</span>
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          <OrderStatusBadge status={row.status} />
          <OrderPaymentBadge order={row} />
        </span>
        <span className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-ink-faint" title={when(at)}>
          {ago(at)}
        </span>
      </div>
      <div className="rounded-xl bg-surface/70 px-2.5 py-2">
        <PartiesLine order={row} />
      </div>
    </div>
  );
}

/** OrderCard while the first page loads: the same rows, pills and parties box, at their real heights. */
export function OrderCardSkeleton() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <SkeletonOrder />
        <span className="block shrink-0">
          <SkeletonLine box="h-[18px] justify-end" bar="h-3.5 w-16" />
          <SkeletonLine box="mt-1 h-3.5 justify-end" bar="h-2.5 w-20" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Skeleton className="h-[22px] w-24 rounded-full" />
          <Skeleton className="h-[22px] w-14 rounded-full" />
        </span>
        <SkeletonLine box="h-3.5" bar="h-2.5 w-10" />
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-surface/70 px-2.5 py-2">
        <span className="min-w-0 flex-1">
          <SkeletonPerson size={24} name="w-20" />
        </span>
        <span className="h-[13px] w-[13px] shrink-0" />
        <span className="min-w-0 flex-1">
          <SkeletonPerson size={24} name="w-20" />
        </span>
      </div>
    </div>
  );
}

export function AllOrdersTab() {
  const table = useTableState({ limit: 20 });
  const query = useMemo(() => {
    // The API sorts by createdAt only; `order` is the one sort knob it reads.
    const { sortBy: _ignored, ...rest } = table.query;
    void _ignored;
    return { ...rest, search: table.state.search };
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
      searchPlaceholder="Order number, customer or rider name, phone or email"
      csvName="orders"
      defaultSort={{ sortBy: "createdAt", order: "DESC" }}
      emptyIcon={PackageSearch}
      emptyTitle="No orders match"
      emptyDescription="Try a wider date range or clear the filters."
      rowHref={(row) => `/orders/${row._id}`}
      mobileCard={(row) => <OrderCard row={row} />}
      mobileCardSkeleton={<OrderCardSkeleton />}
      density="compact"
      stickyHeader
    />
  );
}
