"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Database } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, DataTable, Drawer, KeyValue, type ColumnMeta, type FilterSpec, type Tone } from "@/components/kit";
import type { DataLogRow } from "@/lib/admin/api";
import { when } from "@/lib/admin/format";
import { useDataLogRows } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useTableState } from "@/lib/admin/url-state";

import { JsonView } from "./fields";

/**
 * Structured logs the API wrote to the LOG database, paginated and filtered
 * server side (level, type, date range, free text over the payload).
 */
const LEVEL_TONE: Record<string, Tone> = { ERROR: "danger", DEBUG: "info", INFO: "brand", LOG: "neutral" };

const FILTERS: FilterSpec[] = [
  { key: "level", label: "Level", options: ["LOG", "INFO", "DEBUG", "ERROR"].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() })) },
  {
    key: "logType",
    label: "Type",
    options: [
      { value: "SYSTEM", label: "System" },
      { value: "USER", label: "User" },
    ],
  },
];

/** Short human line from the mixed payload. */
function summarize(data: unknown): string {
  if (data == null) return "";
  if (typeof data === "string") {
    try {
      return summarize(JSON.parse(data));
    } catch {
      return data.slice(0, 140);
    }
  }
  if (typeof data !== "object") return String(data);
  const record = data as Record<string, unknown>;
  const candidate = record.message ?? record.error ?? record.name ?? record.event ?? record.url;
  if (candidate != null) return String(candidate).slice(0, 140);
  return Object.keys(record).slice(0, 4).join(", ");
}

const meta = (value: ColumnMeta) => value;

const COLUMNS: ColumnDef<DataLogRow, unknown>[] = [
  {
    id: "level",
    header: "Level",
    meta: meta({ csv: { key: "level", label: "Level" } }),
    cell: ({ row }) => <Badge tone={LEVEL_TONE[row.original.level ?? "LOG"] ?? "neutral"}>{row.original.level ?? "LOG"}</Badge>,
  },
  {
    id: "logType",
    header: "Type",
    meta: meta({ hideBelow: "md", csv: { key: "logType", label: "Type" } }),
    cell: ({ row }) => <span className="text-xs font-semibold text-ink-muted">{row.original.logType ?? "SYSTEM"}</span>,
  },
  {
    id: "message",
    header: "Message",
    meta: meta({ csv: { key: "message", label: "Message", value: (row) => summarize((row as DataLogRow).data) } }),
    cell: ({ row }) => (
      <span className="block max-w-[32rem] truncate font-mono text-xs text-ink" title={summarize(row.original.data)}>
        {summarize(row.original.data) || <span className="text-ink-faint">Empty payload</span>}
      </span>
    ),
  },
  {
    id: "createdAt",
    header: "When",
    meta: meta({ csv: { key: "createdAt", label: "When" } }),
    cell: ({ row }) => <span className="whitespace-nowrap text-sm text-ink-muted">{when(row.original.createdAt)}</span>,
  },
];

export function DataLogTab() {
  const table = useTableState({ limit: 20 });
  const query = useMemo(() => {
    const { sortBy: _sort, ...rest } = table.query;
    void _sort;
    return { ...rest, search: table.state.search };
  }, [table.query, table.state.search]);
  const logs = useDataLogRows(query);
  const [selected, setSelected] = useState<DataLogRow | null>(null);

  return (
    <>
      <DataTable<DataLogRow>
        columns={COLUMNS}
        data={logs.data}
        loading={logs.isLoading || logs.isFetching}
        error={logs.isError ? errorMessage(logs.error) : null}
        onRetry={() => void logs.refetch()}
        filters={FILTERS}
        searchPlaceholder="Search inside payloads"
        csvName="data-log"
        emptyIcon={Database}
        emptyTitle="No log entries"
        emptyDescription="System events and errors the API records show up here."
        onRowClick={setSelected}
        mobileCard={(row) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Badge tone={LEVEL_TONE[row.level ?? "LOG"] ?? "neutral"}>{row.level ?? "LOG"}</Badge>
              <span className="text-[11px] text-ink-faint">{when(row.createdAt)}</span>
            </div>
            <p className="truncate font-mono text-xs text-ink">{summarize(row.data) || "Empty payload"}</p>
          </div>
        )}
      />
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.logType ?? "SYSTEM"} ${selected.level ?? "LOG"}` : "Log entry"}
        subtitle={selected ? when(selected.createdAt) : undefined}
        width="lg"
      >
        {selected ? (
          <div className="space-y-5">
            <KeyValue
              columns={3}
              items={[
                { label: "Level", value: <Badge tone={LEVEL_TONE[selected.level ?? "LOG"] ?? "neutral"}>{selected.level ?? "LOG"}</Badge> },
                { label: "Type", value: selected.logType ?? "SYSTEM" },
                { label: "Recorded", value: when(selected.createdAt) },
              ]}
            />
            <JsonView title="Payload" value={parsePayload(selected.data)} />
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

function parsePayload(data: unknown) {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
