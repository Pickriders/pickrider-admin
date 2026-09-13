"use client";

import { CheckCircle2, KeyRound, Landmark, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { finance, type FinanceStatus, type Wallet as WalletModel } from "@/lib/admin/api";
import { useAction, useBanks } from "@/lib/admin/hooks";
import { naira } from "@/lib/admin/format";
import { Badge, Button, Drawer, Field, Input, Panel, Select, Skeleton, StatCard } from "@/components/kit";

/**
 * The three things every payout depends on: the platform balance, a verified
 * settlement account and a withdrawal PIN. Shared by the Overview and Payout
 * tabs so the setup can be fixed from wherever the admin notices it missing.
 */
type Bank = { name: string; code: string };

function asBanks(value: Bank[] | { data?: Bank[] } | undefined | null): Bank[] {
  if (!value) return [];
  return Array.isArray(value) ? value : (value.data ?? []);
}

export function WalletHero({ status, wallet, loading }: { status?: FinanceStatus; wallet?: WalletModel; loading: boolean }) {
  const balance = status?.balance ?? wallet?.balance;
  const currency = status?.currency ?? wallet?.currency ?? "NGN";
  const state = wallet?.status ? String(wallet.status).toLowerCase() : "";
  return (
    <StatCard
      tone="brand"
      label="Platform wallet"
      value={naira(balance, 2)}
      icon={Wallet}
      loading={loading}
      hint={[currency, state ? `wallet ${state}` : null].filter(Boolean).join(" · ")}
    />
  );
}

export function SettlementCard({ status, loading, onChange }: { status?: FinanceStatus; loading: boolean; onChange: () => void }) {
  const s = status?.settlement;
  return (
    <Panel className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark">
          <Landmark size={18} />
        </span>
        {loading ? null : s ? (
          <Badge tone={s.isVerified ? "success" : "warning"} dot>
            {s.isVerified ? "Verified" : "Not verified"}
          </Badge>
        ) : (
          <Badge tone="danger" dot>
            Not set
          </Badge>
        )}
      </div>
      <p className="mt-3 text-xs font-semibold text-ink-muted">Settlement account</p>
      {loading ? (
        <div className="mt-2 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : s ? (
        <>
          <p className="mt-1 truncate text-base font-bold text-ink">{s.bankName ?? "Bank"}</p>
          <p className="truncate text-xs text-ink-muted">
            {s.accountName ?? "Account"} · <span className="font-mono">{s.accountNumberMasked}</span>
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm text-ink-muted">Payouts need a bank account to land in. Add one to unlock them.</p>
      )}
      <div className="mt-auto pt-4">
        <Button size="sm" variant={s ? "outline" : "primary"} onClick={onChange}>
          {s ? "Change" : "Add account"}
        </Button>
      </div>
    </Panel>
  );
}

export function PinCard({ status, loading, onChange }: { status?: FinanceStatus; loading: boolean; onChange: () => void }) {
  const hasPin = Boolean(status?.hasPin);
  return (
    <Panel className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark">
          <KeyRound size={18} />
        </span>
        {loading ? null : hasPin ? (
          <Badge tone="success" dot>
            Set
          </Badge>
        ) : (
          <Badge tone="danger" dot>
            Not set
          </Badge>
        )}
      </div>
      <p className="mt-3 text-xs font-semibold text-ink-muted">Withdrawal PIN</p>
      {loading ? (
        <div className="mt-2 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ) : (
        <>
          <p className="mt-1 text-base font-bold text-ink">{hasPin ? "4 digit PIN in place" : "No PIN yet"}</p>
          <p className="text-xs text-ink-muted">
            {hasPin ? "Every payout and transfer asks for it." : "Required before any money can leave the wallet."}
          </p>
        </>
      )}
      <div className="mt-auto pt-4">
        <Button size="sm" variant={hasPin ? "outline" : "primary"} onClick={onChange}>
          {hasPin ? "Change PIN" : "Set PIN"}
        </Button>
      </div>
    </Panel>
  );
}

export function SettlementDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const banks = useBanks(open);
  const list = useMemo(() => asBanks(banks.data), [banks.data]);
  const [bankFilter, setBankFilter] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    if (!open) {
      setBankFilter("");
      setBankCode("");
      setAccountNumber("");
    }
  }, [open]);

  const visible = useMemo(() => {
    const q = bankFilter.trim().toLowerCase();
    return q ? list.filter((b) => b.name.toLowerCase().includes(q)) : list;
  }, [list, bankFilter]);

  const save = useAction(finance.updateSettlement, {
    success: (data) => {
      const name = (data as { accountName?: string } | undefined)?.accountName;
      return name ? `Settlement account saved for ${name}` : "Settlement account saved";
    },
    invalidate: ["finance"],
    onSuccess: onClose,
  });

  const ready = Boolean(bankCode) && /^\d{10}$/.test(accountNumber);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Settlement account"
      subtitle="Resolved with Paystack, then used for every payout."
      width="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button icon={CheckCircle2} loading={save.isPending} disabled={!ready} onClick={() => save.mutate({ accountNumber, bankCode })}>
            Verify and save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Find a bank" hint={banks.isLoading ? "Loading banks" : `${list.length} banks available`}>
          <Input value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} placeholder="Type to narrow the list" />
        </Field>
        <Field label="Bank" error={banks.isError ? "Banks could not be loaded. Close and try again." : undefined}>
          <Select value={bankCode} onChange={(e) => setBankCode(e.target.value)} disabled={banks.isLoading}>
            <option value="">{banks.isLoading ? "Loading" : "Select a bank"}</option>
            {visible.map((bank) => (
              <option key={`${bank.code}-${bank.name}`} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Account number" hint="10 digits. The account name is confirmed by the bank before saving.">
          <Input
            inputMode="numeric"
            maxLength={10}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="0123456789"
          />
        </Field>
      </div>
    </Drawer>
  );
}

export function PinDrawer({ open, onClose, hasPin }: { open: boolean; onClose: () => void; hasPin: boolean }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!open) {
      setPin("");
      setConfirm("");
    }
  }, [open]);

  const save = useAction(finance.setPin, { success: hasPin ? "Withdrawal PIN changed" : "Withdrawal PIN set", invalidate: ["finance"], onSuccess: onClose });
  const mismatch = confirm.length === 4 && pin !== confirm;
  const ready = pin.length === 4 && pin === confirm;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={hasPin ? "Change withdrawal PIN" : "Set withdrawal PIN"}
      subtitle="Four digits. Asked for on every payout and transfer."
      width="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button loading={save.isPending} disabled={!ready} onClick={() => save.mutate({ pin })}>
            Save PIN
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="New PIN">
          <Input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
          />
        </Field>
        <Field label="Repeat PIN" error={mismatch ? "The two PINs do not match." : undefined}>
          <Input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
          />
        </Field>
      </div>
    </Drawer>
  );
}
