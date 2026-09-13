"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Inbox, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge, Button, DataTable, Drawer, KeyValue, type ColumnMeta, type FilterSpec } from "@/components/kit";
import type { NotificationRow } from "@/lib/admin/api";
import { when } from "@/lib/admin/format";
import { useNotificationLog } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { CHANNEL_LABEL, CHANNEL_TONE, shortId } from "./shared";

/**
 * Delivery log: one row per notification the platform tried to send. Filters
 * map straight onto the endpoint (status, type, category, broadcastId,
 * entityId), so `?tab=log&status=FAILED` from the attention strip just works.
 */
const FILTERS: FilterSpec[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "SUCCESS", label: "Delivered" },
      { value: "FAILED", label: "Failed" },
    ],
  },
  { key: "type", label: "Channel", options: ["IN_APP", "PUSH", "SMS", "EMAIL"].map((value) => ({ value, label: CHANNEL_LABEL[value] ?? value })) },
  {
    key: "category",
    label: "Category",
    options: [
      { value: "SINGLE", label: "Single" },
      { value: "BROADCAST", label: "Broadcast" },
      { value: "SCHEDULED_BROADCAST", label: "Scheduled broadcast" },
    ],
  },
];

const meta = (value: ColumnMeta) => value;

const recipientId = (row: NotificationRow) => (typeof row.entityId === "string" ? row.entityId : row.entityId?._id);
const body = (row: NotificationRow) => String(row.content ?? row.message ?? "");

const COLUMNS: ColumnDef<NotificationRow, unknown>[] = [
  {
    id: "createdAt",
    header: "When",
    meta: meta({ csv: { key: "createdAt", label: "When" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{when(row.original.createdAt)}</span>,
  },
  {
    id: "recipient",
    header: "Recipient",
    meta: meta({ csv: { key: "entityId", label: "Recipient id", value: (row) => recipientId(row as NotificationRow) } }),
    cell: ({ row }) => <Recipient row={row.original} />,
  },
  {
    id: "type",
    header: "Channel",
    meta: meta({ csv: { key: "type", label: "Channel" } }),
    cell: ({ row }) => <Badge tone={CHANNEL_TONE[row.original.type] ?? "neutral"}>{CHANNEL_LABEL[row.original.type] ?? row.original.type}</Badge>,
  },
  {
    id: "status",
    header: "Status",
    meta: meta({ csv: { key: "status", label: "Status" } }),
    cell: ({ row }) =>
      row.original.status === "FAILED" ? (
        <Badge tone="danger" dot>
          Failed
        </Badge>
      ) : (
        <Badge tone="success" dot>
          Delivered
        </Badge>
      ),
  },
  {
    id: "subject",
    header: "Subject",
    meta: meta({ hideBelow: "md", csv: { key: "subject", label: "Subject" } }),
    cell: ({ row }) => (
      <span className="block max-w-[24rem]">
        <span className="block truncate text-sm font-semibold text-ink">{row.original.subject || <span className="text-ink-faint">No subject</span>}</span>
        <span className="block truncate text-[11px] text-ink-muted">{body(row.original)}</span>
      </span>
    ),
  },
];

function Recipient({ row }: { row: NotificationRow }) {
  const id = recipientId(row);
  if (!id) return <span className="text-xs text-ink-faint">External</span>;
  return (
    <Link href={`/customers/${id}`} onClick={(e) => e.stopPropagation()} className="font-mono text-[11px] text-brand-dark hover:underline" title={id}>
      {shortId(id)}
    </Link>
  );
}

export function LogTab() {
  const table = useTableState({ limit: 20 });
  const query = useMemo(() => {
    const { sortBy: _sort, dateRange: _range, ...rest } = table.query;
    void _sort;
    void _range;
    return rest;
  }, [table.query]);
  const log = useNotificationLog(query);
  const [selected, setSelected] = useState<NotificationRow | null>(null);
  const scoped = table.state.filters.broadcastId || table.state.filters.entityId;

  return (
    <>
      {scoped ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink-muted">
          {table.state.filters.broadcastId ? (
            <span>
              Deliveries for broadcast <span className="font-mono text-ink">{shortId(table.state.filters.broadcastId)}</span>
            </span>
          ) : null}
          {table.state.filters.entityId ? (
            <span>
              Notifications to <span className="font-mono text-ink">{shortId(table.state.filters.entityId)}</span>
            </span>
          ) : null}
          <Button size="sm" variant="ghost" icon={X} onClick={() => table.update({ broadcastId: undefined, entityId: undefined })}>
            Show all
          </Button>
        </div>
      ) : null}
      <DataTable<NotificationRow>
        columns={COLUMNS}
        data={log.data}
        loading={log.isLoading || log.isFetching}
        error={log.isError ? errorMessage(log.error) : null}
        onRetry={() => void log.refetch()}
        filters={FILTERS}
        searchPlaceholder="Search is not available on this log"
        dateFilter={false}
        csvName="notification-log"
        emptyIcon={Inbox}
        emptyTitle="No deliveries match"
        emptyDescription="Every push, email, SMS and in-app notification the platform sends is recorded here."
        onRowClick={setSelected}
        mobileCard={(row) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Badge tone={CHANNEL_TONE[row.type] ?? "neutral"}>{CHANNEL_LABEL[row.type] ?? row.type}</Badge>
                {row.status === "FAILED" ? <Badge tone="danger">Failed</Badge> : <Badge tone="success">Delivered</Badge>}
              </span>
              <span className="text-[11px] text-ink-faint">{when(row.createdAt)}</span>
            </div>
            <p className="truncate text-sm font-semibold text-ink">{row.subject || "No subject"}</p>
            <p className="truncate text-[11px] text-ink-muted">{body(row)}</p>
          </div>
        )}
      />
      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.subject || "Notification"} subtitle={selected ? when(selected.createdAt) : undefined}>
        {selected ? (
          <div className="space-y-5">
            <KeyValue
              items={[
                { label: "Channel", value: CHANNEL_LABEL[selected.type] ?? selected.type },
                { label: "Status", value: selected.status === "FAILED" ? "Failed" : "Delivered" },
                { label: "Category", value: selected.category },
                { label: "Recipient", value: recipientId(selected) ? <span className="font-mono text-xs">{recipientId(selected)}</span> : "External" },
                { label: "Broadcast", value: selected.broadcastId ? <span className="font-mono text-xs">{String(selected.broadcastId)}</span> : undefined },
                { label: "Failure reason", value: selected.failureReason ? String(selected.failureReason) : undefined },
              ]}
            />
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="whitespace-pre-wrap text-sm text-ink">{body(selected) || "No content"}</p>
            </div>
            {selected.broadcastId ? (
              <Link href={`/messaging?tab=history&id=${String(selected.broadcastId)}`} className="text-xs font-semibold text-brand-dark hover:underline">
                Open the broadcast
              </Link>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
