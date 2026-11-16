"use client";

import { ClipboardList, Copy, ExternalLink, Mail, MailX, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Badge, Drawer, KeyValue, LinkButton, Skeleton } from "@/components/kit";
import { templateTitle } from "@/lib/admin/emails";
import { count, fullName, when } from "@/lib/admin/format";
import { useMessage, useUser } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import {
  MESSAGE_CHANNEL_LABEL,
  MESSAGE_CHANNEL_TONE,
  MESSAGE_PROVIDER_LABEL,
  MESSAGE_PURPOSE_LABEL,
  MESSAGE_SKIP_REASON_LABEL,
  MESSAGE_STATUS_LABEL,
  MESSAGE_STATUS_TONE,
  label,
  termiiBalanceLabel,
} from "@/lib/admin/messages";

/** Status pill; a retried message says how many tries it took. */
export function MessageStatusBadge({ status, attempts }: { status: string; attempts?: number }) {
  return (
    <span className="inline-flex items-center gap-1" title={attempts && attempts > 1 ? `${attempts} attempts` : undefined}>
      <Badge tone={MESSAGE_STATUS_TONE[status] ?? "neutral"} dot>
        {label(MESSAGE_STATUS_LABEL, status)}
      </Badge>
      {attempts && attempts > 1 ? <span className="text-[10px] font-semibold text-ink-faint">x{attempts}</span> : null}
    </span>
  );
}

/** A user id as a link to the right profile (courier or customer), named once the user loads. */
export function PersonLink({ userId }: { userId: string }) {
  const user = useUser(userId);
  const href = user.data?.isRider ? `/couriers/${userId}` : `/customers/${userId}`;
  const name = fullName(user.data);
  return (
    <Link href={href} className="font-semibold text-brand-dark hover:underline" title={userId}>
      {name || <span className="font-mono">{userId}</span>}
    </Link>
  );
}

function copy(value: string, what: string) {
  void navigator.clipboard
    ?.writeText(value)
    .then(() => toast.success(`${what} copied`))
    .catch(() => toast.error("Could not copy"));
}

function Mono({ value, what }: { value: string; what: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1">
      <span className="truncate font-mono text-xs" title={value}>
        {value}
      </span>
      <button type="button" onClick={() => copy(value, what)} aria-label={`Copy ${what.toLowerCase()}`} className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-surface hover:text-ink">
        <Copy size={12} />
      </button>
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{title}</p>
      {children}
    </section>
  );
}

/** One message in full: who, what, the redacted body, and what the provider said. Opened by `?id=`. */
export function MessageDrawer({ id, onClose }: { id?: string; onClose: () => void }) {
  const detail = useMessage(id ?? "");
  const m = detail.data;
  const provider = m?.providerResponse;
  const hasProviderResponse = Boolean(provider && (provider.balance != null || provider.message || provider.rejected?.length));

  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      width="lg"
      title={m ? m.subject || (m.templateKey ? templateTitle(m.templateKey) : `${label(MESSAGE_CHANNEL_LABEL, m.channel)} to ${m.to}`) : "Message"}
      subtitle={m ? `${label(MESSAGE_CHANNEL_LABEL, m.channel)} via ${label(MESSAGE_PROVIDER_LABEL, m.provider)} · ${when(m.createdAt)}` : undefined}
    >
      {detail.isError ? (
        <p className="text-sm font-semibold text-danger">{errorMessage(detail.error)}</p>
      ) : !m ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <MessageStatusBadge status={m.status} />
            <Badge tone={MESSAGE_CHANNEL_TONE[m.channel] ?? "neutral"}>{label(MESSAGE_CHANNEL_LABEL, m.channel)}</Badge>
            <Badge>{label(MESSAGE_PURPOSE_LABEL, m.purpose)}</Badge>
            {m.attempts > 1 ? <Badge tone="warning">{count(m.attempts)} attempts</Badge> : null}
          </div>

          {m.status === "FAILED" && m.error ? (
            <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-danger">Why it failed</p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-danger">{m.error}</p>
            </div>
          ) : null}

          {m.status === "SKIPPED" ? (
            <div className="rounded-xl border border-line bg-surface px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                <MailX size={12} aria-hidden />
                Why it was held back
              </p>
              <p className="mt-0.5 text-sm text-ink">
                {m.skipReason ? label(MESSAGE_SKIP_REASON_LABEL, m.skipReason) : "Held back by the email controls"}. Nothing reached the provider and it will not be resent.
              </p>
              {m.templateKey ? (
                <Link href={`/emails?key=${encodeURIComponent(m.templateKey)}`} className="mt-1 inline-block text-xs font-semibold text-brand-dark hover:underline">
                  See the email controls
                </Link>
              ) : null}
            </div>
          ) : null}

          <KeyValue
            items={[
              { label: "To", value: <Mono value={m.to} what="Recipient" /> },
              { label: "Provider", value: label(MESSAGE_PROVIDER_LABEL, m.provider) },
              { label: "Template", value: m.templateKey ? templateTitle(m.templateKey) : m.templateName || "Custom" },
              { label: "Template name", value: m.templateName ? <span className="font-mono text-xs">{m.templateName}</span> : undefined },
              { label: "Created", value: when(m.createdAt) },
              {
                label: m.status === "FAILED" ? "Failed" : m.status === "SKIPPED" ? "Skipped" : "Sent",
                value: when(m.status === "FAILED" ? m.failedAt : m.status === "SKIPPED" ? m.skippedAt : m.sentAt) || undefined,
              },
              ...(m.status === "SKIPPED" && m.skipReason ? [{ label: "Skip reason", value: label(MESSAGE_SKIP_REASON_LABEL, m.skipReason) }] : []),
              { label: "Attempts", value: count(m.attempts) },
              { label: "Provider id", value: m.providerMessageId ? <Mono value={m.providerMessageId} what="Provider id" /> : undefined },
              { label: "Message id", value: <Mono value={m.id} what="Message id" /> },
            ]}
          />

          {m.subject ? (
            <Section title="Subject">
              <p className="text-sm font-semibold text-ink">{m.subject}</p>
            </Section>
          ) : null}

          <Section title={m.channel === "SMS" ? "Text" : "Body (plain text)"}>
            <div className="admin-scroll max-h-80 overflow-y-auto rounded-xl border border-line bg-surface p-3">
              {m.bodyPreview ? (
                <p className="whitespace-pre-wrap break-words text-sm text-ink">{m.bodyPreview}</p>
              ) : (
                <p className="text-sm text-ink-faint">No body was recorded for this message.</p>
              )}
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
              <ShieldCheck size={12} aria-hidden />
              Codes, passwords, tokens and secret link values are masked before storage. Long bodies are cut at 2,000 characters.
            </p>
          </Section>

          {hasProviderResponse ? (
            <Section title={`What ${label(MESSAGE_PROVIDER_LABEL, m.provider)} said`}>
              <div className="rounded-xl border border-line bg-card p-3">
                <KeyValue
                  items={[
                    ...(provider?.message ? [{ label: "Response", value: <span className="whitespace-normal">{provider.message}</span> }] : []),
                    ...(provider?.balance != null ? [{ label: "Balance after send", value: termiiBalanceLabel({ balance: provider.balance, currency: provider.currency }) }] : []),
                    ...(provider?.rejected?.length ? [{ label: "Rejected addresses", value: <span className="whitespace-normal font-mono text-xs">{provider.rejected.join(", ")}</span> }] : []),
                  ]}
                />
              </div>
            </Section>
          ) : null}

          {m.userId || m.orderId || m.templateKey ? (
            <Section title="Related">
              <div className="space-y-2">
                {m.userId ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <User size={14} className="shrink-0 text-ink-faint" aria-hidden />
                      <PersonLink userId={m.userId} />
                    </span>
                    <Link href={`/messages?userId=${m.userId}`} className="text-xs font-semibold text-brand-dark hover:underline">
                      All messages to them
                    </Link>
                  </div>
                ) : null}
                {m.orderId ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
                    <Link href={`/orders/${m.orderId}`} className="flex min-w-0 items-center gap-2 text-sm font-semibold text-brand-dark hover:underline">
                      <ClipboardList size={14} className="shrink-0 text-ink-faint" aria-hidden />
                      Open the order
                    </Link>
                    <Link href={`/messages?orderId=${m.orderId}`} className="text-xs font-semibold text-brand-dark hover:underline">
                      All messages about it
                    </Link>
                  </div>
                ) : null}
                {m.channel === "EMAIL" && m.templateKey ? (
                  <LinkButton href={`/emails?key=${encodeURIComponent(m.templateKey)}`} icon={Mail} variant="outline" size="sm">
                    Preview the {templateTitle(m.templateKey).toLowerCase()} email
                  </LinkButton>
                ) : null}
              </div>
            </Section>
          ) : null}

          {m.providerMessageId && m.provider === "TERMII" ? (
            <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
              <ExternalLink size={12} aria-hidden />
              Search the provider id in the Termii dashboard for the carrier&apos;s delivery report.
            </p>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}
