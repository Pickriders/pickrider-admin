"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardList } from "lucide-react";
import { useMemo } from "react";

import type { Order, Paged, User } from "@/lib/admin/api";
import { fullName, naira, statusLabel, when } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/http";
import { useBusinessOrders } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";
import { Badge, DataTable, statusTone, type ColumnMeta, type Tone } from "@/components/kit";

/** Orders placed by the business, from GET businesses/:id/orders. */
const ORDER_TONE: Record<string, Tone> = {
  INITIATED: "warning",
  ACCEPTED: "brand",
  ON_GOING: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const STATUS_OPTIONS = Object.keys(ORDER_TONE).map((value) => ({ value, label: statusLabel(value) }));
const TYPE_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "BATCH", label: "Batch" },
  { value: "BULK", label: "Bulk" },
];

function person(value: string | User | null | undefined) {
  if (!value || typeof value === "string") return "";
  return fullName(value) || value.phone || "";
}

function orderTone(status: string | undefined): Tone {
  return (status && ORDER_TONE[status]) || statusTone(status?.toLowerCase());
}

const COLUMNS: ColumnDef<Order, unknown>[] = [
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">#{row.original.orderNumber ?? row.original._id.slice(-6)}</p>
        <p className="truncate text-xs capitalize text-ink-muted">
          {row.original.type?.toLowerCase()}
          {row.original.isScheduled ? <Badge tone="info" className="ml-1.5">Scheduled</Badge> : null}
        </p>
      </div>
    ),
    meta: { csv: { key: "orderNumber", label: "Order" } } satisfies ColumnMeta,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge tone={orderTone(row.original.status)} dot>
        {statusLabel(row.original.status)}
      </Badge>
    ),
    meta: { csv: { key: "status", label: "Status" } } satisfies ColumnMeta,
  },
  {
    id: "pickup",
    header: "Pickup",
    cell: ({ row }) => <span className="block max-w-[16rem] truncate text-ink-muted">{row.original.pickup?.address ?? row.original.locations?.[0]?.address ?? ""}</span>,
    meta: { hideBelow: "xl", csv: { key: "pickup", label: "Pickup", value: (r) => (r as Order).pickup?.address ?? "" } } satisfies ColumnMeta,
  },
  {
    id: "rider",
    header: "Rider",
    cell: ({ row }) => <span className="text-ink-muted">{person(row.original.riderId) || (row.original.riderId ? "Assigned" : "None yet")}</span>,
    meta: { hideBelow: "lg", csv: { key: "rider", label: "Rider", value: (r) => person((r as Order).riderId) } } satisfies ColumnMeta,
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => <span className="whitespace-nowrap font-semibold text-ink">{naira(row.original.totalAmountPayable)}</span>,
    meta: { align: "right", csv: { key: "totalAmountPayable", label: "Amount (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "createdAt",
    header: "Placed",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{when(row.original.createdAt)}</span>,
    meta: { hideBelow: "md", sortKey: "createdAt", csv: { key: "createdAt", label: "Placed" } } satisfies ColumnMeta,
  },
];

export function OrdersTab({ businessId }: { businessId: string }) {
  const table = useTableState();
  const query = useMemo(() => ({ ...table.query, orderNumber: table.state.search }), [table.query, table.state.search]);
  const data = useBusinessOrders(businessId, query);

  return (
    <DataTable<Order>
      columns={COLUMNS}
      data={data.data as Paged<Order> | undefined}
      loading={data.isPending || data.isFetching}
      error={data.error ? errorMessage(data.error) : null}
      onRetry={() => void data.refetch()}
      searchPlaceholder="Order number"
      filters={[
        { key: "status", label: "Status", options: STATUS_OPTIONS },
        { key: "type", label: "Type", options: TYPE_OPTIONS },
        {
          key: "isScheduled",
          label: "Scheduled",
          options: [
            { value: "true", label: "Scheduled only" },
            { value: "false", label: "Not scheduled" },
          ],
        },
      ]}
      csvName="business-orders"
      defaultSort={{ sortBy: "createdAt", order: "DESC" }}
      rowHref={(row) => `/orders/${row._id}`}
      mobileCard={(row) => (
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-ink">#{row.orderNumber ?? row._id.slice(-6)}</p>
            <Badge tone={orderTone(row.status)}>{statusLabel(row.status)}</Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{row.pickup?.address ?? row.locations?.[0]?.address ?? ""}</p>
          <p className="mt-1 text-xs text-ink-muted">
            <span className="font-semibold text-ink">{naira(row.totalAmountPayable)}</span> · {row.type?.toLowerCase()} · {when(row.createdAt)}
          </p>
        </div>
      )}
      emptyIcon={ClipboardList}
      emptyTitle="No orders"
      emptyDescription="Orders this business places show up here."
    />
  );
}
