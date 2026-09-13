"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ListChecks, Megaphone } from "lucide-react";
import { useMemo } from "react";

import { Badge, DataTable, Drawer, KeyValue, LinkButton, Skeleton, cx, type ColumnMeta } from "@/components/kit";
import type { Broadcast } from "@/lib/admin/api";
import { count, when } from "@/lib/admin/format";
import { useBroadcastLive, useBroadcasts } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { AUDIENCE_LABEL, BroadcastStatusBadge, ChannelBadges, shortId } from "./shared";

/**
 * Broadcasts sent so far, newest first. The endpoint only paginates, so the
 * search box narrows the loaded page. A row opens in a drawer (`?id=`) that
 * polls while the send is still running.
 */
const meta = (value: ColumnMeta) => value;

const COLUMNS: ColumnDef<Broadcast, unknown>[] = [
  {
    id: "createdAt",
    header: "When",
    meta: meta({ csv: { key: "createdAt", label: "When" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{when(row.original.createdAt)}</span>,
  },
  {
    id: "subject",
    header: "Subject",
    meta: meta({ csv: { key: "subject", label: "Subject" } }),
    cell: ({ row }) => (
      <span className="block max-w-[20rem]">
        <span className="block truncate text-sm font-bold text-ink">{row.original.subject}</span>
        <span className="block truncate text-[11px] text-ink-muted">{row.original.message}</span>
      </span>
    ),
  },
  {
    id: "audience",
    header: "Audience",
    meta: meta({ csv: { key: "audience", label: "Audience" } }),
    cell: ({ row }) => <Badge tone="neutral">{AUDIENCE_LABEL[row.original.audience] ?? row.original.audience}</Badge>,
  },
  {
    id: "channels",
    header: "Channels",
    meta: meta({ hideBelow: "md", csv: { key: "channels", label: "Channels", value: (row) => ((row as Broadcast).channels ?? []).join(" ") } }),
    cell: ({ row }) => <ChannelBadges channels={row.original.channels} />,
  },
  {
    id: "recipients",
    header: "Recipients",
    meta: meta({ align: "right", csv: { key: "recipients", label: "Recipients" } }),
    cell: ({ row }) => <span className="text-sm font-semibold text-ink">{count(row.original.recipients)}</span>,
  },
  {
    id: "delivery",
    header: "Sent / failed",
    meta: meta({ align: "right", hideBelow: "lg", csv: { key: "sent", label: "Sent" } }),
    cell: ({ row }) => (
      <span className="text-sm">
        <span className="font-semibold text-success">{count(row.original.sent)}</span>
        <span className="text-ink-faint"> / </span>
        <span className={cx("font-semibold", row.original.failed ? "text-danger" : "text-ink-faint")}>{count(row.original.failed)}</span>
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    meta: meta({ csv: { key: "status", label: "Status" } }),
    cell: ({ row }) => <BroadcastStatusBadge status={row.original.status} />,
  },
  {
    id: "createdBy",
    header: "Sent by",
    meta: meta({ hideBelow: "xl", csv: { key: "createdBy", label: "Sent by" } }),
    cell: ({ row }) => <span className="font-mono text-[11px] text-ink-muted">{shortId(typeof row.original.createdBy === "string" ? row.original.createdBy : row.original.createdBy?._id)}</span>,
  },
];

export function HistoryTab() {
  const table = useTableState({ limit: 20 });
  const selectedId = table.state.filters.id;
  const query = useMemo(() => {
    const { page, limit, order } = table.query;
    return { page, limit, order };
  }, [table.query]);
  const broadcasts = useBroadcasts(query);
  const data = useMemo(() => {
    if (!broadcasts.data) return undefined;
    const term = (table.state.search ?? "").trim().toLowerCase();
    if (!term) return broadcasts.data;
    return { ...broadcasts.data, items: broadcasts.data.items.filter((b) => [b.subject, b.message, b.audience].some((v) => String(v ?? "").toLowerCase().includes(term))) };
  }, [broadcasts.data, table.state.search]);

  return (
    <>
      <DataTable<Broadcast>
        columns={COLUMNS}
        data={data}
        loading={broadcasts.isLoading || broadcasts.isFetching}
        error={broadcasts.isError ? errorMessage(broadcasts.error) : null}
        onRetry={() => void broadcasts.refetch()}
        searchPlaceholder="Filter this page by subject"
        dateFilter={false}
        csvName="broadcasts"
        emptyIcon={Megaphone}
        emptyTitle="Nothing sent yet"
        emptyDescription="Broadcasts you send from Compose show up here with their delivery counts."
        onRowClick={(row) => table.update({ id: row._id }, { resetPage: false })}
        mobileCard={(row) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-bold text-ink">{row.subject}</p>
              <BroadcastStatusBadge status={row.status} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge>{AUDIENCE_LABEL[row.audience] ?? row.audience}</Badge>
              <ChannelBadges channels={row.channels} />
            </div>
            <p className="text-[11px] text-ink-muted">
              {count(row.sent)} of {count(row.recipients)} sent · {when(row.createdAt)}
            </p>
          </div>
        )}
      />
      <BroadcastDrawer id={selectedId} onClose={() => table.update({ id: undefined }, { resetPage: false })} />
    </>
  );
}

function BroadcastDrawer({ id, onClose }: { id?: string; onClose: () => void }) {
  const first = useBroadcasts({ page: 1, limit: 1 });
  void first;
  const [running, setRunning] = [true, undefined] as const;
  void setRunning;
  return <BroadcastDrawerInner id={id} onClose={onClose} running={running} />;
}

function BroadcastDrawerInner({ id, onClose }: { id?: string; onClose: () => void; running: boolean }) {
  const detail = useBroadcastLive(id ?? "", true);
  const b = detail.data;
  const isRunning = b ? b.status === "QUEUED" || b.status === "SENDING" : false;
  const live = useBroadcastLive(id ?? "", isRunning);
  const broadcast = live.data ?? b;
  const sent = broadcast?.sent ?? 0;
  const failed = broadcast?.failed ?? 0;
  const recipients = broadcast?.recipients ?? 0;
  const done = Math.min(recipients, sent + failed);
  const progress = recipients ? Math.round((done / recipients) * 100) : 0;
  const filters = (broadcast?.filters ?? {}) as Record<string, unknown>;
  const filterItems = Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length));

  return (
    <Drawer open={Boolean(id)} onClose={onClose} title={broadcast?.subject ?? "Broadcast"} subtitle={broadcast ? when(broadcast.createdAt) : undefined}>
      {detail.isError ? (
        <p className="text-sm font-semibold text-danger">{errorMessage(detail.error)}</p>
      ) : !broadcast ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <BroadcastStatusBadge status={broadcast.status} />
            <Badge>{AUDIENCE_LABEL[broadcast.audience] ?? broadcast.audience}</Badge>
            <ChannelBadges channels={broadcast.channels} />
          </div>
          <div>
            <div className="flex items-end justify-between text-xs">
              <span className="font-semibold text-ink">
                {count(sent)} sent of {count(recipients)}
              </span>
              <span className={failed ? "font-semibold text-danger" : "text-ink-faint"}>{count(failed)} failed</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
              <div className={cx("h-full rounded-full transition-all", broadcast.status === "FAILED" ? "bg-danger" : "bg-brand")} style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-ink-faint">
              {isRunning ? "Still sending, this refreshes on its own." : broadcast.completedAt ? `Finished ${when(broadcast.completedAt)}` : "Finished"}
            </p>
          </div>
          <KeyValue
            items={[
              { label: "Recipients", value: count(recipients) },
              { label: "Sent by", value: <span className="font-mono text-xs">{typeof broadcast.createdBy === "string" ? broadcast.createdBy : broadcast.createdBy?._id}</span> },
              ...filterItems.map(([key, value]) => ({ label: key.replace(/([A-Z])/g, " $1").toLowerCase(), value: Array.isArray(value) ? value.join(", ") : String(value) })),
            ]}
          />
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Message</p>
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-sm font-bold text-ink">{broadcast.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted">{broadcast.message}</p>
            </div>
          </div>
          <LinkButton href={`/messaging?tab=log&broadcastId=${broadcast._id}`} icon={ListChecks} variant="outline">
            See every delivery
          </LinkButton>
        </div>
      )}
    </Drawer>
  );
}
