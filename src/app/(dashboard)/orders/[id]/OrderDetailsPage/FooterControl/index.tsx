"use client";

import { Order } from "@/services";
import dayjs from "dayjs";

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

export const FooterControl = ({ order }: { order?: Order }) => {
  const status = STATUS[order?.status ?? "INITIATED"] ?? STATUS.INITIATED;
  const payment = PAYMENT[order?.paymentStatus ?? "PENDING"] ?? PAYMENT.PENDING;

  return (
    <div className="rounded-2xl border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-bold"
          style={{ color: status.color, backgroundColor: `${status.color}1a` }}
        >
          {status.label}
        </span>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-bold"
          style={{ color: payment.color, backgroundColor: `${payment.color}1a` }}
        >
          {payment.label}
        </span>
        {order?.completedAt && (
          <span className="text-[11px] text-muted-foreground">
            Completed {dayjs(order.completedAt).format("DD MMM YYYY, HH:mm")}
          </span>
        )}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Order lifecycle actions (complete, cancel, reassign) are driven by the app and dispatch engine to keep payments
        and rider assignment consistent.
      </p>
    </div>
  );
};
