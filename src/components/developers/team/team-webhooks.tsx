"use client";

import { ChevronRight, Webhook } from "lucide-react";
import { useState } from "react";

import { Badge, Button, Drawer, EmptyState, ErrorState, Panel, Skeleton, cx, type Tone } from "@/components/kit";
import { CopyButton } from "@/components/users/person-card";
import type { DeveloperWebhookDelivery, DeveloperWebhookEndpoint } from "@/lib/admin/api";
import { ago, count, day, percent, when } from "@/lib/admin/format";
import { useDeveloperWebhookDeliveries, useDeveloperWebhookEndpoints } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { Expandable, JsonBlock, LoadMore, StatusPill, rate, type Mode } from "./team-shared";
import { duration } from "./team-requests";

/** An endpoint's state in a word: delivering, failing since…, or turned off and why. */
export function endpointHealth(
  endpoint: Pick<DeveloperWebhookEndpoint, "status" | "disabled_reason" | "failing_since">,
): { label: string; tone: Tone } {
  if (endpoint.status === "disabled")
    return {
      label: endpoint.disabled_reason === "failing" ? "Turned off: kept failing" : "Turned off by the team",
      tone: "neutral",
    };
  if (endpoint.failing_since) return { label: `Failing since ${day(endpoint.failing_since)}`, tone: "danger" };
  return { label: "Delivering", tone: "success" };
}

const DELIVERY_TONE: Record<DeveloperWebhookDelivery["status"], Tone> = {
  succeeded: "success",
  failed: "danger",
  pending: "warning",
  delivering: "info",
};

function DeliveryBar({ endpoint }: { endpoint: DeveloperWebhookEndpoint }) {
  const total = endpoint.deliveries7d;
  const segments = [
    { value: endpoint.succeeded7d, className: "bg-success", label: "succeeded" },
    { value: endpoint.failed7d, className: "bg-danger", label: "failed" },
    {
      value: Math.max(0, total - endpoint.succeeded7d - endpoint.failed7d),
      className: "bg-warning",
      label: "still trying",
    },
  ];
  const success = rate(endpoint.succeeded7d, endpoint.succeeded7d + endpoint.failed7d);
  return (
    <div>
      <div
        className="flex h-2 overflow-hidden rounded-full bg-surface"
        role="img"
        aria-label={segments.map((s) => `${s.value} ${s.label}`).join(", ")}
      >
        {total
          ? segments.map((s) =>
              s.value ? (
                <div key={s.label} className={s.className} style={{ width: `${(s.value / total) * 100}%` }} />
              ) : null,
            )
          : null}
      </div>
      <p className="mt-1.5 text-xs text-ink-muted">
        {total ? (
          <>
            <span className="font-semibold text-ink">{success === null ? "—" : percent(success * 100)}</span> delivered
            of {count(total)} in 7 days
            {endpoint.failed7d ? ` · ${count(endpoint.failed7d)} failed` : ""}
            {endpoint.pending ? ` · ${count(endpoint.pending)} waiting` : ""}
          </>
        ) : (
          "No deliveries in the last 7 days"
        )}
      </p>
    </div>
  );
}

function EndpointCard({ endpoint, onDeliveries }: { endpoint: DeveloperWebhookEndpoint; onDeliveries: () => void }) {
  const health = endpointHealth(endpoint);
  const all = endpoint.enabled_events.includes("*");
  return (
    <li className="px-5 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5">
            <span className="truncate font-mono text-[13px] font-semibold text-ink" title={endpoint.url}>
              {endpoint.url}
            </span>
            <CopyButton text={endpoint.url} label="Copy URL" />
          </p>
          {endpoint.description ? <p className="mt-0.5 text-xs text-ink-muted">{endpoint.description}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={health.tone} dot>
              {health.label}
            </Badge>
            <Badge tone="neutral">
              {all
                ? "Every event"
                : `${endpoint.enabled_events.length} event${endpoint.enabled_events.length === 1 ? "" : "s"}`}
            </Badge>
            {endpoint.previous_secret_expires_at ? (
              <Badge tone="info">Secret rolled; old one ends {when(endpoint.previous_secret_expires_at)}</Badge>
            ) : null}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onDeliveries} className="shrink-0">
          Deliveries <ChevronRight size={13} aria-hidden />
        </Button>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <DeliveryBar endpoint={endpoint} />
        <p className="text-xs text-ink-faint lg:text-right">
          {endpoint.lastDeliveryAt ? `Last tried ${ago(endpoint.lastDeliveryAt)}` : "Never tried"} · added{" "}
          {day(endpoint.created)}
          <span className="ml-1.5 font-mono">{endpoint.id}</span>
        </p>
      </div>
      {!all ? (
        <div className="mt-2.5">
          <Expandable summary="Events it gets">
            <p className="flex flex-wrap gap-1">
              {endpoint.enabled_events.map((event) => (
                <span key={event} className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">
                  {event}
                </span>
              ))}
            </p>
          </Expandable>
        </div>
      ) : null}
    </li>
  );
}

function DeliveryRow({ delivery }: { delivery: DeveloperWebhookDelivery }) {
  const [open, setOpen] = useState(false);
  const last = delivery.attempts[delivery.attempts.length - 1];
  return (
    <li className="rounded-xl border border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left"
      >
        <Badge tone={DELIVERY_TONE[delivery.status]} dot>
          {delivery.status}
        </Badge>
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{delivery.event_type}</span>
        <span className="hidden shrink-0 text-xs text-ink-muted sm:inline">
          {delivery.attempt_count} attempt{delivery.attempt_count === 1 ? "" : "s"}
          {last?.status_code ? ` · last ${last.status_code}` : ""}
        </span>
        <span className="w-20 shrink-0 text-right text-xs text-ink-faint" title={when(delivery.created)}>
          {ago(delivery.created)}
        </span>
        <ChevronRight
          size={14}
          className={cx("shrink-0 text-ink-faint transition-transform", open && "rotate-90")}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-line px-3.5 py-3.5">
          <p className="text-xs text-ink-muted">
            Event <span className="font-mono">{delivery.event_id}</span>
            {delivery.delivered_at
              ? ` · delivered ${when(delivery.delivered_at)}`
              : delivery.next_attempt_at
                ? ` · next try ${when(delivery.next_attempt_at)}`
                : ""}
          </p>
          {delivery.attempts.length ? (
            <ol className="space-y-2">
              {delivery.attempts.map((attempt, i) => (
                <li key={i} className="rounded-lg bg-surface px-3 py-2">
                  <p className="flex flex-wrap items-center gap-2 text-xs">
                    <StatusPill status={attempt.status_code} label={attempt.status_code ?? "no answer"} />
                    <span className="text-ink-muted">
                      Try {i + 1} · {when(attempt.at)} · {duration(attempt.duration_ms)}
                    </span>
                  </p>
                  {attempt.error ? <p className="mt-1 text-xs text-danger">{attempt.error}</p> : null}
                  {attempt.response_body ? (
                    <pre className="mt-1.5 max-h-32 overflow-auto font-mono text-[11px] text-ink-muted">
                      {attempt.response_body}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-ink-faint">Not tried yet.</p>
          )}
          <JsonBlock label="What was sent" value={delivery.request_body} empty="The event has expired." />
        </div>
      ) : null}
    </li>
  );
}

function DeliveriesDrawer({
  teamId,
  endpoint,
  onClose,
}: {
  teamId: string;
  endpoint: DeveloperWebhookEndpoint | null;
  onClose: () => void;
}) {
  const deliveries = useDeveloperWebhookDeliveries(teamId, endpoint?.id ?? null);
  return (
    <Drawer
      open={Boolean(endpoint)}
      onClose={onClose}
      width="lg"
      title="Deliveries"
      subtitle={endpoint ? <span className="font-mono">{endpoint.url}</span> : undefined}
    >
      {deliveries.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      ) : deliveries.isError ? (
        <ErrorState
          message={errorMessage(deliveries.error, "Could not load deliveries.")}
          onRetry={() => void deliveries.refetch()}
        />
      ) : deliveries.rows.length ? (
        <>
          <ul className="space-y-2">
            {deliveries.rows.map((delivery) => (
              <DeliveryRow key={delivery.id} delivery={delivery} />
            ))}
          </ul>
          <LoadMore
            hasMore={Boolean(deliveries.hasNextPage)}
            loading={deliveries.isFetchingNextPage}
            onMore={() => void deliveries.fetchNextPage()}
            shown={deliveries.rows.length}
            noun="deliveries"
          />
        </>
      ) : (
        <EmptyState compact icon={Webhook} title="No deliveries" description="Deliveries are kept for 30 days." />
      )}
    </Drawer>
  );
}

/** The team's webhook endpoints in the page's mode, how each is delivering, and every delivery on request. */
export function TeamWebhooks({ teamId, mode }: { teamId: string; mode: Mode }) {
  const endpoints = useDeveloperWebhookEndpoints(teamId);
  const [open, setOpen] = useState<DeveloperWebhookEndpoint | null>(null);
  const rows = (endpoints.data?.data ?? []).filter((e) => e.livemode === (mode === "live"));
  const other = (endpoints.data?.data.length ?? 0) - rows.length;

  return (
    <Panel>
      <div className="border-b border-line px-5 py-4">
        <h3 className="text-sm font-bold text-ink">Webhook endpoints</h3>
        <p className="text-xs text-ink-muted">
          Where Pickriders sends their {mode} events. An endpoint that fails every delivery for 3 days is turned off and
          the team is emailed.
          {other ? ` ${count(other)} more in ${mode === "live" ? "test" : "live"} mode.` : ""}
        </p>
      </div>
      {endpoints.isLoading ? (
        <div className="space-y-3 p-5">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : endpoints.isError ? (
        <div className="p-5">
          <ErrorState
            message={errorMessage(endpoints.error, "Could not load webhook endpoints.")}
            onRetry={() => void endpoints.refetch()}
          />
        </div>
      ) : rows.length ? (
        <ul className="divide-y divide-line">
          {rows.map((endpoint) => (
            <EndpointCard key={endpoint.id} endpoint={endpoint} onDeliveries={() => setOpen(endpoint)} />
          ))}
        </ul>
      ) : (
        <EmptyState
          compact
          icon={Webhook}
          title={`No ${mode} endpoints`}
          description="They add endpoints in the developer dashboard."
        />
      )}
      <DeliveriesDrawer teamId={teamId} endpoint={open} onClose={() => setOpen(null)} />
    </Panel>
  );
}
