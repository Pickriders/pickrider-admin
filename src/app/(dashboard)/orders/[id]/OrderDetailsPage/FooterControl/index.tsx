"use client";

import * as React from "react";
import { Order } from "@/services";
import dayjs from "dayjs";
import { Ban, SlidersHorizontal } from "lucide-react";
import { UI } from "@/components/ui";
import { Modal } from "@/components/UserActions/Modal";
import { useAdminCancelOrderMn, useAdminUpdateOrderStatusMn } from "@/api/queries/orders";

const STATUS: Record<string, { label: string; color: string }> = {
  INITIATED: { label: "Awaiting a rider", color: "#DBAD0E" },
  ACCEPTED: { label: "Rider assigned", color: "#2282C8" },
  ON_GOING: { label: "In transit", color: "#3E7DF6" },
  COMPLETED: { label: "Completed", color: "#32BA7C" },
  CANCELLED: { label: "Cancelled", color: "#FF5244" },
};

const PAYMENT: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Payment pending", color: "#DBAD0E" },
  PAID: { label: "Paid", color: "#32BA7C" },
  FAILED: { label: "Payment failed", color: "#FF5244" },
};

const STATUS_OPTIONS = ["INITIATED", "ACCEPTED", "ON_GOING", "COMPLETED", "CANCELLED"];

export const FooterControl = ({ order }: { order?: Order }) => {
  const status = STATUS[order?.status ?? "INITIATED"] ?? STATUS.INITIATED;
  const payment = PAYMENT[order?.paymentStatus ?? "PENDING"] ?? PAYMENT.PENDING;
  const orderId = order?._id ?? "";
  const closed = order?.status === "CANCELLED" || order?.status === "COMPLETED";

  const [modal, setModal] = React.useState<null | "cancel" | "status">(null);
  const close = () => setModal(null);
  const [reason, setReason] = React.useState("");
  const [nextStatus, setNextStatus] = React.useState(order?.status ?? "INITIATED");

  const cancelMn = useAdminCancelOrderMn(orderId);
  const statusMn = useAdminUpdateOrderStatusMn(orderId);

  return (
    <div className="rounded-2xl border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ color: status.color, backgroundColor: `${status.color}1a` }}>
            {status.label}
          </span>
          <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ color: payment.color, backgroundColor: `${payment.color}1a` }}>
            {payment.label}
          </span>
          {order?.completedAt && (
            <span className="text-[11px] text-muted-foreground">
              Completed {dayjs(order.completedAt).format("DD MMM YYYY, HH:mm")}
            </span>
          )}
        </div>

        {orderId && (
          <div className="flex items-center gap-2">
            <UI.Button variant="outline" size="sm" onClick={() => setModal("status")}>
              <SlidersHorizontal size={13} /> Override status
            </UI.Button>
            {!closed && (
              <UI.Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => setModal("cancel")}>
                <Ban size={13} /> Cancel order
              </UI.Button>
            )}
          </div>
        )}
      </div>

      <Modal
        open={modal === "cancel"}
        onClose={close}
        title="Cancel order"
        description="Cancels the order and refunds the customer's wallet. This is audited."
      >
        <div className="space-y-4">
          <UI.TextArea
            placeholder="Reason for cancellation"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
          />
          <UI.PrimaryButton
            variant="destructive"
            onClick={() => cancelMn.mutate({ reason: reason.trim() }, { onSuccess: () => { setReason(""); close(); } })}
            isLoading={cancelMn.isPending}
            disabled={!reason.trim()}
          >
            Cancel & refund
          </UI.PrimaryButton>
        </div>
      </Modal>

      <Modal open={modal === "status"} onClose={close} title="Override order status" description="Manual correction — use with care. Audited.">
        <div className="space-y-4">
          <UI.Select value={nextStatus} onValueChange={(v) => setNextStatus(v as Order["status"])}>
            <UI.SelectTrigger className="w-full">
              <UI.SelectValue />
            </UI.SelectTrigger>
            <UI.SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <UI.SelectItem key={s} value={s}>
                  {STATUS[s]?.label ?? s}
                </UI.SelectItem>
              ))}
            </UI.SelectContent>
          </UI.Select>
          <UI.PrimaryButton onClick={() => statusMn.mutate({ status: nextStatus }, { onSuccess: close })} isLoading={statusMn.isPending}>
            Update status
          </UI.PrimaryButton>
        </div>
      </Modal>
    </div>
  );
};
