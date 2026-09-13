"use client";

import { ArrowRightLeft, Search, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { finance, type User } from "@/lib/admin/api";
import { useAction, useFinanceStatus, usePlatformWallet, useUsers } from "@/lib/admin/hooks";
import { fullName, naira } from "@/lib/admin/format";
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  KeyValue,
  Panel,
  PanelHeader,
  Skeleton,
  Textarea,
  cx,
} from "@/components/kit";
import { PinDrawer } from "./finance-setup";
import { toKobo } from "./lib";

/**
 * Moves money from the platform wallet straight into a rider's or customer's
 * in-app wallet, for goodwill credits, manual settlements and the like. The
 * reason is required because it lands on both ledgers and the audit log.
 */
function roleOf(user: User) {
  if (user.isRider) return "Rider";
  if (user.roles?.some((r) => r.toUpperCase().includes("ADMIN"))) return "Staff";
  return "Customer";
}

function UserPicker({ value, onChange }: { value: User | null; onChange: (user: User | null) => void }) {
  const [text, setText] = useState("");
  const [term, setTerm] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setTerm(text.trim()), 300);
    return () => window.clearTimeout(id);
  }, [text]);

  const enabled = term.length >= 2;
  const users = useUsers({ userSearch: term, limit: 8 }, enabled);
  const results = users.data?.items ?? [];

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
        <Avatar src={value.photo} name={fullName(value)} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{fullName(value) || value.phone || value._id}</p>
          <p className="truncate text-xs text-ink-muted">{[value.phone, value.email].filter(Boolean).join(" · ")}</p>
        </div>
        <Badge tone={value.isRider ? "brand" : "neutral"}>{roleOf(value)}</Badge>
        <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
          Change
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Input left={<Search size={15} />} value={text} onChange={(e) => setText(e.target.value)} placeholder="Name, phone or email" autoFocus />
      <div className="mt-2 overflow-hidden rounded-xl border border-line">
        {!enabled ? (
          <p className="px-3 py-3 text-xs text-ink-faint">Type at least two characters to search riders and customers.</p>
        ) : users.isLoading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : users.isError ? (
          <p className="px-3 py-3 text-xs text-danger">Search failed. Try again.</p>
        ) : !results.length ? (
          <p className="px-3 py-3 text-xs text-ink-faint">Nobody matches &quot;{term}&quot;.</p>
        ) : (
          <ul className={cx("divide-y divide-line", users.isFetching && "opacity-60")}>
            {results.map((user) => (
              <li key={user._id}>
                <button
                  type="button"
                  onClick={() => onChange(user)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface"
                >
                  <Avatar src={user.photo} name={fullName(user)} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{fullName(user) || user.phone || user._id}</span>
                    <span className="block truncate text-xs text-ink-muted">{[user.phone, user.email].filter(Boolean).join(" · ")}</span>
                  </span>
                  <Badge tone={user.isRider ? "brand" : "neutral"}>{roleOf(user)}</Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function TransferTab() {
  const status = useFinanceStatus();
  const wallet = usePlatformWallet();
  const [user, setUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [pinDrawer, setPinDrawer] = useState(false);

  const s = status.data;
  const balance = s?.balance ?? wallet.data?.balance ?? 0;
  const kobo = toKobo(amount);
  const overBalance = kobo != null && kobo > balance;
  const amountError = amount && kobo == null ? "Enter an amount above zero." : overBalance ? `More than the wallet holds (${naira(balance, 2)}).` : undefined;
  const ready = Boolean(user) && kobo != null && !overBalance && reason.trim().length >= 3 && pin.length === 4;
  const recipient = user ? fullName(user) || user.phone || user._id : "";

  const transfer = useAction(finance.transfer, {
    success: () => `Sent ${naira(kobo, 2)} to ${recipient}`,
    invalidate: ["finance", "transactions", "stats", "user-wallets"],
    onSuccess: () => {
      setConfirming(false);
      setUser(null);
      setAmount("");
      setReason("");
      setPin("");
    },
  });

  if (status.isError) {
    return <ErrorState message="The platform finance status could not be loaded." onRetry={() => void status.refetch()} />;
  }

  return (
    <div className="space-y-6">
      {!status.isLoading && !s?.hasPin ? (
        <Panel>
          <EmptyState
            icon={UserRound}
            title="Transfers need a withdrawal PIN"
            description="Set the platform withdrawal PIN first. It is asked for on every transfer out of the platform wallet."
            action={
              <Button size="sm" onClick={() => setPinDrawer(true)}>
                Set PIN
              </Button>
            }
          />
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            title="Transfer to a wallet"
            subtitle="Credits a rider's or customer's in-app wallet from the platform wallet. Both sides get a ledger entry with your reason."
            action={
              <span className="text-xs text-ink-muted">
                Available <span className="font-bold text-ink">{status.isLoading ? "…" : naira(balance, 2)}</span>
              </span>
            }
          />
          <form
            className="space-y-4 px-5 pb-5 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (ready) setConfirming(true);
            }}
          >
            <div className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink-muted">Recipient</span>
              <UserPicker value={user} onChange={setUser} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Amount in naira" error={amountError} hint={kobo != null && !amountError ? `Sends ${naira(kobo, 2)}` : "Whole naira or with kobo, like 1500.50"}>
                <Input type="number" inputMode="decimal" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
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
                />
              </Field>
            </div>
            <Field label="Reason" hint="Required. The recipient sees it on their wallet history." error={reason && reason.trim().length < 3 ? "Say a little more." : undefined}>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Goodwill credit for order PR-1234 delay" maxLength={240} />
            </Field>
            <Button type="submit" icon={ArrowRightLeft} disabled={!ready} loading={transfer.isPending}>
              Review transfer
            </Button>
          </form>
        </Panel>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          if (!user || kobo == null) return;
          transfer.mutate({ userId: user._id, amount: kobo, pin, reason: reason.trim() });
        }}
        title={`Send ${naira(kobo, 2)} to ${recipient}?`}
        description="The money leaves the platform wallet and lands in their in-app wallet immediately. There is no undo."
        confirmLabel="Send transfer"
        loading={transfer.isPending}
      >
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar src={user.photo} name={fullName(user)} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{recipient}</p>
                <p className="truncate text-xs text-ink-muted">
                  {roleOf(user)}
                  {user.phone ? ` · ${user.phone}` : ""}
                </p>
              </div>
            </div>
            <KeyValue
              columns={2}
              items={[
                { label: "Amount", value: naira(kobo, 2) },
                { label: "Platform balance after", value: naira(balance - (kobo ?? 0), 2) },
                { label: "Reason", value: reason.trim() },
              ]}
            />
          </div>
        ) : null}
      </ConfirmDialog>

      <PinDrawer open={pinDrawer} onClose={() => setPinDrawer(false)} hasPin={Boolean(s?.hasPin)} />
    </div>
  );
}
