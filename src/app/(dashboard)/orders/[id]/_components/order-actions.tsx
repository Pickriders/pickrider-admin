"use client";

import { Ban, BellRing, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button, ConfirmDialog, Drawer, Field, Select, Textarea } from "@/components/kit";
import { orders, type OrderRow, type OrderStatus } from "@/lib/admin/api";
import { statusLabel } from "@/lib/admin/format";
import { useAction } from "@/lib/admin/hooks";

import { STATUS_OVERRIDES, STATUS_OVERRIDE_HINT } from "../../lib";
import { useCan } from "@/lib/admin/use-can";

/**
 * The two things an admin can do to an order. Cancel runs the real cancel flow (refund + rider
 * settlement, audited). The status override runs the matching side effects on the API — start
 * time, rider settlement on completion, releasing the rider — so it only offers steps the
 * delivery could have taken, and never "cancelled": that must go through Cancel so money moves.
 */
export function OrderActions({ order }: { order: OrderRow }) {
  const closed = order.status === "COMPLETED" || order.status === "CANCELLED";
  const { can } = useCan();
  const options = can("order.overrideStatus") ? (STATUS_OVERRIDES[order.status] ?? []) : [];
  const invalidate = [["order", order._id], ["order-offers", order._id], ["orders"], ["stats"]];

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const cancel = useAction((vars: { reason: string }) => orders.cancel(order._id, vars), {
    success: "Order cancelled. The customer has been refunded.",
    invalidate,
    onSuccess: () => {
      setCancelOpen(false);
      setReason("");
    },
  });

  // Ring riders again for an order still waiting (a scheduled one must be paid and inside its lead).
  const waitingOnSchedule =
    order.isScheduled &&
    !order.scheduleDispatchedAt &&
    order.scheduledFor &&
    new Date(order.scheduledFor).getTime() - Date.now() > 30 * 60 * 1000;
  const canRing =
    order.status === "INITIATED" &&
    can("order.cancel") &&
    (!order.isScheduled || order.paymentStatus === "PAID") &&
    !waitingOnSchedule;
  const ring = useAction(() => orders.ringRiders(order._id), {
    success: (data) =>
      data.riders
        ? `Rang ${data.riders} rider${data.riders === 1 ? "" : "s"}.`
        : "No eligible riders nearby right now; the order stays queued.",
    invalidate,
  });

  const [statusOpen, setStatusOpen] = useState(false);
  const [next, setNext] = useState<OrderStatus | "">("");
  const update = useAction((vars: { status: OrderStatus }) => orders.updateStatus(order._id, vars), {
    success: (_, vars) => `Order marked ${statusLabel(vars.status).toLowerCase()}.`,
    invalidate,
    onSuccess: () => {
      setStatusOpen(false);
      setNext("");
    },
  });

  return (
    <>
      {options.length ? (
        <Button variant="outline" icon={SlidersHorizontal} onClick={() => setStatusOpen(true)}>
          Update status
        </Button>
      ) : null}
      {canRing ? (
        <Button icon={BellRing} onClick={() => ring.mutate(undefined)} loading={ring.isPending}>
          Ring riders
        </Button>
      ) : null}
      {!closed && can("order.cancel") ? (
        <Button variant="danger" icon={Ban} onClick={() => setCancelOpen(true)}>
          Cancel order
        </Button>
      ) : null}

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => (cancel.isPending ? undefined : setCancelOpen(false))}
        onConfirm={() => reason.trim() && cancel.mutate({ reason: reason.trim() })}
        title="Cancel this order?"
        description="The customer is refunded to their wallet and any rider earnings so far are settled. This is audited and cannot be undone."
        confirmLabel="Cancel and refund"
        tone="danger"
        loading={cancel.isPending}
      >
        <Field label="Reason" hint="Shown in the audit log and to the customer.">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this order being cancelled?"
            autoFocus
          />
        </Field>
        {!reason.trim() ? <p className="mt-2 text-xs text-ink-faint">A reason is required.</p> : null}
      </ConfirmDialog>

      <Drawer
        open={statusOpen}
        onClose={() => (update.isPending ? undefined : setStatusOpen(false))}
        title="Update order status"
        subtitle="Moves the order the way the app would have, including paying the rider on completion. Cancelling stays under Cancel order."
        width="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setStatusOpen(false)} disabled={update.isPending}>
              Keep as is
            </Button>
            <Button onClick={() => next && update.mutate({ status: next })} disabled={!next} loading={update.isPending}>
              Update status
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Current status">
            <p className="text-sm font-semibold text-ink">{statusLabel(order.status)}</p>
          </Field>
          <Field label="New status" hint="To cancel with a refund, use Cancel order instead.">
            <Select value={next} onChange={(e) => setNext(e.target.value as OrderStatus | "")}>
              <option value="">Choose a status</option>
              {options.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </Select>
          </Field>
          {next ? (
            <p className="rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
              {STATUS_OVERRIDE_HINT[next]}
            </p>
          ) : null}
          {next === "COMPLETED" && order.paymentStatus !== "PAID" ? (
            <p className="rounded-xl border border-warning/40 bg-warning-soft px-3 py-2 text-xs text-warning">
              This order has not been paid for. Completion will be refused until it is.
            </p>
          ) : null}
        </div>
      </Drawer>
    </>
  );
}
