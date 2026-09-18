"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { BellRing, CalendarClock } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, Button, DataTable, cx, type ColumnMeta } from "@/components/kit";
import { orders as ordersApi, type OrderRow, type Paged } from "@/lib/admin/api";
import { ago, count, naira, when } from "@/lib/admin/format";
import { useAction, useOrders } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useCan } from "@/lib/admin/use-can";
import { useTableState } from "@/lib/admin/url-state";

import { orderNumber } from "../lib";
import { PartyCell, PaymentBadge, TypeBadge } from "./order-cells";

/**
 * Scheduled orders that have not found a rider yet. The dispatcher rings riders 30 minutes before
 * the booked time and again every 5 minutes; this tab shows where each booking is in that cycle
 * and lets ops ring riders by hand so nothing is missed. Two hours past the booked time with no
 * rider, the sweep cancels and refunds it.
 */
const LEAD_MS = 30 * 60 * 1000;
const GRACE_MS = 2 * 60 * 60 * 1000;

type Phase = "unpaid" | "waiting" | "ringing" | "overdue";

function phaseOf(order: OrderRow): Phase {
  if (order.paymentStatus !== "PAID") return "unpaid";
  const at = order.scheduledFor ? new Date(order.scheduledFor).getTime() : 0;
  if (at && Date.now() > at + GRACE_MS) return "overdue";
  if (order.scheduleDispatchedAt || (at && Date.now() >= at - LEAD_MS)) return "ringing";
  return "waiting";
}

const PHASE_LABEL: Record<Phase, string> = {
  unpaid: "Awaiting payment",
  waiting: "Waiting for its time",
  ringing: "Ringing riders",
  overdue: "Past grace — refund due",
};
const PHASE_TONE: Record<Phase, "neutral" | "info" | "warning" | "danger"> = {
  unpaid: "neutral",
  waiting: "info",
  ringing: "warning",
  overdue: "danger",
};

const meta = (value: ColumnMeta) => value;

/** "in 25 min" / "in 3h" ahead of time, "12 min ago" once it has passed. */
function untilLabel(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return ago(value);
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `in ${hours}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`;
  return `in ${Math.round(hours / 24)}d`;
}

function RingButton({ order, size = "sm" }: { order: OrderRow; size?: "sm" | "md" }) {
  const phase = phaseOf(order);
  const ring = useAction(() => ordersApi.ringRiders(order._id), {
    success: (data) =>
      data.riders
        ? `Rang ${count(data.riders)} rider${data.riders === 1 ? "" : "s"} for ${orderNumber(order)}.`
        : `No eligible riders near ${orderNumber(order)} right now; it stays queued.`,
    invalidate: ["orders", ["order", order._id], "stats"],
  });
  // Only a paid booking inside its lead can be rung; the API refuses anything else.
  const allowed = phase === "ringing" || phase === "overdue";
  return (
    <Button
      size={size}
      variant={phase === "ringing" ? "primary" : "outline"}
      icon={BellRing}
      onClick={() => ring.mutate(undefined)}
      loading={ring.isPending}
      disabled={!allowed}
      title={
        allowed
          ? undefined
          : phase === "unpaid"
            ? "Not paid yet"
            : "Riders are rung from 30 minutes before the booked time"
      }
    >
      Ring riders
    </Button>
  );
}

export function ScheduledTab() {
  const table = useTableState({ sortBy: "scheduledFor", order: "ASC" });
  const { can } = useCan();
  const [phase, setPhase] = useState<Phase | "all">("all");

  const query = useMemo(
    () => ({
      ...table.query,
      isScheduled: true,
      status: "INITIATED",
      search: table.state.search,
      limit: table.state.limit || 50,
    }),
    [table.query, table.state.search, table.state.limit],
  );
  const data = useOrders(query, { poll: true });

  const rows = useMemo(() => {
    const all = (data.data?.items ?? []) as OrderRow[];
    return phase === "all" ? all : all.filter((o) => phaseOf(o) === phase);
  }, [data.data, phase]);
  const counts = useMemo(() => {
    const all = (data.data?.items ?? []) as OrderRow[];
    return all.reduce<Record<Phase, number>>((acc, o) => ({ ...acc, [phaseOf(o)]: acc[phaseOf(o)] + 1 }), {
      unpaid: 0,
      waiting: 0,
      ringing: 0,
      overdue: 0,
    });
  }, [data.data]);

  const columns = useMemo<ColumnDef<OrderRow, unknown>[]>(
    () => [
      {
        id: "order",
        header: "Order",
        meta: meta({ csv: { key: "orderNumber", label: "Order" } }),
        cell: ({ row }) => (
          <span className="block">
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">{orderNumber(row.original)}</span>
              <TypeBadge type={row.original.type} />
            </span>
            {row.original.title ? (
              <span className="block truncate text-[11px] text-ink-muted">{String(row.original.title)}</span>
            ) : null}
          </span>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        meta: meta({ hideBelow: "md", csv: { key: "user", label: "Customer" } }),
        cell: ({ row }) => <PartyCell party={row.original.user} fallback="Unknown" size={28} />,
      },
      {
        id: "scheduledFor",
        header: "Booked for",
        meta: meta({ sortKey: "scheduledFor", csv: { key: "scheduledFor", label: "Booked for" } }),
        cell: ({ row }) => {
          const at = row.original.scheduledFor;
          const soon = at && new Date(at).getTime() - Date.now() < LEAD_MS && new Date(at).getTime() > Date.now();
          return (
            <span className="block">
              <span className={cx("block whitespace-nowrap text-sm", soon ? "font-bold text-warning" : "text-ink")}>
                {when(at)}
              </span>
              <span className="block whitespace-nowrap text-[11px] text-ink-muted">{at ? untilLabel(at) : ""}</span>
            </span>
          );
        },
      },
      {
        id: "amount",
        header: "Paid",
        meta: meta({ align: "right", hideBelow: "lg", csv: { key: "totalAmountPayable", label: "Amount (kobo)" } }),
        cell: ({ row }) => (
          <span className="block text-right">
            <span className="block text-sm font-semibold text-ink">{naira(row.original.totalAmountPayable)}</span>
            <PaymentBadge status={row.original.paymentStatus} />
          </span>
        ),
      },
      {
        id: "phase",
        header: "Rider search",
        meta: meta({ csv: { key: "phase", label: "Rider search", value: (r) => PHASE_LABEL[phaseOf(r as OrderRow)] } }),
        cell: ({ row }) => {
          const p = phaseOf(row.original);
          const o = row.original;
          return (
            <span className="block">
              <Badge tone={PHASE_TONE[p]} dot>
                {PHASE_LABEL[p]}
              </Badge>
              {p === "ringing" && o.scheduleDispatchedAt ? (
                <span className="mt-1 block text-[11px] text-ink-muted">
                  Since {ago(o.scheduleDispatchedAt)} · {count(o.scheduleRingCount ?? 1)} ring
                  {(o.scheduleRingCount ?? 1) === 1 ? "" : "s"}
                  {o.scheduleLastRungAt ? ` · last ${ago(o.scheduleLastRungAt)}` : ""} ·{" "}
                  {count((o.offers ?? []).length)} offers
                </span>
              ) : null}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        meta: meta({ align: "right" }),
        cell: ({ row }) =>
          can("order.cancel") ? (
            <span onClick={(e) => e.stopPropagation()}>
              <RingButton order={row.original} />
            </span>
          ) : null,
      },
    ],
    [can],
  );

  return (
    <div className="space-y-4">
      <div className="admin-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(["all", "ringing", "waiting", "unpaid", "overdue"] as const).map((id) => {
          const active = phase === id;
          const n = id === "all" ? undefined : counts[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPhase(id)}
              className={cx(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-transparent bg-ink text-card"
                  : "border-line bg-card text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {id === "all" ? "All scheduled" : PHASE_LABEL[id]}
              {n ? (
                <span
                  className={cx(
                    "rounded-full px-1.5 text-[11px]",
                    active
                      ? "bg-card/20 text-card"
                      : id === "ringing" || id === "overdue"
                        ? "bg-danger-soft text-danger"
                        : "bg-line text-ink-muted",
                  )}
                >
                  {n}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <DataTable<OrderRow>
        columns={columns}
        data={(data.data ? { ...data.data, items: rows } : undefined) as Paged<OrderRow> | undefined}
        loading={data.isPending || data.isFetching}
        error={data.error ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        searchPlaceholder="Order number, customer name or phone"
        dateFilter={false}
        csvName="scheduled-orders"
        defaultSort={{ sortBy: "scheduledFor", order: "ASC" }}
        rowHref={(row) => `/orders/${row._id}`}
        mobileCard={(row) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-ink">{orderNumber(row)}</span>
              <Badge tone={PHASE_TONE[phaseOf(row)]}>{PHASE_LABEL[phaseOf(row)]}</Badge>
            </div>
            <p className="text-sm text-ink">Booked for {when(row.scheduledFor)}</p>
            <PartyCell party={row.user} fallback="Unknown" size={24} />
            {can("order.cancel") ? <RingButton order={row} size="md" /> : null}
          </div>
        )}
        emptyIcon={CalendarClock}
        emptyTitle={phase === "all" ? "No scheduled orders waiting" : `Nothing ${PHASE_LABEL[phase].toLowerCase()}`}
        emptyDescription="Customers' prepaid bookings show here until a rider accepts them."
        liveHint="Refreshes every 20s"
      />
    </div>
  );
}
