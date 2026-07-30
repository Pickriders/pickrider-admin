"use client";

import * as React from "react";
import { Banknote, CheckCircle2, KeyRound, Landmark, Send } from "lucide-react";
import { UI } from "@/components/ui";
import { Modal } from "@/components/UserActions/Modal";
import { baseUnitToSubUnit, formatMoney, subUnitToBaseUnit } from "@/utils";
import {
  useGetBanksQuery,
  useGetFinanceStatusQuery,
  useInitiatePayoutMn,
  useSetWithdrawalPinMn,
  useUpdateSettlementMn,
} from "@/api/queries/finance-ops";

export const FinanceOps = () => {
  const { data: status } = useGetFinanceStatusQuery();
  const [modal, setModal] = React.useState<null | "bank" | "pin" | "payout">(null);
  const close = () => setModal(null);

  const banks = useGetBanksQuery(modal === "bank");
  const settlementMn = useUpdateSettlementMn();
  const pinMn = useSetWithdrawalPinMn();
  const payoutMn = useInitiatePayoutMn();

  const [bankCode, setBankCode] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [payoutAmount, setPayoutAmount] = React.useState("");
  const [payoutPin, setPayoutPin] = React.useState("");
  const [payoutReason, setPayoutReason] = React.useState("");

  const currency = status?.currency;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Payouts & settlement</h2>
          <p className="mt-1 text-sm text-muted-foreground">Move platform funds to your settlement bank account.</p>
        </div>
        <UI.Button onClick={() => setModal("payout")} disabled={!status?.hasBank || !status?.hasPin}>
          <Send size={15} /> Initiate payout
        </UI.Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-surface p-4">
          <p className="text-xs text-muted-foreground">Available balance</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {formatMoney(subUnitToBaseUnit(status?.balance ?? 0), { currency })}
          </p>
        </div>

        <button onClick={() => setModal("bank")} className="rounded-xl border bg-surface p-4 text-left hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-dark">
              <Landmark size={16} />
            </span>
            {status?.hasBank && <CheckCircle2 size={16} className="text-emerald-500" />}
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {status?.settlement ? status.settlement.bankName : "Add settlement bank"}
          </p>
          <p className="text-xs text-muted-foreground">
            {status?.settlement ? `${status.settlement.accountName} · ${status.settlement.accountNumberMasked}` : "Not set"}
          </p>
        </button>

        <button onClick={() => setModal("pin")} className="rounded-xl border bg-surface p-4 text-left hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-dark">
              <KeyRound size={16} />
            </span>
            {status?.hasPin && <CheckCircle2 size={16} className="text-emerald-500" />}
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">Withdrawal PIN</p>
          <p className="text-xs text-muted-foreground">{status?.hasPin ? "Set — tap to change" : "Not set — required for payouts"}</p>
        </button>
      </div>

      {/* Add bank */}
      <Modal open={modal === "bank"} onClose={close} title="Settlement bank account" description="Verified with Paystack and used for payouts.">
        <div className="space-y-4">
          <div>
            <UI.Label className="text-xs">Bank</UI.Label>
            <UI.Select value={bankCode} onValueChange={setBankCode}>
              <UI.SelectTrigger className="mt-1 w-full">
                <UI.SelectValue placeholder={banks.isLoading ? "Loading banks..." : "Select bank"} />
              </UI.SelectTrigger>
              <UI.SelectContent className="max-h-64">
                {(banks.data ?? []).map((b) => (
                  <UI.SelectItem key={b.code} value={b.code}>
                    {b.name}
                  </UI.SelectItem>
                ))}
              </UI.SelectContent>
            </UI.Select>
          </div>
          <UI.Input
            labelValue="Account number"
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <UI.PrimaryButton
            onClick={() => settlementMn.mutate({ accountNumber, bankCode }, { onSuccess: close })}
            isLoading={settlementMn.isPending}
            disabled={!bankCode || accountNumber.length < 10}
          >
            <Banknote size={16} /> Verify & save
          </UI.PrimaryButton>
        </div>
      </Modal>

      {/* Set PIN */}
      <Modal open={modal === "pin"} onClose={close} title="Withdrawal PIN" description="A 4-digit PIN gates every payout.">
        <div className="space-y-4">
          <UI.Input
            labelValue="New 4-digit PIN"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
          <UI.PrimaryButton
            onClick={() => pinMn.mutate({ pin }, { onSuccess: () => { setPin(""); close(); } })}
            isLoading={pinMn.isPending}
            disabled={pin.length !== 4}
          >
            Save PIN
          </UI.PrimaryButton>
        </div>
      </Modal>

      {/* Initiate payout */}
      <Modal open={modal === "payout"} onClose={close} title="Initiate payout" description="Transfers to your settlement account.">
        <div className="space-y-4">
          <UI.Input
            labelValue={`Amount (${currency ?? "NGN"})`}
            type="number"
            min={0}
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
          />
          <UI.Input labelValue="Note (optional)" value={payoutReason} onChange={(e) => setPayoutReason(e.target.value)} />
          <UI.Input
            labelValue="Withdrawal PIN"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={payoutPin}
            onChange={(e) => setPayoutPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
          <UI.PrimaryButton
            onClick={() =>
              payoutMn.mutate(
                { amount: baseUnitToSubUnit(payoutAmount), pin: payoutPin, reason: payoutReason.trim() || undefined },
                {
                  onSuccess: () => {
                    setPayoutAmount("");
                    setPayoutPin("");
                    setPayoutReason("");
                    close();
                  },
                },
              )
            }
            isLoading={payoutMn.isPending}
            disabled={!payoutAmount || payoutPin.length !== 4}
          >
            Send {payoutAmount ? formatMoney(Number(payoutAmount), { currency }) : "payout"}
          </UI.PrimaryButton>
        </div>
      </Modal>
    </div>
  );
};
