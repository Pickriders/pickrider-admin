"use client";

import { ArrowDownLeft, ArrowUpRight, BellRing, CreditCard, Landmark, Receipt, RefreshCw, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, EmptyState, ErrorState, Panel, Skeleton, StatCard, StatGrid, cx } from "@/components/kit";
import { CopyButton } from "@/components/users/person-card";
import type { DeveloperDetail, DeveloperTransaction } from "@/lib/admin/api";
import { ago, naira, when } from "@/lib/admin/format";
import { useDeveloperTransactions } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { CardTitle, Fact, LoadMore, Segmented, type Mode } from "./team-shared";

/** "order_payment" → "Order payment". */
export const purposeLabel = (purpose: string) => (purpose ? purpose.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "Other");

const FUNDING_TONE = { ACTIVE: "success", PENDING: "warning", FAILED: "danger" } as const;

function TransactionRow({ txn }: { txn: DeveloperTransaction }) {
  const credit = txn.type === "credit";
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-full", credit ? "bg-success-soft text-success" : "bg-surface text-ink-muted")}>
        {credit ? <ArrowDownLeft size={14} aria-hidden /> : <ArrowUpRight size={14} aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{txn.description || purposeLabel(txn.purpose)}</p>
        <p className="truncate text-xs text-ink-muted">
          {purposeLabel(txn.purpose)}
          {txn.status !== "success" ? ` · ${txn.status}` : ""}
          {txn.order ? <span className="font-mono"> · {txn.order}</span> : null}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cx("text-sm font-bold tabular-nums", credit ? "text-success" : "text-ink")}>
          {credit ? "+" : "−"}
          {naira(txn.amount)}
        </p>
        <p className="text-[11px] text-ink-faint" title={when(txn.created)}>
          {txn.balance_after !== null ? `${naira(txn.balance_after)} after · ` : ""}
          {ago(txn.created)}
        </p>
      </div>
    </li>
  );
}

function Transactions({ teamId, mode }: { teamId: string; mode: Mode }) {
  const [type, setType] = useState<"" | "credit" | "debit">("");
  const query = useMemo(() => ({ livemode: mode === "live" ? "true" : "false", type }), [mode, type]);
  const txns = useDeveloperTransactions(teamId, query);
  return (
    <Panel>
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Wallet history</h3>
          <p className="text-xs text-ink-muted">Every credit and debit on the {mode} wallet, newest first.</p>
        </div>
        <Segmented
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: "", label: "All" },
            { value: "credit", label: "Money in" },
            { value: "debit", label: "Money out" },
          ]}
        />
      </div>
      {txns.isLoading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : txns.isError ? (
        <div className="p-5">
          <ErrorState message={errorMessage(txns.error, "Could not load the wallet history.")} onRetry={() => void txns.refetch()} />
        </div>
      ) : txns.rows.length ? (
        <ul className="divide-y divide-line">
          {txns.rows.map((txn) => (
            <TransactionRow key={txn.id} txn={txn} />
          ))}
        </ul>
      ) : (
        <EmptyState compact icon={Receipt} title="No transactions" description={mode === "live" ? "Nothing has moved in the live wallet yet." : "Nothing has moved in the test wallet yet."} />
      )}
      <LoadMore hasMore={Boolean(txns.hasNextPage)} loading={txns.isFetchingNextPage} onMore={() => void txns.fetchNextPage()} shown={txns.rows.length} noun="transactions" />
    </Panel>
  );
}

/** The wallet in the page's mode, how the team funds it, and its history. Funding settings belong to the live wallet. */
export function TeamWallet({ team, mode }: { team: DeveloperDetail; mode: Mode }) {
  const wallet = (mode === "live" ? team.live : team.test).wallet;
  const { autoTopUp, fundingAccount: funding, lowBalanceThreshold, lowBalanceAlertedAt } = team.settings;
  return (
    <div className="space-y-4">
      <StatGrid columns={3}>
        <StatCard label="Available" value={wallet ? naira(wallet.available) : "No wallet"} icon={Wallet} tone={mode === "live" && wallet ? "brand" : "default"} hint={mode === "test" ? "Test money; it never pays a rider" : wallet ? wallet.currency : "Opened when live access is approved"} />
        <StatCard label="Held for orders" value={wallet ? naira(wallet.held) : "—"} hint="Reserved until each order finishes" />
        <StatCard label="Balance" value={wallet ? naira(wallet.available + wallet.held) : "—"} hint="Available plus held" />
      </StatGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel>
          <CardTitle title="Transfer account" icon={Landmark} hint="Money sent here tops up the live wallet." />
          <div className="px-5 pb-5 pt-4">
            {funding ? (
              <dl className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={FUNDING_TONE[funding.status]} dot>
                    {funding.status === "ACTIVE" ? "Active" : funding.status === "PENDING" ? "Being set up" : "Setup failed"}
                  </Badge>
                  {funding.activatedAt ? <span className="text-xs text-ink-faint">since {when(funding.activatedAt)}</span> : null}
                </div>
                <Fact label="Account number" mono>
                  {funding.accountNumber ? (
                    <span className="flex items-center gap-1">
                      {funding.accountNumber}
                      <CopyButton text={funding.accountNumber} label="Copy account number" />
                    </span>
                  ) : null}
                </Fact>
                <Fact label="Bank">{funding.bankName}</Fact>
                <Fact label="Account name">{funding.accountName}</Fact>
                {funding.failureReason ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">{funding.failureReason}</p> : null}
              </dl>
            ) : (
              <p className="text-sm text-ink-muted">Not set up. They fund by card from the dashboard.</p>
            )}
          </div>
        </Panel>

        <Panel>
          <CardTitle title="Auto top-up" icon={RefreshCw} hint="Charges a saved card when the live wallet runs low." />
          <div className="space-y-3 px-5 pb-5 pt-4">
            <Badge tone={autoTopUp.enabled ? "success" : "neutral"} dot>
              {autoTopUp.enabled ? "On" : "Off"}
            </Badge>
            <dl className="grid grid-cols-2 gap-3">
              <Fact label="Below">{autoTopUp.threshold !== null ? naira(autoTopUp.threshold) : null}</Fact>
              <Fact label="Adds">{autoTopUp.amount !== null ? naira(autoTopUp.amount) : null}</Fact>
            </dl>
            {autoTopUp.card ? (
              <p className="flex items-center gap-2 text-sm text-ink">
                <CreditCard size={14} className="text-ink-faint" aria-hidden />
                <span className="capitalize">{autoTopUp.card.brand ?? "Card"}</span> •••• {autoTopUp.card.last4}
                {autoTopUp.card.expMonth ? <span className="text-xs text-ink-faint">exp {autoTopUp.card.expMonth}/{autoTopUp.card.expYear}</span> : null}
              </p>
            ) : (
              <p className="text-xs text-ink-faint">No saved card.</p>
            )}
            {autoTopUp.lastChargeAt ? <p className="text-xs text-ink-muted">Last charged {when(autoTopUp.lastChargeAt)}</p> : null}
            {autoTopUp.consecutiveFailures || autoTopUp.disabledReason ? (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
                {autoTopUp.disabledReason ?? `${autoTopUp.consecutiveFailures} failed charge${autoTopUp.consecutiveFailures === 1 ? "" : "s"} in a row`}
                {autoTopUp.lastFailureReason ? `: ${autoTopUp.lastFailureReason}` : ""}
              </p>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <CardTitle title="Low-balance email" icon={BellRing} hint="Owners and finance members are emailed once, until money comes in." />
          <div className="space-y-3 px-5 pb-5 pt-4">
            <Fact label="When available drops below">{lowBalanceThreshold !== null ? naira(lowBalanceThreshold) : null}</Fact>
            <Fact label="Last sent">{lowBalanceAlertedAt ? when(lowBalanceAlertedAt) : lowBalanceThreshold !== null ? "Not yet" : null}</Fact>
            <Fact label="Also emails">{team.settings.notificationEmails.length ? team.settings.notificationEmails.join(", ") : null}</Fact>
          </div>
        </Panel>
      </div>

      <Transactions teamId={team.id} mode={mode} />
    </div>
  );
}
