"use client";

import { Activity, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Drawer, EmptyState, ErrorState, Input, Panel, Select, Skeleton } from "@/components/kit";
import { CopyButton } from "@/components/users/person-card";
import type { DeveloperDetail, DeveloperRequestLog } from "@/lib/admin/api";
import { ago, when } from "@/lib/admin/format";
import { useDeveloperRequestLog, useDeveloperRequestLogs } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { Fact, JsonBlock, LoadMore, MethodTag, Segmented, StatusPill, type Mode } from "./team-shared";

const STATUSES = [
  { value: "", label: "All" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "4xx", label: "4xx" },
  { value: "5xx", label: "5xx" },
] as const;
type StatusFilter = (typeof STATUSES)[number]["value"];
const METHODS = ["GET", "POST", "PATCH", "PUT", "DELETE"];

/** "312 ms" or "2.4 s". */
export function duration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`;
}

/** The query the request log takes: a request id finds one request in either mode; otherwise the mode and filters. */
export function requestLogQuery(
  mode: Mode,
  filters: { status: string; method: string; path: string; key: string; requestId: string },
) {
  const requestId = filters.requestId.trim();
  if (requestId) return { request_id: requestId };
  return {
    livemode: mode === "live" ? "true" : "false",
    status: filters.status,
    method: filters.method,
    path: filters.path.trim(),
    key: filters.key,
  };
}

function useDebounced<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

function RequestRow({ row, onOpen }: { row: DeveloperRequestLog; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-surface focus:bg-surface focus:outline-none"
      >
        <StatusPill status={row.status} />
        <MethodTag method={row.method} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[13px] text-ink">{row.path}</span>
          {row.errorCode ? (
            <span className="block truncate text-[11px] text-ink-muted">
              {row.errorType ? `${row.errorType} · ` : ""}
              {row.errorCode}
            </span>
          ) : null}
        </span>
        <span className="hidden shrink-0 font-mono text-[11px] text-ink-faint md:inline">
          {row.key?.prefix ? `${row.key.prefix}…` : ""}
        </span>
        <span className="w-16 shrink-0 text-right text-xs tabular-nums text-ink-muted">{duration(row.durationMs)}</span>
        <span className="w-24 shrink-0 text-right text-xs text-ink-faint" title={when(row.createdAt)}>
          {ago(row.createdAt)}
        </span>
      </button>
    </li>
  );
}

function RequestDrawer({ teamId, logId, onClose }: { teamId: string; logId: string | null; onClose: () => void }) {
  const log = useDeveloperRequestLog(teamId, logId);
  const r = log.data;
  return (
    <Drawer
      open={Boolean(logId)}
      onClose={onClose}
      width="lg"
      title={
        r ? (
          <span className="flex min-w-0 items-center gap-2.5">
            <StatusPill status={r.status} />
            <MethodTag method={r.method} />
            <span className="truncate font-mono text-base">{r.path}</span>
          </span>
        ) : (
          "Request"
        )
      }
      subtitle={
        r ? `${when(r.createdAt)} · ${duration(r.durationMs)} · ${r.livemode ? "live" : "test"} mode` : undefined
      }
    >
      {log.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : log.isError ? (
        <ErrorState
          message={errorMessage(log.error, "Could not load this request.")}
          onRetry={() => void log.refetch()}
        />
      ) : r ? (
        <div className="space-y-5">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Fact label="Request id" mono>
              {r.requestId ? (
                <span className="flex items-center gap-1">
                  <span className="truncate">{r.requestId}</span>
                  <CopyButton text={r.requestId} label="Copy request id" />
                </span>
              ) : null}
            </Fact>
            <Fact label="Key" mono>
              {r.key ? `${r.key.label ?? "Deleted key"} · ${r.key.prefix ?? ""}…` : null}
            </Fact>
            <Fact label="Error">
              {r.errorCode ? `${r.errorType ?? "error"} · ${r.errorCode}` : r.status < 400 ? "None" : null}
            </Fact>
            <Fact label="IP address" mono>
              {r.ip}
            </Fact>
            <div className="sm:col-span-2">
              <Fact label="User agent" mono>
                {r.userAgent}
              </Fact>
            </div>
          </dl>
          {r.query ? <JsonBlock label="Query" value={r.query} /> : null}
          <JsonBlock label="Request body" value={r.requestBody} />
          <JsonBlock label="Response body" value={r.responseBody} empty="No body returned." />
          <p className="text-xs text-ink-faint">
            Card numbers, secrets and similar fields were redacted before the request was stored.
          </p>
        </div>
      ) : null}
    </Drawer>
  );
}

/** Every API request the team's keys made in the last 30 days, as the developer sees it in their request log. */
export function TeamRequests({ team, mode }: { team: DeveloperDetail; mode: Mode }) {
  const [status, setStatus] = useState<StatusFilter>("");
  const [method, setMethod] = useState("");
  const [key, setKey] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [requestIdInput, setRequestIdInput] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const path = useDebounced(pathInput);
  const requestId = useDebounced(requestIdInput);

  const query = useMemo(
    () => requestLogQuery(mode, { status, method, path, key, requestId }),
    [mode, status, method, path, key, requestId],
  );
  const logs = useDeveloperRequestLogs(team.id, query);
  const keys = team.keys.filter((k) => k.livemode === (mode === "live"));

  return (
    <Panel>
      <div className="space-y-3 border-b border-line px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-bold text-ink">API requests</h3>
            <p className="text-xs text-ink-muted">
              The last 30 days in {mode} mode, newest first. Open one for its bodies.
            </p>
          </div>
          <Segmented
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Input
            left={<Search size={14} />}
            placeholder="Path contains, e.g. /orders"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            aria-label="Path"
          />
          <Input
            placeholder="Request id (either mode)"
            value={requestIdInput}
            onChange={(e) => setRequestIdInput(e.target.value)}
            aria-label="Request id"
            className="font-mono"
          />
          <Select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Method">
            <option value="">Any method</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select value={key} onChange={(e) => setKey(e.target.value)} aria-label="Key">
            <option value="">Any key</option>
            {keys.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label || "Unnamed key"} · {k.prefix}…
              </option>
            ))}
          </Select>
        </div>
      </div>

      {logs.isLoading ? (
        <div className="space-y-2 px-5 py-4" aria-busy>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : logs.isError ? (
        <div className="p-5">
          <ErrorState
            message={errorMessage(logs.error, "Could not load requests.")}
            onRetry={() => void logs.refetch()}
          />
        </div>
      ) : logs.rows.length ? (
        <ul className="divide-y divide-line">
          {logs.rows.map((row) => (
            <RequestRow key={row.id} row={row} onOpen={() => setOpen(row.id)} />
          ))}
        </ul>
      ) : (
        <EmptyState
          compact
          icon={Activity}
          title="No requests"
          description={requestId ? "No request with that id in this team." : "Nothing matches in the last 30 days."}
        />
      )}
      <LoadMore
        hasMore={Boolean(logs.hasNextPage)}
        loading={logs.isFetchingNextPage}
        onMore={() => void logs.fetchNextPage()}
        shown={logs.rows.length}
        noun="requests"
      />
      <RequestDrawer teamId={team.id} logId={open} onClose={() => setOpen(null)} />
    </Panel>
  );
}
