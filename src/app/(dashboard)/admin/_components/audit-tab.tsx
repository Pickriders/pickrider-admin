"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ScrollText } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, DataTable, Drawer, KeyValue, cx, type ColumnMeta, type Tone } from "@/components/kit";
import type { AuditLogRow } from "@/lib/admin/api";
import { when } from "@/lib/admin/format";
import { useAuditLogRows } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { JsonView, pageFilter } from "./fields";

/**
 * Every audited request, newest first. The endpoint only paginates and takes a
 * date range, so the search box narrows the page that is on screen.
 */
const SOURCE_TONE: Record<string, Tone> = { ADMIN: "brand", BUSINESS: "info", DEVELOPER: "info", SYSTEM: "neutral", USER: "warning", TEAM: "neutral" };
const METHOD_CLASS: Record<string, string> = {
  GET: "text-info",
  POST: "text-success",
  PATCH: "text-warning",
  PUT: "text-warning",
  DELETE: "text-danger",
};

const meta = (value: ColumnMeta) => value;

const COLUMNS: ColumnDef<AuditLogRow, unknown>[] = [
  {
    id: "createdAt",
    header: "When",
    meta: meta({ csv: { key: "createdAt", label: "When" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{when(row.original.createdAt)}</span>,
  },
  {
    id: "action",
    header: "Action",
    meta: meta({ csv: { key: "action", label: "Action" } }),
    cell: ({ row }) => (
      <span className="block max-w-[22rem] truncate text-sm font-semibold text-ink" title={row.original.action}>
        {row.original.action || "Unlabelled"}
      </span>
    ),
  },
  {
    id: "who",
    header: "Who",
    meta: meta({ hideBelow: "lg", csv: { key: "actionBy", label: "Actor" } }),
    cell: ({ row }) => <Who row={row.original} />,
  },
  {
    id: "source",
    header: "Source",
    meta: meta({ csv: { key: "actionType", label: "Source" } }),
    cell: ({ row }) => <Badge tone={SOURCE_TONE[row.original.actionType ?? ""] ?? "neutral"}>{row.original.actionType ?? "Unknown"}</Badge>,
  },
  {
    id: "request",
    header: "Request",
    meta: meta({ hideBelow: "md", csv: { key: "requestUrl", label: "URL" } }),
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <span className={cx("text-[11px] font-black", METHOD_CLASS[row.original.requestMethod ?? ""] ?? "text-ink-muted")}>{row.original.requestMethod}</span>
        <span className="block max-w-[18rem] truncate font-mono text-[11px] text-ink-muted" title={row.original.requestUrl}>
          {row.original.requestUrl}
        </span>
      </span>
    ),
  },
  {
    id: "result",
    header: "Result",
    meta: meta({ csv: { key: "actionSuccessful", label: "Succeeded" } }),
    cell: ({ row }) => (row.original.actionSuccessful === false ? <Badge tone="danger">Failed</Badge> : <Badge tone="success">OK</Badge>),
  },
  {
    id: "ip",
    header: "IP",
    meta: meta({ hideBelow: "xl", csv: { key: "ipAddress", label: "IP" } }),
    cell: ({ row }) => <span className="font-mono text-[11px] text-ink-faint">{row.original.ipAddress}</span>,
  },
];

function Who({ row }: { row: AuditLogRow }) {
  const by = row.actionBy ?? "";
  // The interceptor stores the actor's user id, or the source name when there was no session.
  if (!by || by === row.actionType) return <span className="text-xs text-ink-faint">No session</span>;
  return (
    <span className="font-mono text-[11px] text-ink-muted" title={by}>
      {by.slice(0, 6)}…{by.slice(-4)}
    </span>
  );
}

export function AuditTab() {
  const table = useTableState({ limit: 20 });
  const query = useMemo(() => {
    const { sortBy: _sort, ...rest } = table.query;
    void _sort;
    return rest;
  }, [table.query]);
  const logs = useAuditLogRows(query);
  const [selected, setSelected] = useState<AuditLogRow | null>(null);
  const data = useMemo(
    () => (logs.data ? { ...logs.data, items: pageFilter(logs.data.items, table.state.search, (r) => [r.action, r.requestUrl, r.actionBy, r.ipAddress, r.actionType]) } : undefined),
    [logs.data, table.state.search],
  );

  return (
    <>
      <DataTable<AuditLogRow>
        columns={COLUMNS}
        data={data}
        loading={logs.isLoading || logs.isFetching}
        error={logs.isError ? errorMessage(logs.error) : null}
        onRetry={() => void logs.refetch()}
        searchPlaceholder="Filter this page by action, URL or actor"
        csvName="audit-log"
        emptyIcon={ScrollText}
        emptyTitle="No audit entries"
        emptyDescription="Admin and system requests appear here as they happen."
        onRowClick={setSelected}
        mobileCard={(row) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-semibold text-ink">{row.action || "Unlabelled"}</p>
              {row.actionSuccessful === false ? <Badge tone="danger">Failed</Badge> : <Badge tone="success">OK</Badge>}
            </div>
            <p className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
              <Badge tone={SOURCE_TONE[row.actionType ?? ""] ?? "neutral"}>{row.actionType}</Badge>
              <span className={cx("font-black", METHOD_CLASS[row.requestMethod ?? ""] ?? "")}>{row.requestMethod}</span>
              <span className="truncate font-mono">{row.requestUrl}</span>
            </p>
            <p className="text-[11px] text-ink-faint">{when(row.createdAt)}</p>
          </div>
        )}
      />
      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.action || "Audit entry"} subtitle={selected ? when(selected.createdAt) : undefined} width="lg">
        {selected ? (
          <div className="space-y-5">
            <KeyValue
              items={[
                { label: "Source", value: selected.actionType },
                { label: "Result", value: selected.actionSuccessful === false ? "Failed" : "OK" },
                { label: "Method", value: selected.requestMethod },
                { label: "IP", value: selected.ipAddress },
                { label: "URL", value: <span className="font-mono text-xs">{selected.requestUrl}</span> },
                { label: "Actor", value: selected.actionBy && selected.actionBy !== selected.actionType ? <span className="font-mono text-xs">{selected.actionBy}</span> : "No session" },
              ]}
            />
            <JsonView title="Request" value={selected.requestData} />
            <JsonView title="Response" value={selected.responseData} />
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
