"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Receipt } from "lucide-react";
import { useMemo } from "react";

import type { Paged, Transaction } from "@/lib/admin/api";
import { naira, statusLabel, when } from "@/lib/admin/format";
import { errorMessage } from "@/lib/admin/http";
import { useBusinessTransactions } from "@/lib/admin/hooks";
import { useTableState } from "@/lib/admin/url-state";
import { Badge, DataTable, cx, statusTone, type ColumnMeta } from "@/components/kit";

/**
 * Wallet movements for the business, from GET businesses/:id/transactions.
 * That route filters by status, category, type and date only; there is no
 * free-text search, so the search box is not wired to anything.
 */
const STATUS_OPTIONS = ["PROCESSING", "SUCCESS", "FAILED", "CANCELLED"].map((value) => ({ value, label: statusLabel(value) }));
const CATEGORY_OPTIONS = ["DEPOSIT", "WITHDRAWAL", "FEE", "CHARGE", "REVERSAL"].map((value) => ({ value, label: statusLabel(value) }));
const TYPE_OPTIONS = [
  { value: "CREDIT", label: "Credit" },
  { value: "DEBIT", label: "Debit" },
];

function signed(tx: Transaction) {
  const credit = tx.type === "CREDIT";
  return (
    <span className={cx("whitespace-nowrap font-semibold", credit ? "text-success" : "text-ink")}>
      {credit ? "+" : "-"}
      {naira(tx.amount)}
    </span>
  );
}

const COLUMNS: ColumnDef<Transaction, unknown>[] = [
  {
    id: "purpose",
    header: "Transaction",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{statusLabel(row.original.purpose) || statusLabel(row.original.category)}</p>
        <p className="truncate text-xs text-ink-muted">{row.original.description || row.original.reference || ""}</p>
      </div>
    ),
    meta: { csv: { key: "purpose", label: "Purpose" } } satisfies ColumnMeta,
  },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => <Badge tone={row.original.type === "CREDIT" ? "success" : "neutral"}>{row.original.type?.toLowerCase()}</Badge>,
    meta: { hideBelow: "md", csv: { key: "type", label: "Type" } } satisfies ColumnMeta,
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => signed(row.original),
    meta: { align: "right", csv: { key: "amount", label: "Amount (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge tone={statusTone(row.original.status)} dot>
        {statusLabel(row.original.status)}
      </Badge>
    ),
    meta: { csv: { key: "status", label: "Status" } } satisfies ColumnMeta,
  },
  {
    id: "balanceAfter",
    header: "Balance after",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{row.original.balanceAfter != null ? naira(row.original.balanceAfter) : ""}</span>,
    meta: { align: "right", hideBelow: "lg", csv: { key: "balanceAfter", label: "Balance after (kobo)" } } satisfies ColumnMeta,
  },
  {
    id: "reference",
    header: "Reference",
    cell: ({ row }) => <span className="font-mono text-xs text-ink-muted">{row.original.reference ?? ""}</span>,
    meta: { hideBelow: "xl", csv: { key: "reference", label: "Reference" } } satisfies ColumnMeta,
  },
  {
    id: "createdAt",
    header: "When",
    cell: ({ row }) => <span className="whitespace-nowrap text-ink-muted">{when(row.original.createdAt)}</span>,
    meta: { hideBelow: "md", sortKey: "createdAt", csv: { key: "createdAt", label: "When" } } satisfies ColumnMeta,
  },
];

export function TransactionsTab({ businessId }: { businessId: string }) {
  const table = useTableState();
  const query = useMemo(() => table.query, [table.query]);
  const data = useBusinessTransactions(businessId, query);

  return (
    <DataTable<Transaction>
      columns={COLUMNS}
      data={data.data as Paged<Transaction> | undefined}
      loading={data.isPending || data.isFetching}
      error={data.error ? errorMessage(data.error) : null}
      onRetry={() => void data.refetch()}
      searchPlaceholder="Use the filters and dates"
      filters={[
        { key: "status", label: "Status", options: STATUS_OPTIONS },
        { key: "category", label: "Category", options: CATEGORY_OPTIONS },
        { key: "type", label: "Direction", options: TYPE_OPTIONS },
      ]}
      csvName="business-transactions"
      defaultSort={{ sortBy: "createdAt", order: "DESC" }}
      mobileCard={(row) => (
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-ink">{statusLabel(row.purpose) || statusLabel(row.category)}</p>
            {signed(row)}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{row.description || row.reference || ""}</p>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-muted">
            <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
            {when(row.createdAt)}
          </div>
        </div>
      )}
      emptyIcon={Receipt}
      emptyTitle="No transactions"
      emptyDescription="Wallet funding, order payments and withdrawals for this business land here."
    />
  );
}
