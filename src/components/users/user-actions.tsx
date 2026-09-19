"use client";

import { Ban, MinusCircle, PauseCircle, Phone, PlayCircle, PlusCircle, Search, ShieldAlert, Undo2, Wallet as WalletIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge, Button, ConfirmDialog, Drawer, Field, Input, Select, Skeleton, Textarea, cx, useDebounced } from "@/components/kit";
import { users, type RefundableOrder, type TransactionType, type User, type UserStatus, type Wallet } from "@/lib/admin/api";
import { fullName, naira, when } from "@/lib/admin/format";
import { useAction, useRefundableOrders } from "@/lib/admin/hooks";
import { useCan } from "@/lib/admin/use-can";

/**
 * The admin actions every user record shares: account status, manual wallet
 * adjustment, order refund, phone change and (riders only) the dispatch
 * pause. Each one is a small form in a drawer or a confirm dialog and
 * refreshes the queries it touches.
 */
export type UserActionKind = "status" | "wallet" | "refund" | "phone" | "dispatch";

const USER_STATUSES: { value: UserStatus; label: string; hint: string }[] = [
  { value: "ACTIVE", label: "Active", hint: "Full access to the app." },
  { value: "INACTIVE", label: "Inactive", hint: "Cannot sign in until reactivated." },
  { value: "SUSPENDED", label: "Suspended", hint: "Blocked for now, can be restored later." },
  { value: "BANNED", label: "Banned", hint: "Permanently blocked from the platform." },
];

const TYPE_ACTIVE: Record<TransactionType, string> = {
  CREDIT: "border-success bg-success-soft text-success",
  DEBIT: "border-danger bg-danger-soft text-danger",
};

/** Shows a stored phone the way people read it: always with the plus. */
export function phoneLabel(phone: string | null | undefined) {
  if (!phone) return "";
  return phone.startsWith("+") ? phone : `+${phone}`;
}

/**
 * Accepts the ways a Nigerian number gets typed (0803..., 234803..., +234803...)
 * and returns E.164, or the digits as typed when they are some other valid
 * international number. Null when it cannot be a phone number.
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (/^0\d{10}$/.test(digits)) return `+234${digits.slice(1)}`;
  if (/^234\d{10}$/.test(digits)) return `+${digits}`;
  if (/^\+234\d{10}$/.test(digits)) return digits;
  if (/^\+?\d{10,15}$/.test(digits)) return digits;
  return null;
}

/** Query keys refreshed after any user action. */
export function userInvalidations(userId: string) {
  return [["stats", "user-overview"], ["user", userId], ["user-wallets", userId], "customers", "users", "transactions", "orders", ["stats", "attention"]];
}

export function UserActions({
  user,
  wallet,
  showRefund,
  showDispatch,
  size = "md",
}: {
  user: User;
  wallet?: Wallet | null;
  showRefund?: boolean;
  showDispatch?: boolean;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState<UserActionKind | null>(null);
  const close = () => setOpen(null);
  const isActive = user.status === "ACTIVE";
  const paused = Boolean(user.dispatchPaused);
  const { can } = useCan();

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center xl:justify-end [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*]:w-auto">
        {showDispatch && can("user.dispatch") ? (
          <Button
            size={size}
            variant={paused ? "success" : "outline"}
            icon={paused ? PlayCircle : PauseCircle}
            onClick={() => setOpen("dispatch")}
          >
            {paused ? "Resume dispatch" : "Stop ringing"}
          </Button>
        ) : null}
        {can("wallet.adjust") ? (
          <Button size={size} variant="outline" icon={WalletIcon} onClick={() => setOpen("wallet")}>
            Adjust wallet
          </Button>
        ) : null}
        {showRefund && can("wallet.refund") ? (
          <Button size={size} variant="outline" icon={Undo2} onClick={() => setOpen("refund")}>
            Refund order
          </Button>
        ) : null}
        {can("user.phone") ? (
          <Button size={size} variant="outline" icon={Phone} onClick={() => setOpen("phone")}>
            Change phone
          </Button>
        ) : null}
        {can("user.status") ? (
          <Button
            size={size}
            variant="outline"
            icon={isActive ? Ban : ShieldAlert}
            className={isActive ? "text-danger" : "text-success"}
            onClick={() => setOpen("status")}
          >
            {isActive ? "Suspend" : "Change status"}
          </Button>
        ) : null}
      </div>

      <StatusDrawer user={user} open={open === "status"} onClose={close} />
      <WalletDrawer user={user} wallet={wallet} open={open === "wallet"} onClose={close} />
      {showRefund ? <RefundDrawer user={user} open={open === "refund"} onClose={close} /> : null}
      <PhoneDrawer user={user} open={open === "phone"} onClose={close} />
      {showDispatch ? <DispatchDialog user={user} open={open === "dispatch"} onClose={close} /> : null}
    </>
  );
}

// ── Status ────────────────────────────────────────────────────────────────────

export function StatusDrawer({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<UserStatus>(user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE");
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) {
      setStatus(user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE");
      setReason("");
    }
  }, [open, user.status]);

  const action = useAction((body: { status: UserStatus; reason?: string }) => users.updateStatus(user._id, body), {
    success: (_, vars) => `Status set to ${vars.status.toLowerCase()}`,
    invalidate: userInvalidations(user._id),
    onSuccess: onClose,
  });
  const destructive = status === "SUSPENDED" || status === "BANNED";
  const option = USER_STATUSES.find((s) => s.value === status);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="sm"
      title="Change account status"
      subtitle={`${fullName(user) || "This user"} is currently ${user.status.toLowerCase()}. This change is audited.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={action.isPending}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            loading={action.isPending}
            disabled={status === user.status}
            onClick={() => action.mutate({ status, reason: reason.trim() || undefined })}
          >
            {option?.label ? `Set ${option.label.toLowerCase()}` : "Update"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="New status" hint={option?.hint}>
          <Select value={status} onChange={(e) => setStatus(e.target.value as UserStatus)}>
            {USER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Reason" hint="Optional, kept in the audit log.">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this changing?" />
        </Field>
      </div>
    </Drawer>
  );
}

// ── Wallet adjustment ─────────────────────────────────────────────────────────

export function WalletDrawer({
  user,
  wallet,
  open,
  onClose,
}: {
  user: User;
  wallet?: Wallet | null;
  open: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<TransactionType>("CREDIT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) {
      setType("CREDIT");
      setAmount("");
      setReason("");
    }
  }, [open]);

  const kobo = Math.round(Number(amount) * 100);
  const balance = wallet?.balance ?? 0;
  // A debit can't take the wallet below zero; the API refuses it too, so say so before the click.
  const overdrawn = type === "DEBIT" && kobo > balance;
  const valid = Number.isFinite(kobo) && kobo > 0 && reason.trim().length > 0 && !overdrawn;
  const next = type === "CREDIT" ? balance + kobo : balance - kobo;

  const action = useAction((body: { amount: number; type: TransactionType; reason: string }) => users.adjustWallet(user._id, body), {
    success: (_, vars) => `${vars.type === "CREDIT" ? "Credited" : "Debited"} ${naira(vars.amount)}`,
    // Both legs are recorded: the user's wallet and the platform wallet move together.
    invalidate: [...userInvalidations(user._id), ["finance", "platform-wallet"], "transactions"],
    onSuccess: onClose,
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="sm"
      title="Adjust wallet"
      subtitle="A credit comes out of the platform wallet; a debit goes back into it. Both legs are recorded and audited."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={action.isPending}>
            Cancel
          </Button>
          <Button
            variant={type === "DEBIT" ? "danger" : "primary"}
            loading={action.isPending}
            disabled={!valid}
            onClick={() => action.mutate({ amount: kobo, type, reason: reason.trim() })}
          >
            {type === "CREDIT" ? "Credit" : "Debit"} {kobo > 0 ? naira(kobo) : "wallet"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
          <p className="text-xs font-semibold text-ink-muted">Current balance</p>
          <p className="mt-0.5 text-lg font-black tracking-tight text-ink">{naira(balance)}</p>
          {wallet?.status ? <p className="mt-0.5 text-xs text-ink-faint">Wallet {String(wallet.status).toLowerCase()}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["CREDIT", "DEBIT"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cx(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                type === t ? TYPE_ACTIVE[t] : "border-line text-ink-muted hover:bg-surface",
              )}
            >
              {t === "CREDIT" ? <PlusCircle size={15} /> : <MinusCircle size={15} />}
              {t === "CREDIT" ? "Credit" : "Debit"}
            </button>
          ))}
        </div>
        <Field
          label="Amount (naira)"
          hint={kobo > 0 && !overdrawn ? `Balance after: ${naira(next)}` : "Type the amount in naira, for example 1500."}
          error={overdrawn ? `Only ${naira(balance)} is available to debit.` : undefined}
        >
          <Input type="number" min={0} step="0.01" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Reason" hint="Required. Shown in the audit log.">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Goodwill credit for a delayed order" />
        </Field>
      </div>
    </Drawer>
  );
}

// ── Refund ────────────────────────────────────────────────────────────────────

export function RefundDrawer({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const [orderId, setOrderId] = useState("");
  const [term, setTerm] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) {
      setOrderId("");
      setTerm("");
      setAmount("");
      setReason("");
    }
  }, [open]);

  // Only fetched while the drawer is open. The API already limits this to orders paid on the wallet
  // and reports what has gone back, so an unpaid or already-refunded order can't be picked.
  const debounced = useDebounced(term.trim(), 300);
  const refundable = useRefundableOrders(user._id, open, debounced);
  const orders = useMemo(() => refundable.data ?? [], [refundable.data]);
  const [chosen, setChosen] = useState<RefundableOrder | null>(null);
  const selected = chosen && chosen._id === orderId ? chosen : orders.find((o) => o._id === orderId) ?? null;
  const kobo = amount ? Math.round(Number(amount) * 100) : undefined;
  const maxKobo = selected?.refundable ?? 0;
  const amountOk = kobo === undefined || (Number.isFinite(kobo) && kobo > 0 && kobo <= maxKobo);
  const valid = Boolean(selected) && maxKobo > 0 && reason.trim().length > 0 && amountOk;

  const action = useAction((body: { orderId: string; amount?: number; reason: string }) => users.refund(user._id, body), {
    success: (_, vars) => (vars.amount ? `Refunded ${naira(vars.amount)}` : "Order refunded in full"),
    invalidate: [...userInvalidations(user._id), ["user", user._id, "refundable-orders"]],
    onSuccess: onClose,
  });

  const pick = (order: RefundableOrder) => {
    setChosen(order);
    setOrderId(order._id);
    setAmount("");
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="sm"
      title="Refund an order"
      subtitle="Money goes back to the customer's wallet. Only orders paid from the wallet can be refunded. Audited."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={action.isPending}>
            Cancel
          </Button>
          <Button loading={action.isPending} disabled={!valid} onClick={() => action.mutate({ orderId, amount: kobo, reason: reason.trim() })}>
            {kobo ? `Refund ${naira(kobo)}` : selected ? `Refund ${naira(maxKobo)}` : "Refund"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {selected ? (
          <Field label="Order">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
              <span className="font-semibold text-ink">#{selected.orderNumber}</span>
              <Badge tone="neutral">{selected.type}</Badge>
              <span className="text-ink-muted">Paid {naira(selected.totalAmountPayable)}</span>
              {selected.refunded > 0 ? <Badge tone="warning">{naira(selected.refunded)} refunded</Badge> : null}
              <Badge tone={selected.refundable > 0 ? "success" : "neutral"}>{naira(selected.refundable)} refundable</Badge>
              <button
                type="button"
                onClick={() => {
                  setOrderId("");
                  setChosen(null);
                }}
                className="ml-auto text-xs font-semibold text-brand-dark hover:underline"
              >
                Change
              </button>
            </div>
          </Field>
        ) : (
          <Field label="Order" hint="Type an order number to narrow the list. Paid orders only, newest first.">
            <Input left={<Search size={15} />} value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Order number" />
            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface">
              {refundable.isLoading ? (
                <div className="space-y-2 p-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
              ) : !orders.length ? (
                <p className="p-3 text-xs text-ink-muted">{debounced ? `No paid orders match “${debounced}”.` : "This customer has no paid orders to refund."}</p>
              ) : (
                <ul className="divide-y divide-line">
                  {orders.map((o) => (
                    <li key={o._id}>
                      <button
                        type="button"
                        disabled={o.refundable <= 0}
                        onClick={() => pick(o)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-card disabled:opacity-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">
                            #{o.orderNumber} · {naira(o.totalAmountPayable)}
                          </span>
                          <span className="block truncate text-[11px] text-ink-muted">
                            {o.status.toLowerCase().replace("_", " ")} · {when(o.createdAt)}
                            {o.refunded > 0 ? ` · ${naira(o.refunded)} already refunded` : ""}
                          </span>
                        </span>
                        <Badge tone={o.refundable > 0 ? "success" : "neutral"}>{o.refundable > 0 ? `${naira(o.refundable)} left` : "Refunded"}</Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Field>
        )}
        <Field
          label="Amount (naira), optional"
          hint={amountOk ? `Leave blank to refund everything still refundable${selected ? ` (${naira(maxKobo)})` : ""}.` : `Must be more than zero and at most ${naira(maxKobo)}.`}
          error={!amountOk ? "Check the amount" : undefined}
        >
          <Input type="number" min={0} step="0.01" inputMode="decimal" placeholder={selected ? (maxKobo / 100).toFixed(2) : "0.00"} value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!selected} />
        </Field>
        <Field label="Reason" hint="Required. Shown in the audit log.">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rider never showed up" />
        </Field>
      </div>
    </Drawer>
  );
}

// ── Phone ─────────────────────────────────────────────────────────────────────

export function PhoneDrawer({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) {
      setPhone("");
      setReason("");
    }
  }, [open]);

  const normalized = phone.trim() ? normalizePhone(phone) : null;
  const same = normalized != null && normalized.replace(/^\+/, "") === (user.phone ?? "").replace(/^\+/, "");
  const valid = normalized != null && !same;

  const action = useAction((body: { phone: string; reason?: string }) => users.updatePhone(user._id, body), {
    success: (_, vars) => `Phone changed to ${vars.phone}`,
    invalidate: userInvalidations(user._id),
    onSuccess: onClose,
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="sm"
      title="Change phone number"
      subtitle="The user signs in with this number, so double-check it. Audited."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={action.isPending}>
            Cancel
          </Button>
          <Button loading={action.isPending} disabled={!valid} onClick={() => normalized && action.mutate({ phone: normalized, reason: reason.trim() || undefined })}>
            Save number
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-surface px-4 py-3">
          <p className="text-xs font-semibold text-ink-muted">Current number</p>
          <p className="mt-0.5 text-base font-bold text-ink">{phoneLabel(user.phone) || "Not set"}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{user.phoneVerified ? "Verified" : "Not verified"}</p>
        </div>
        <Field
          label="New number"
          hint={
            phone.trim()
              ? normalized
                ? same
                  ? "That is already the current number."
                  : `Will be saved as ${normalized}`
                : "Use 0803 123 4567, 234803…, or +234803…"
              : "Nigerian format: 0803 123 4567 or +234 803 123 4567"
          }
          error={phone.trim() && !normalized ? "Not a valid phone number" : undefined}
        >
          <Input type="tel" inputMode="tel" placeholder="0803 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="off" />
        </Field>
        <Field label="Reason" hint="Optional, kept in the audit log.">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lost access to the old SIM" />
        </Field>
      </div>
    </Drawer>
  );
}

// ── Dispatch pause (riders) ───────────────────────────────────────────────────

export function DispatchDialog({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const paused = Boolean(user.dispatchPaused);
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const action = useAction((body: { paused: boolean; reason?: string }) => users.setDispatch(user._id, body), {
    success: (_, vars) => (vars.paused ? "This rider will not be rung for new orders" : "Dispatch resumed for this rider"),
    invalidate: userInvalidations(user._id),
    onSuccess: onClose,
  });

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      loading={action.isPending}
      tone={paused ? "primary" : "danger"}
      title={paused ? "Resume dispatch" : "Stop ringing this rider"}
      description={
        paused
          ? `${fullName(user) || "This rider"} will start receiving new order requests again.`
          : `${fullName(user) || "This rider"} will not receive new order requests until you resume. Orders already accepted are not affected.`
      }
      confirmLabel={paused ? "Resume dispatch" : "Stop ringing"}
      onConfirm={() => action.mutate({ paused: !paused, reason: reason.trim() || undefined })}
    >
      {paused ? (
        <div className="rounded-xl border border-line bg-surface px-4 py-3 text-xs text-ink-muted">
          Paused {when(user.dispatchPausedAt)}
          {user.dispatchPausedReason ? <span className="block text-ink">{user.dispatchPausedReason}</span> : null}
        </div>
      ) : (
        <Field label="Reason" hint="Shown on the rider's record and in the audit log.">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Too many cancellations this week" />
        </Field>
      )}
    </ConfirmDialog>
  );
}
