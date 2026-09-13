"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Receipt, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { Transaction } from "@/lib/admin/api";
import { usePlatformWallet, useTransaction, useTransactions } from "@/lib/admin/hooks";
import { naira, when } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";
import { Badge, DataTable, Drawer, ErrorState, KeyValue, LinkButton, Skeleton, cx, statusTone, type ColumnMeta, type FilterSpec } from "@/components/kit";
import { TX_CATEGORIES, TX_PURPOSES, TX_STATUSES, TX_TYPES, destinationOf, entityHref, entityLabel, isObjectId, purposeLabel, titleCase } from "./lib";

/**
 * The transactions ledger. Every filter lives in the URL so the dashboard can
 * deep link into it (`?tab=transactions&category=WITHDRAWAL&status=PROCESSING`)
 * and the Withdrawals tab is the same table with the category pinned.
 */
type Preset = "all" | "withdrawals";

const meta = (m: ColumnMeta) => m;

function SignedAmount({ tx, digits = 2 }: { tx: Transaction; digits?: number }) {
  const credit = tx.type === "CREDIT";
  return (
    <span className={cx("whitespace-nowrap font-semibold tabular-nums", credit ? "text-success" : "text-danger")}>
      {credit ? "+" : "-"}
      {naira(tx.amount, digits)}
    </span>
  );
}

function EntityCell({ tx, platformEntityId }: { tx: Transaction; platformEntityId?: string }) {
  const href = entityHref(tx, platformEntityId);
  const label = entityLabel(tx, platformEntityId);
  const short = tx.entityId ? `…${tx.entityId.slice(-6)}` : "";
  if (!href) {
    return (
      <span className="block min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {short && label !== "Platform wallet" ? <span className="block font-mono text-[11px] text-ink-faint">{short}</span> : null}
      </span>
    );
  }
  return (
    <Link href={href} onClick={(e) => e.stopPropagation()} className="group block min-w-0" prefetch={false}>
      <span className="flex items-center gap-1 text-sm font-medium text-ink group-hover:text-brand-dark">
        {label}
        <ExternalLink size={11} className="text-ink-faint" />
      </span>
      <span className="block font-mono text-[11px] text-ink-faint">{short}</span>
    </Link>
  );
}

export function TransactionsTab({ preset }: { preset: Preset }) {
  const table = useTableState({ limit: 20 });
  const wallet = usePlatformWallet();
  const platformEntityId = wallet.data?.entityId;
  const [selected, setSelected] = useState<string | null>(null);

  const search = table.state.search;
  const searchIsId = isObjectId(search);
  const entityFilter = table.state.filters.entityId;

  const query = useMemo(
    () => ({
      ...table.query,
      ...(preset === "withdrawals" ? { category: "WITHDRAWAL" } : {}),
      entityId: entityFilter ?? (searchIsId ? search : undefined),
    }),
    [table.query, preset, entityFilter, searchIsId, search],
  );
  const data = useTransactions(query);

  const filters = useMemo<FilterSpec[]>(() => {
    const status = { key: "status", label: "Status", options: TX_STATUSES.map((s) => ({ value: s, label: titleCase(s) })) };
    const purpose = { key: "purpose", label: "Purpose", options: TX_PURPOSES };
    if (preset === "withdrawals") return [status, purpose];
    return [
      status,
      { key: "type", label: "Type", options: TX_TYPES.map((t) => ({ value: t, label: titleCase(t) })) },
      { key: "category", label: "Category", options: TX_CATEGORIES.map((c) => ({ value: c, label: titleCase(c) })) },
      purpose,
    ];
  }, [preset]);

  const columns = useMemo<ColumnDef<Transaction, unknown>[]>(() => {
    const reference: ColumnDef<Transaction, unknown> = {
      id: "reference",
      header: "Reference",
      cell: ({ row }) => <span className="block max-w-[180px] truncate font-mono text-xs text-ink">{row.original.reference || row.original._id}</span>,
      meta: meta({ csv: { key: "reference", label: "Reference", value: (r) => (r as Transaction).reference ?? (r as Transaction)._id } }),
    };
    const created: ColumnDef<Transaction, unknown> = {
      id: "createdAt",
      header: "When",
      cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{when(row.original.createdAt)}</span>,
      meta: meta({ sortKey: "createdAt", csv: { key: "createdAt", label: "Created at" } }),
    };
    const entity: ColumnDef<Transaction, unknown> = {
      id: "entity",
      header: "Wallet",
      cell: ({ row }) => <EntityCell tx={row.original} platformEntityId={platformEntityId} />,
      meta: meta({
        hideBelow: "md",
        csv: { key: "entity", label: "Wallet", value: (r) => `${(r as Transaction).entityType ?? ""} ${(r as Transaction).entityId ?? ""}`.trim() },
      }),
    };
    const amount: ColumnDef<Transaction, unknown> = {
      id: "amount",
      header: "Amount",
      cell: ({ row }) => <SignedAmount tx={row.original} />,
      meta: meta({
        align: "right",
        csv: { key: "amount", label: "Amount (kobo, signed)", value: (r) => ((r as Transaction).type === "DEBIT" ? -1 : 1) * ((r as Transaction).amount ?? 0) },
      }),
    };
    const status: ColumnDef<Transaction, unknown> = {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge tone={statusTone(row.original.status)} dot>
          {titleCase(row.original.status)}
        </Badge>
      ),
      meta: meta({ csv: { key: "status", label: "Status" } }),
    };
    const charge: ColumnDef<Transaction, unknown> = {
      id: "charge",
      header: "Charge",
      cell: ({ row }) => <span className="whitespace-nowrap tabular-nums text-ink-muted">{row.original.charge ? naira(row.original.charge, 2) : ""}</span>,
      meta: meta({ align: "right", hideBelow: "xl", csv: { key: "charge", label: "Charge (kobo)", value: (r) => (r as Transaction).charge ?? 0 } }),
    };

    if (preset === "withdrawals") {
      return [
        reference,
        created,
        entity,
        {
          id: "destination",
          header: "Destination",
          cell: ({ row }) => <span className="block max-w-[260px] truncate text-ink-muted">{destinationOf(row.original) || "Not recorded"}</span>,
          meta: meta({ hideBelow: "lg", csv: { key: "destination", label: "Destination", value: (r) => destinationOf(r as Transaction) } }),
        },
        {
          id: "purpose",
          header: "Purpose",
          cell: ({ row }) => <span className="whitespace-nowrap">{purposeLabel(row.original.purpose)}</span>,
          meta: meta({ hideBelow: "xl", csv: { key: "purpose", label: "Purpose" } }),
        },
        amount,
        charge,
        status,
      ];
    }
    return [
      reference,
      created,
      entity,
      {
        id: "purpose",
        header: "Purpose",
        cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink">{purposeLabel(row.original.purpose)}</span>,
        meta: meta({ csv: { key: "purpose", label: "Purpose" } }),
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{titleCase(row.original.category)}</span>,
        meta: meta({ hideBelow: "lg", csv: { key: "category", label: "Category" } }),
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => <Badge tone={row.original.type === "CREDIT" ? "success" : "danger"}>{titleCase(row.original.type)}</Badge>,
        meta: meta({ hideBelow: "lg", csv: { key: "type", label: "Type" } }),
      },
      amount,
      charge,
      status,
      {
        id: "balanceAfter",
        header: "Balance after",
        cell: ({ row }) => <span className="whitespace-nowrap tabular-nums text-ink-muted">{naira(row.original.balanceAfter, 2)}</span>,
        meta: meta({ align: "right", hideBelow: "lg", csv: { key: "balanceAfter", label: "Balance after (kobo)" } }),
      },
    ];
  }, [preset, platformEntityId]);

  const toolbarExtra = (
    <>
      {entityFilter ? (
        <button
          type="button"
          onClick={() => table.setFilter("entityId", undefined)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-brand-soft px-3 text-xs font-semibold text-brand-dark"
          title={entityFilter}
        >
          Wallet …{entityFilter.slice(-6)}
          <X size={12} />
        </button>
      ) : null}
      {search && !searchIsId ? (
        <Badge tone="warning" className="h-10 rounded-xl px-3">
          Search takes a user or wallet id
        </Badge>
      ) : null}
    </>
  );

  return (
    <>
      <DataTable<Transaction>
        columns={columns}
        data={data.data}
        loading={data.isLoading || data.isFetching}
        error={data.isError ? errorMessage(data.error) : null}
        onRetry={() => void data.refetch()}
        filters={filters}
        searchPlaceholder="Paste a user id"
        csvName={preset === "withdrawals" ? "withdrawals" : "transactions"}
        emptyIcon={Receipt}
        emptyTitle={preset === "withdrawals" ? "No withdrawals match" : "No transactions match"}
        emptyDescription={
          preset === "withdrawals"
            ? "Payouts and wallet withdrawals show up here as they happen. Loosen the filters or the date range to see more."
            : "Every wallet movement on the platform lands here. Loosen the filters or the date range to see more."
        }
        onRowClick={(row) => setSelected(row._id)}
        toolbarExtra={toolbarExtra}
        mobileCard={(row) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{purposeLabel(row.purpose)}</p>
              <p className="truncate font-mono text-[11px] text-ink-faint">{row.reference || row._id}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {when(row.createdAt)} · {entityLabel(row, platformEntityId)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <SignedAmount tx={row} />
              <Badge tone={statusTone(row.status)} dot>
                {titleCase(row.status)}
              </Badge>
            </div>
          </div>
        )}
      />
      <TransactionDrawer id={selected} onClose={() => setSelected(null)} platformEntityId={platformEntityId} />
    </>
  );
}

function TransactionDrawer({ id, onClose, platformEntityId }: { id: string | null; onClose: () => void; platformEntityId?: string }) {
  const tx = useTransaction(id ?? "");
  const t = tx.data;
  const href = t ? entityHref(t, platformEntityId) : undefined;
  const metadata = t?.metadata && Object.keys(t.metadata).length ? JSON.stringify(t.metadata, null, 2) : null;

  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      width="md"
      title={t ? purposeLabel(t.purpose) : "Transaction"}
      subtitle={t ? <span className="font-mono">{t.reference || t._id}</span> : undefined}
      footer={
        href ? (
          <div className="flex justify-end">
            <LinkButton href={href} size="sm" icon={ExternalLink}>
              Open wallet owner
            </LinkButton>
          </div>
        ) : undefined
      }
    >
      {tx.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : tx.isError || !t ? (
        <ErrorState message={tx.isError ? errorMessage(tx.error) : "This transaction could not be found."} onRetry={() => void tx.refetch()} />
      ) : (
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
            <div>
              <p className="text-xs font-semibold text-ink-muted">{titleCase(t.type)}</p>
              <p className={cx("mt-1 text-2xl font-black tracking-tight tabular-nums", t.type === "CREDIT" ? "text-success" : "text-danger")}>
                {t.type === "CREDIT" ? "+" : "-"}
                {naira(t.amount, 2)}
              </p>
            </div>
            <Badge tone={statusTone(t.status)} dot>
              {titleCase(t.status)}
            </Badge>
          </div>
          <KeyValue
            columns={2}
            items={[
              { label: "Category", value: titleCase(t.category) },
              { label: "Purpose", value: purposeLabel(t.purpose) },
              { label: "Charge", value: naira(t.charge, 2) },
              { label: "Currency", value: t.currency ? String(t.currency) : undefined },
              { label: "Balance before", value: naira(t.balanceBefore, 2) },
              { label: "Balance after", value: naira(t.balanceAfter, 2) },
              { label: "Wallet", value: entityLabel(t, platformEntityId) },
              { label: "Wallet owner id", value: <span className="font-mono text-xs">{t.entityId}</span> },
              { label: "Provider", value: t.provider },
              { label: "Created", value: when(t.createdAt) },
              { label: "Updated", value: t.updatedAt ? when(String(t.updatedAt)) : undefined },
              { label: "Transaction id", value: <span className="font-mono text-xs">{t._id}</span> },
            ]}
          />
          {t.description ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Description</p>
              <p className="mt-1 text-sm text-ink">{t.description}</p>
            </div>
          ) : null}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Metadata</p>
            {metadata ? (
              <pre className="admin-scroll mt-1 max-h-72 overflow-auto rounded-xl border border-line bg-surface p-3 font-mono text-xs leading-5 text-ink">{metadata}</pre>
            ) : (
              <p className="mt-1 text-xs text-ink-faint">Nothing attached to this transaction.</p>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
