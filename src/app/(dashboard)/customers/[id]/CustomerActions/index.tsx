"use client";

import * as React from "react";
import { Ban, CheckCircle2, MinusCircle, PlusCircle, Undo2 } from "lucide-react";
import { UI } from "@/components/ui";
import { Order } from "@/services";
import { baseUnitToSubUnit, formatMoney, subUnitToBaseUnit } from "@/utils";
import {
  useAdjustCustomerWalletMn,
  useRefundCustomerOrderMn,
  useUpdateCustomerStatusMn,
} from "@/api/queries/customer";
import { Modal } from "../Modal";

type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";

export const CustomerActions = ({
  userId,
  status,
  orders,
  currency,
}: {
  userId: string;
  status?: Status;
  orders: Order[];
  currency?: string;
}) => {
  const [modal, setModal] = React.useState<null | "adjust" | "status" | "refund">(null);
  const close = () => setModal(null);

  // Adjust balance form
  const [adjustType, setAdjustType] = React.useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjustAmount, setAdjustAmount] = React.useState("");
  const [adjustReason, setAdjustReason] = React.useState("");
  const adjustMn = useAdjustCustomerWalletMn(userId);

  // Status form
  const isActive = status === "ACTIVE";
  const [nextStatus, setNextStatus] = React.useState<Status>(isActive ? "SUSPENDED" : "ACTIVE");
  const [statusReason, setStatusReason] = React.useState("");
  const statusMn = useUpdateCustomerStatusMn(userId);

  // Refund form
  const [refundOrderId, setRefundOrderId] = React.useState("");
  const [refundAmount, setRefundAmount] = React.useState("");
  const [refundReason, setRefundReason] = React.useState("");
  const refundMn = useRefundCustomerOrderMn(userId);
  const selectedOrder = orders.find((o) => o._id === refundOrderId);

  const submitAdjust = () => {
    const amount = baseUnitToSubUnit(adjustAmount);
    if (!amount || !adjustReason.trim()) return;
    adjustMn.mutate(
      { amount, type: adjustType, reason: adjustReason.trim() },
      {
        onSuccess: () => {
          setAdjustAmount("");
          setAdjustReason("");
          close();
        },
      },
    );
  };

  const submitStatus = () => {
    statusMn.mutate(
      { status: nextStatus, reason: statusReason.trim() || undefined },
      {
        onSuccess: () => {
          setStatusReason("");
          close();
        },
      },
    );
  };

  const submitRefund = () => {
    if (!refundOrderId || !refundReason.trim()) return;
    const amount = refundAmount ? baseUnitToSubUnit(refundAmount) : undefined;
    refundMn.mutate(
      { orderId: refundOrderId, amount, reason: refundReason.trim() },
      {
        onSuccess: () => {
          setRefundOrderId("");
          setRefundAmount("");
          setRefundReason("");
          close();
        },
      },
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <UI.Button variant="outline" onClick={() => setModal("adjust")}>
        <PlusCircle size={15} />
        Adjust balance
      </UI.Button>
      <UI.Button variant="outline" onClick={() => setModal("refund")}>
        <Undo2 size={15} />
        Refund order
      </UI.Button>
      <UI.Button
        variant="outline"
        className={isActive ? "text-red-500 hover:text-red-600" : "text-emerald-600 hover:text-emerald-700"}
        onClick={() => {
          setNextStatus(isActive ? "SUSPENDED" : "ACTIVE");
          setModal("status");
        }}
      >
        {isActive ? <Ban size={15} /> : <CheckCircle2 size={15} />}
        {isActive ? "Suspend" : "Activate"}
      </UI.Button>

      {/* Adjust balance */}
      <Modal
        open={modal === "adjust"}
        onClose={close}
        title="Adjust wallet balance"
        description="Manually credit or debit this customer's wallet. This is audited."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["CREDIT", "DEBIT"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAdjustType(t)}
                className={
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors " +
                  (adjustType === t
                    ? t === "CREDIT"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-red-500 bg-red-50 text-red-500"
                    : "text-muted-foreground hover:bg-muted")
                }
              >
                {t === "CREDIT" ? <PlusCircle size={15} /> : <MinusCircle size={15} />}
                {t === "CREDIT" ? "Credit" : "Debit"}
              </button>
            ))}
          </div>
          <UI.Input
            labelValue={`Amount (${currency ?? "NGN"})`}
            type="number"
            min={0}
            placeholder="0.00"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
          />
          <UI.TextArea
            placeholder="Reason (e.g. goodwill credit for delayed order)"
            value={adjustReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdjustReason(e.target.value)}
          />
          <UI.PrimaryButton
            onClick={submitAdjust}
            isLoading={adjustMn.isPending}
            disabled={!adjustAmount || !adjustReason.trim()}
          >
            {adjustType === "CREDIT" ? "Credit" : "Debit"} {adjustAmount ? formatMoney(Number(adjustAmount), { currency }) : "wallet"}
          </UI.PrimaryButton>
        </div>
      </Modal>

      {/* Status */}
      <Modal
        open={modal === "status"}
        onClose={close}
        title={isActive ? "Suspend customer" : "Update customer status"}
        description="Restrict or restore this customer's account access. This is audited."
      >
        <div className="space-y-4">
          <div>
            <UI.Label className="text-xs">Status</UI.Label>
            <UI.Select value={nextStatus} onValueChange={(v) => setNextStatus(v as Status)}>
              <UI.SelectTrigger className="mt-1 w-full">
                <UI.SelectValue />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectItem value="ACTIVE">Active</UI.SelectItem>
                <UI.SelectItem value="INACTIVE">Inactive</UI.SelectItem>
                <UI.SelectItem value="SUSPENDED">Suspended</UI.SelectItem>
                <UI.SelectItem value="BANNED">Banned</UI.SelectItem>
              </UI.SelectContent>
            </UI.Select>
          </div>
          <UI.TextArea
            placeholder="Reason (optional)"
            value={statusReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStatusReason(e.target.value)}
          />
          <UI.PrimaryButton onClick={submitStatus} isLoading={statusMn.isPending}>
            Update status
          </UI.PrimaryButton>
        </div>
      </Modal>

      {/* Refund */}
      <Modal
        open={modal === "refund"}
        onClose={close}
        title="Refund an order"
        description="Refund a paid order back to the customer's wallet. This is audited."
      >
        <div className="space-y-4">
          <div>
            <UI.Label className="text-xs">Order</UI.Label>
            <UI.Select value={refundOrderId} onValueChange={setRefundOrderId}>
              <UI.SelectTrigger className="mt-1 w-full">
                <UI.SelectValue placeholder="Select an order" />
              </UI.SelectTrigger>
              <UI.SelectContent>
                {orders.length ? (
                  orders.map((o) => (
                    <UI.SelectItem key={o._id} value={o._id}>
                      #{o.orderNumber} — {formatMoney(subUnitToBaseUnit(o.totalAmountPayable ?? 0), { currency: o.currency })}
                    </UI.SelectItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No orders found</div>
                )}
              </UI.SelectContent>
            </UI.Select>
          </div>
          {selectedOrder && (
            <p className="text-xs text-muted-foreground">
              Order value: {formatMoney(subUnitToBaseUnit(selectedOrder.totalAmountPayable ?? 0), { currency })}. Leave
              amount blank to refund in full.
            </p>
          )}
          <UI.Input
            labelValue={`Amount (${currency ?? "NGN"}) — optional`}
            type="number"
            min={0}
            placeholder="Full order value"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
          />
          <UI.TextArea
            placeholder="Reason for refund"
            value={refundReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRefundReason(e.target.value)}
          />
          <UI.PrimaryButton
            onClick={submitRefund}
            isLoading={refundMn.isPending}
            disabled={!refundOrderId || !refundReason.trim()}
          >
            Issue refund
          </UI.PrimaryButton>
        </div>
      </Modal>
    </div>
  );
};
