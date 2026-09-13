"use client";

import { Landmark, Send } from "lucide-react";
import { useState } from "react";

import { finance } from "@/lib/admin/api";
import { useAction, useFinanceStatus, usePlatformWallet } from "@/lib/admin/hooks";
import { naira } from "@/lib/admin/format";
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Field, Input, KeyValue, Panel, PanelHeader, Skeleton, Textarea } from "@/components/kit";
import { PinCard, PinDrawer, SettlementCard, SettlementDrawer, WalletHero } from "./finance-setup";
import { toKobo } from "./lib";

/**
 * Moves money from the platform wallet to the settlement bank account. The
 * amount is typed in naira and sent in kobo; the confirm step restates it so
 * a slipped decimal is caught before anything leaves the wallet.
 */
export function PayoutTab() {
  const status = useFinanceStatus();
  const wallet = usePlatformWallet();
  const [drawer, setDrawer] = useState<null | "bank" | "pin">(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");
  const [confirming, setConfirming] = useState(false);

  const s = status.data;
  const balance = s?.balance ?? wallet.data?.balance ?? 0;
  const kobo = toKobo(amount);
  const overBalance = kobo != null && kobo > balance;
  const amountError = amount && kobo == null ? "Enter an amount above zero." : overBalance ? `More than the wallet holds (${naira(balance, 2)}).` : undefined;
  const ready = kobo != null && !overBalance && pin.length === 4;

  const payout = useAction(finance.payout, {
    success: (data) => {
      const ref = (data as { reference?: string } | undefined)?.reference;
      return ref ? `Payout of ${naira(kobo, 2)} initiated (${ref})` : `Payout of ${naira(kobo, 2)} initiated`;
    },
    invalidate: ["finance", "transactions", "stats"],
    onSuccess: () => {
      setConfirming(false);
      setAmount("");
      setReason("");
      setPin("");
    },
  });

  if (status.isError) {
    return <ErrorState message="The platform finance status could not be loaded." onRetry={() => void status.refetch()} />;
  }

  const blocked = !status.isLoading && (!s?.hasBank || !s?.hasPin);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
        <WalletHero status={s} wallet={wallet.data} loading={status.isLoading && wallet.isLoading} />
        <SettlementCard status={s} loading={status.isLoading} onChange={() => setDrawer("bank")} />
        <PinCard status={s} loading={status.isLoading} onChange={() => setDrawer("pin")} />
      </div>

      {status.isLoading ? (
        <Panel className="p-5">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="mt-3 h-10 w-full" />
          <Skeleton className="mt-3 h-10 w-full" />
        </Panel>
      ) : blocked ? (
        <Panel>
          <EmptyState
            icon={Landmark}
            title="Payouts are not ready yet"
            description={
              !s?.hasBank && !s?.hasPin
                ? "Add a settlement account and set a withdrawal PIN above, then come back here."
                : !s?.hasBank
                  ? "Add a settlement account above so the money has somewhere to go."
                  : "Set a withdrawal PIN above. Every payout is gated by it."
            }
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {!s?.hasBank ? (
                  <Button size="sm" onClick={() => setDrawer("bank")}>
                    Add settlement account
                  </Button>
                ) : null}
                {!s?.hasPin ? (
                  <Button size="sm" variant={s?.hasBank ? "primary" : "outline"} onClick={() => setDrawer("pin")}>
                    Set PIN
                  </Button>
                ) : null}
              </div>
            }
          />
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            title="Initiate a payout"
            subtitle="Sent to the settlement account through Paystack. It shows up under Withdrawals while it processes."
            action={s?.settlement?.isVerified ? <Badge tone="success" dot>Account verified</Badge> : <Badge tone="warning" dot>Account not verified</Badge>}
          />
          <div className="grid grid-cols-1 gap-6 px-5 pb-5 pt-4 lg:grid-cols-[1fr_280px]">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (ready) setConfirming(true);
              }}
            >
              <Field
                label="Amount in naira"
                error={amountError}
                hint={kobo != null && !amountError ? `Sends ${naira(kobo, 2)}` : `Available: ${naira(balance, 2)}`}
              >
                <span className="flex gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <Button type="button" variant="outline" onClick={() => setAmount((balance / 100).toFixed(2))} disabled={!balance}>
                    Max
                  </Button>
                </span>
              </Field>
              <Field label="Note (optional)" hint="Kept on the ledger next to the payout.">
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Weekly settlement" maxLength={200} />
              </Field>
              <Field label="Withdrawal PIN">
                <Input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="max-w-[160px]"
                />
              </Field>
              <Button type="submit" icon={Send} disabled={!ready} loading={payout.isPending}>
                Review payout
              </Button>
            </form>

            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-faint">Destination</p>
              <KeyValue
                columns={1}
                items={[
                  { label: "Bank", value: s?.settlement?.bankName },
                  { label: "Account name", value: s?.settlement?.accountName },
                  { label: "Account number", value: <span className="font-mono">{s?.settlement?.accountNumberMasked}</span> },
                ]}
              />
              <Button size="sm" variant="ghost" className="mt-3" onClick={() => setDrawer("bank")}>
                Change account
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          if (kobo == null) return;
          payout.mutate({ amount: kobo, pin, reason: reason.trim() || undefined });
        }}
        title={`Send ${naira(kobo, 2)}?`}
        description={`This moves ${naira(kobo, 2)} from the platform wallet to ${s?.settlement?.bankName ?? "the settlement bank"} ${s?.settlement?.accountNumberMasked ?? ""} (${s?.settlement?.accountName ?? "settlement account"}). It cannot be pulled back once Paystack accepts it.`}
        confirmLabel="Send payout"
        loading={payout.isPending}
      >
        <KeyValue
          columns={2}
          items={[
            { label: "Amount", value: naira(kobo, 2) },
            { label: "Balance after", value: naira(balance - (kobo ?? 0), 2) },
            ...(reason.trim() ? [{ label: "Note", value: reason.trim() }] : []),
          ]}
        />
      </ConfirmDialog>

      <SettlementDrawer open={drawer === "bank"} onClose={() => setDrawer(null)} />
      <PinDrawer open={drawer === "pin"} onClose={() => setDrawer(null)} hasPin={Boolean(s?.hasPin)} />
    </div>
  );
}
