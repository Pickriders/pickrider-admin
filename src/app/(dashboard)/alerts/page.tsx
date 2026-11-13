"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AlertOctagon, BellRing, CheckCircle2, Hand, Repeat2, Siren } from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo } from "react";

import { AlertActions } from "@/components/alerts/alert-actions";
import { ALERT_TYPE_OPTIONS, ClaimedBy, ResolvedBy, RiderUnpauseLink, SeverityBadge, alertTypeLabel } from "@/components/alerts/alert-ui";
import { LiveAgo } from "@/components/handoffs/handoff-ui";
import { Badge, DataTable, PageHeader, StatCard, StatGrid, Tabs, type ColumnMeta } from "@/components/kit";
import type { AdminAlert, Paged } from "@/lib/admin/api";
import { count, when } from "@/lib/admin/format";
import { useAlerts, useAlertsSummary } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useAdminAlertEvents } from "@/lib/admin/realtime";
import { useTableState, useTabParam } from "@/lib/admin/url-state";

/**
 * Alerts: the few things a person must act on now (an accident, a handoff nobody is taking, a
 * swap locked on wrong codes, a rider releasing orders too often or paused for it). Claim one so teammates see who has it; resolve it with a note.
 * Open shows everything live (claimed included), Mine what I claimed, Resolved the history.
 */
const TABS = ["open", "mine", "resolved"] as const;
type Tab = (typeof TABS)[number];

type AlertRow = AdminAlert & Record<string, unknown>;

const meta = (value: ColumnMeta) => value;

function columns(tab: Tab): ColumnDef<AlertRow, unknown>[] {
  return [
    {
      id: "severity",
      header: "Severity",
      meta: meta({ width: "7rem", skeleton: "badge", csv: { key: "severity", label: "Severity" } }),
      cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
    },
    {
      id: "alert",
      header: "Alert",
      meta: meta({ skeleton: "lines", csv: { key: "title", label: "Alert" } }),
      cell: ({ row }) => (
        <span className="block max-w-[26rem] leading-tight">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-bold text-ink">{row.original.title}</span>
            {row.original.occurrences > 1 ? (
              <span title={`Raised ${row.original.occurrences} times while open`} className="inline-flex cursor-help">
                <Badge tone="neutral">
                  <Repeat2 size={10} aria-hidden />
                  {`${row.original.occurrences}x`}
                </Badge>
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-xs text-ink-muted">{row.original.message}</span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{alertTypeLabel(row.original.type)}</span>
        </span>
      ),
    },
    {
      id: "order",
      header: "Order",
      meta: meta({ hideBelow: "lg", csv: { key: "orderNumber", label: "Order" } }),
      cell: ({ row }) =>
        row.original.orderId ? (
          <Link href={`/orders/${row.original.orderId}`} className="whitespace-nowrap text-[13px] font-bold tabular-nums text-ink hover:text-brand-dark hover:underline">
            {row.original.orderNumber ? `#${row.original.orderNumber}` : "View order"}
          </Link>
        ) : (
          <span className="text-xs text-ink-faint">None</span>
        ),
    },
    {
      id: "rider",
      header: "Rider",
      meta: meta({ hideBelow: "xl", csv: { key: "riderName", label: "Rider" } }),
      cell: ({ row }) =>
        row.original.riderId ? (
          <span className="block leading-tight">
            <Link href={`/couriers/${row.original.riderId}/details`} className="block max-w-[12rem] truncate text-[13px] font-semibold text-ink hover:text-brand-dark hover:underline">
              {row.original.riderName || "Open rider"}
            </Link>
            <RiderUnpauseLink alert={row.original} className="mt-0.5 text-[11px]" />
          </span>
        ) : (
          <span className="text-xs text-ink-faint">None</span>
        ),
    },
    {
      id: "age",
      header: tab === "resolved" ? "Raised" : "Age",
      meta: meta({ width: "8rem", csv: { key: "createdAt", label: "Raised" } }),
      cell: ({ row }) => (
        <span className="block leading-tight">
          <LiveAgo value={row.original.createdAt} className="block text-[13px] font-semibold text-ink" />
          {row.original.lastOccurredAt && row.original.occurrences > 1 ? (
            <span className="mt-0.5 block whitespace-nowrap text-[11px] text-ink-faint">
              last <LiveAgo value={row.original.lastOccurredAt} />
            </span>
          ) : (
            <span className="mt-0.5 block whitespace-nowrap text-[11px] text-ink-faint">{when(row.original.createdAt)}</span>
          )}
          {row.original.escalatedAt ? (
            <span className="mt-0.5 block whitespace-nowrap text-[11px] font-semibold text-danger" title={`Sent to the support WhatsApp at ${when(row.original.escalatedAt)}`}>
              Sent to WhatsApp
            </span>
          ) : null}
        </span>
      ),
    },
    tab === "resolved"
      ? {
          id: "resolved",
          header: "Resolution",
          meta: meta({ hideBelow: "md", skeleton: "lines", csv: { key: "resolutionNote", label: "Resolution" } }),
          cell: ({ row }) => (
            <span className="block">
              <ResolvedBy alert={row.original} />
              {row.original.resolvedAt ? <span className="mt-0.5 block text-[11px] tabular-nums text-ink-faint">{when(row.original.resolvedAt)}</span> : null}
            </span>
          ),
        }
      : {
          id: "claimed",
          header: "Handled by",
          meta: meta({ hideBelow: "md" }),
          cell: ({ row }) =>
            row.original.status === "CLAIMED" ? <ClaimedBy alert={row.original} /> : <span className="text-xs font-semibold text-warning">Nobody yet</span>,
        },
    {
      id: "actions",
      header: "",
      meta: meta({ align: "right", width: "13rem" }),
      cell: ({ row }) => <AlertActions alert={row.original} />,
    },
  ];
}

function AlertCard({ alert }: { alert: AdminAlert }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{alert.title}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{alert.message}</p>
        </div>
        <SeverityBadge severity={alert.severity} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
        <LiveAgo value={alert.createdAt} className="font-semibold text-ink" />
        {alert.orderId ? (
          <Link href={`/orders/${alert.orderId}`} className="font-semibold text-brand-dark">
            {alert.orderNumber ? `#${alert.orderNumber}` : "Order"}
          </Link>
        ) : null}
        {alert.riderId ? (
          <Link href={`/couriers/${alert.riderId}/details`} className="font-semibold text-brand-dark">
            {alert.riderName || "Rider"}
          </Link>
        ) : null}
        <RiderUnpauseLink alert={alert} />
        {alert.occurrences > 1 ? <span>{`${alert.occurrences}x`}</span> : null}
      </div>
      {alert.status === "RESOLVED" ? <ResolvedBy alert={alert} /> : alert.status === "CLAIMED" ? <ClaimedBy alert={alert} /> : null}
      <div className="flex justify-start">
        <AlertActions alert={alert} />
      </div>
    </div>
  );
}

function AlertsHub() {
  const [tab, setTab] = useTabParam<Tab>("open", TABS);
  const table = useTableState({ limit: 20 });
  const summary = useAlertsSummary();
  const live = useAdminAlertEvents();

  const query = useMemo(() => {
    const { page, limit } = table.query;
    const type = table.state.filters.type || undefined;
    if (tab === "resolved") return { page, limit, type, status: "RESOLVED" };
    if (tab === "mine") return { page, limit, type, mine: true };
    return { page, limit, type };
  }, [tab, table.query, table.state.filters.type]);
  const list = useAlerts(query);
  const cols = useMemo(() => columns(tab), [tab]);
  const data = summary.data;

  return (
    <div>
      <PageHeader
        title="Alerts"
        description={
          tab === "resolved"
            ? "Alerts that were dealt with, by a teammate or because the problem went away."
            : "Only what needs a person right now. Claim one so the team knows you have it."
        }
        actions={
          <span
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink-muted"
            title={live.connected ? "New alerts arrive instantly with a toast" : "Live feed offline, refreshing every 20 seconds"}
          >
            <span className={live.connected ? "h-2 w-2 rounded-full bg-success" : "h-2 w-2 rounded-full bg-ink-faint"} />
            {live.connected ? "Live" : "Refreshing every 20s"}
          </span>
        }
      />

      <div className="mb-4">
        <StatGrid columns={4}>
          <StatCard
            label="Nobody on it yet"
            value={data ? count(data.open) : ""}
            icon={BellRing}
            tone={data && data.open > 0 ? "dark" : "default"}
            loading={summary.isLoading}
            hint="Open and unclaimed"
          />
          <StatCard label="Being handled" value={data ? count(data.claimed) : ""} icon={Hand} loading={summary.isLoading} hint="Claimed by a teammate" />
          <StatCard
            label="Urgent"
            value={data ? <span className={data.urgent ? "text-danger" : undefined}>{count(data.urgent)}</span> : ""}
            icon={AlertOctagon}
            loading={summary.isLoading}
            hint="Accidents, sent to WhatsApp after 2 min"
          />
          <StatCard label="High" value={data ? count(data.high) : ""} icon={Siren} loading={summary.isLoading} hint="No rider, code lockouts" />
        </StatGrid>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { id: "open", label: "Open", count: data ? data.open + data.claimed : undefined },
          { id: "mine", label: "Mine" },
          { id: "resolved", label: "Resolved" },
        ]}
      />

      <DataTable<AlertRow>
        columns={cols}
        data={list.data as Paged<AlertRow> | undefined}
        loading={list.isLoading || list.isFetching}
        error={list.isError ? errorMessage(list.error) : null}
        onRetry={() => void list.refetch()}
        searchable={false}
        dateFilter={false}
        filters={[{ key: "type", label: "Type", options: ALERT_TYPE_OPTIONS }]}
        csvName={`alerts-${tab}`}
        mobileCard={(row) => <AlertCard alert={row} />}
        emptyIcon={CheckCircle2}
        emptyTitle={tab === "resolved" ? "Nothing resolved yet" : tab === "mine" ? "You have nothing claimed" : "All clear"}
        emptyDescription={
          tab === "open"
            ? "No rider needs help right now. New alerts pop up here and as a toast with a sound for urgent ones."
            : tab === "mine"
              ? "Alerts you claim show up here until they are resolved."
              : "Resolved alerts and their notes show up here."
        }
      />
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense>
      <AlertsHub />
    </Suspense>
  );
}
