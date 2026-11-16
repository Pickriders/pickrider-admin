"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Coins, Mail, MailX, MessageSquareText, MessagesSquare, X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Badge, Button, DataTable, PageHeader, StatCard, cx, type ColumnMeta, type FilterSpec } from "@/components/kit";
import type { OutboundMessage } from "@/lib/admin/api";
import { ago, count, day, when } from "@/lib/admin/format";
import { useEmailTemplates, useMessages, useMessagesSummary } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { templateTitle } from "@/lib/admin/emails";
import {
  MESSAGE_CHANNEL_LABEL,
  MESSAGE_CHANNEL_TONE,
  MESSAGE_PROVIDER_LABEL,
  MESSAGE_PURPOSE_LABEL,
  MESSAGE_SKIP_REASON_LABEL,
  MESSAGE_STATUS_LABEL,
  channelCounts,
  failureRate,
  label,
  messageHeadline,
  messagesQuery,
  messagesRange,
  shortProviderId,
  skipLine,
  termiiBalanceLabel,
} from "@/lib/admin/messages";
import { useTableState } from "@/lib/admin/url-state";

import { MessageDrawer, MessageStatusBadge, PersonLink } from "./message-drawer";

/**
 * Messages: every SMS (Termii) and email (SMTP) the platform handed to a provider, and what the
 * provider said. For "did the code reach them?" support questions and provider health. Filters,
 * the date range, the recipient search and the open message (`?id=`) all live in the URL, so
 * `/messages?userId=…` or `?orderId=…` from a profile or an order is a shareable view.
 */
type Row = OutboundMessage & Record<string, unknown>;

const meta = (value: ColumnMeta) => value;

const options = (map: Record<string, string>) => Object.entries(map).map(([value, text]) => ({ value, label: text }));

const COLUMNS: ColumnDef<Row, unknown>[] = [
  {
    id: "createdAt",
    header: "Time",
    meta: meta({ width: "9.5rem", csv: { key: "createdAt", label: "Created" } }),
    cell: ({ row }) => (
      <span className="block whitespace-nowrap leading-tight" title={ago(row.original.createdAt)}>
        <span className="block text-sm text-ink">{when(row.original.createdAt)}</span>
        <span className="block text-[11px] text-ink-faint">{ago(row.original.createdAt)}</span>
      </span>
    ),
  },
  {
    id: "channel",
    header: "Channel",
    meta: meta({ width: "6rem", skeleton: "badge", csv: { key: "channel", label: "Channel" } }),
    cell: ({ row }) => <Badge tone={MESSAGE_CHANNEL_TONE[row.original.channel] ?? "neutral"}>{label(MESSAGE_CHANNEL_LABEL, row.original.channel)}</Badge>,
  },
  {
    id: "to",
    header: "To",
    meta: meta({ csv: { key: "to", label: "To" } }),
    cell: ({ row }) => <span className="block max-w-[14rem] truncate font-mono text-xs text-ink" title={row.original.to}>{row.original.to}</span>,
  },
  {
    id: "template",
    header: "Template",
    meta: meta({ hideBelow: "lg", skeleton: "lines", csv: { key: "templateKey", label: "Template", value: (r) => (r as Row).templateKey ?? (r as Row).templateName ?? "" } }),
    cell: ({ row }) => (
      <span className="block max-w-[13rem] leading-tight">
        <span className="block truncate text-sm font-semibold text-ink">
          {row.original.templateKey ? templateTitle(row.original.templateKey) : row.original.templateName || <span className="text-ink-faint">Custom</span>}
        </span>
        <span className="block text-[11px] text-ink-muted">{label(MESSAGE_PURPOSE_LABEL, row.original.purpose)}</span>
      </span>
    ),
  },
  {
    id: "subject",
    header: "Subject or preview",
    meta: meta({ hideBelow: "md", csv: { key: "subject", label: "Subject", value: (r) => messageHeadline(r as Row) } }),
    cell: ({ row }) => {
      const headline = messageHeadline(row.original);
      return (
        <span className="block max-w-[22rem] leading-tight">
          <span className={cx("block truncate text-sm", headline ? "text-ink" : "text-ink-faint")}>{headline || "Open to read the message"}</span>
          {row.original.status === "FAILED" && row.original.error ? <span className="block truncate text-[11px] font-medium text-danger">{row.original.error}</span> : null}
          {row.original.status === "SKIPPED" ? <span className="block truncate text-[11px] font-medium text-ink-muted">{skipLine(row.original)}</span> : null}
        </span>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    meta: meta({ width: "6.5rem", skeleton: "badge", csv: { key: "status", label: "Status" } }),
    cell: ({ row }) => <MessageStatusBadge status={row.original.status} attempts={row.original.attempts} />,
  },
  {
    id: "providerMessageId",
    header: "Provider id",
    meta: meta({ hideBelow: "xl", csv: { key: "providerMessageId", label: "Provider id" } }),
    cell: ({ row }) =>
      row.original.providerMessageId ? (
        <span className="font-mono text-[11px] text-ink-muted" title={row.original.providerMessageId}>
          {shortProviderId(row.original.providerMessageId)}
        </span>
      ) : (
        <span className="text-[11px] text-ink-faint">None</span>
      ),
  },
];

function SummaryStrip() {
  const table = useTableState({ limit: 20 });
  const range = useMemo(() => messagesRange(table.state), [table.state]);
  const summary = useMessagesSummary(range);
  const data = summary.data;
  const loading = summary.isLoading;
  const email = channelCounts(data?.byChannel, "EMAIL");
  const sms = channelCounts(data?.byChannel, "SMS");
  const windowLabel = data ? `${day(data.from)} to ${day(data.to)}` : "Last 7 days";
  const show = (patch: Record<string, string | undefined>) => table.update({ ...patch, id: undefined });
  const rate = (counts: { sent: number; failed: number }) => {
    const value = failureRate(counts);
    return value === null ? "Nothing finished yet" : `${value}% failed`;
  };

  if (summary.isError) {
    return <p className="mb-4 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">Summary unavailable: {errorMessage(summary.error)}</p>;
  }

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
        <StatCard
          label="Emails sent"
          value={count(email.sent)}
          icon={Mail}
          loading={loading}
          hint={email.queued ? `${count(email.queued)} still queued` : windowLabel}
          onClick={() => show({ channel: "EMAIL", status: "SENT" })}
        />
        <StatCard
          label="Emails failed"
          value={<span className={email.failed ? "text-danger" : undefined}>{count(email.failed)}</span>}
          icon={AlertTriangle}
          loading={loading}
          hint={rate(email)}
          onClick={() => show({ channel: "EMAIL", status: "FAILED" })}
        />
        <StatCard
          label="Emails skipped"
          value={<span className={email.skipped ? "text-warning" : undefined}>{count(email.skipped)}</span>}
          icon={MailX}
          loading={loading}
          hint={email.skipped ? "Held back by the email controls" : "Nothing held back"}
          onClick={() => show({ channel: "EMAIL", status: "SKIPPED", skipReason: undefined })}
        />
        <StatCard
          label="SMS sent"
          value={count(sms.sent)}
          icon={MessageSquareText}
          loading={loading}
          hint={sms.queued ? `${count(sms.queued)} still queued` : windowLabel}
          onClick={() => show({ channel: "SMS", status: "SENT" })}
        />
        <StatCard
          label="SMS failed"
          value={<span className={sms.failed ? "text-danger" : undefined}>{count(sms.failed)}</span>}
          icon={AlertTriangle}
          loading={loading}
          hint={rate(sms)}
          onClick={() => show({ channel: "SMS", status: "FAILED" })}
        />
        <StatCard
          label="Termii balance"
          value={data?.termiiBalance ? termiiBalanceLabel(data.termiiBalance) : <span className="text-ink-faint">Not reported</span>}
          icon={Coins}
          loading={loading}
          hint={data?.termiiBalance ? `As of ${when(data.termiiBalance.seenAt)}` : "Shows after the next SMS"}
        />
      </div>
      <p className="mt-2 text-[11px] text-ink-faint">
        {table.state.from || table.state.to ? `Counts for ${windowLabel}, Lagos time.` : `Counts for the last 7 days (${windowLabel}). Pick dates on the table to change the window.`}
      </p>
    </div>
  );
}

function ScopeBar() {
  const table = useTableState({ limit: 20 });
  const { userId, orderId } = table.state.filters;
  if (!userId && !orderId) return null;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink-muted">
      {userId ? (
        <span>
          Messages to <PersonLink userId={userId} />
        </span>
      ) : null}
      {orderId ? (
        <span>
          Messages about order{" "}
          <Link href={`/orders/${orderId}`} className="font-mono text-brand-dark hover:underline">
            {orderId}
          </Link>
        </span>
      ) : null}
      <Button size="sm" variant="ghost" icon={X} onClick={() => table.update({ userId: undefined, orderId: undefined })}>
        Show all
      </Button>
    </div>
  );
}

export function MessagesHub() {
  const table = useTableState({ limit: 20 });
  const query = useMemo(() => messagesQuery(table.state), [table.state]);
  const list = useMessages(query);
  const templates = useEmailTemplates();
  const selectedId = table.state.filters.id;

  const filters = useMemo<FilterSpec[]>(
    () => [
      { key: "channel", label: "Channel", options: options(MESSAGE_CHANNEL_LABEL) },
      { key: "status", label: "Status", options: options(MESSAGE_STATUS_LABEL) },
      { key: "skipReason", label: "Skip reason", options: options(MESSAGE_SKIP_REASON_LABEL) },
      { key: "provider", label: "Provider", options: options(MESSAGE_PROVIDER_LABEL) },
      { key: "purpose", label: "Purpose", options: options(MESSAGE_PURPOSE_LABEL) },
      {
        key: "template",
        label: "Template",
        options: (templates.data ?? [])
          .map((template) => ({ value: template.key, label: templateTitle(template.key) }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      },
    ],
    [templates.data],
  );

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Every SMS and email the platform handed to Termii or our mail server, and what came back, plus emails the email controls held back (Skipped). Codes and secret links are masked before they are stored."
      />
      <SummaryStrip />
      <ScopeBar />
      <DataTable<Row>
        columns={COLUMNS}
        data={list.data as import("@/lib/admin/api").Paged<Row> | undefined}
        loading={list.isLoading || list.isFetching}
        error={list.isError ? errorMessage(list.error) : null}
        onRetry={() => void list.refetch()}
        filters={filters}
        searchPlaceholder="Phone number or email"
        csvName="messages"
        emptyIcon={MessagesSquare}
        emptyTitle="No messages match"
        emptyDescription="Each SMS and email sent from now on is recorded here for 180 days. Try a wider date range or clear a filter."
        onRowClick={(row) => table.update({ id: row.id }, { resetPage: false })}
        rowClassName={(row) => (row.id === selectedId ? "bg-brand-soft/60" : undefined)}
        mobileCard={(row) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Badge tone={MESSAGE_CHANNEL_TONE[row.channel] ?? "neutral"}>{label(MESSAGE_CHANNEL_LABEL, row.channel)}</Badge>
                <MessageStatusBadge status={row.status} attempts={row.attempts} />
              </span>
              <span className="text-[11px] text-ink-faint">{when(row.createdAt)}</span>
            </div>
            <p className="truncate font-mono text-xs text-ink">{row.to}</p>
            <p className="truncate text-[11px] text-ink-muted">
              {row.templateKey ? templateTitle(row.templateKey) : row.templateName || "Custom"}
              {messageHeadline(row) ? ` · ${messageHeadline(row)}` : ""}
            </p>
            {row.status === "SKIPPED" ? <p className="truncate text-[11px] font-medium text-ink-muted">{skipLine(row)}</p> : null}
          </div>
        )}
      />
      <MessageDrawer id={selectedId} onClose={() => table.update({ id: undefined }, { resetPage: false })} />
    </div>
  );
}
