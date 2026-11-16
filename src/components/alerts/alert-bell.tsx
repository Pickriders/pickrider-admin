"use client";

import { ArrowRight, Bell, BellRing, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button, Skeleton, cx } from "@/components/kit";
import { UI } from "@/components/ui";
import type { AdminAlert, AlertsSummary } from "@/lib/admin/api";
import { canAccessSection, type AdminRole } from "@/lib/admin-access";
import { playUrgentChime } from "@/lib/admin/chime";
import { count } from "@/lib/admin/format";
import { useAlerts, useAlertsSummary } from "@/lib/admin/hooks";
import { useAdminAlertEvents, type AlertEvent } from "@/lib/admin/realtime";
import { useCan } from "@/lib/admin/use-can";

import { useClaimAlert } from "./alert-actions";
import { AlertEmailMeta, ClaimedBy, RiderUnpauseLink, alertHref, URGENT_ALERT_TYPES, alertTypeLabel, digestTitle } from "./alert-ui";
import { LiveAgo } from "@/components/handoffs/handoff-ui";

/**
 * The bell in the top bar: how many alerts nobody has claimed (red when one is urgent), a short
 * list of the live ones, and the live toasts. New alerts arrive on the orders socket; when the
 * socket is down the summary still refreshes every 20 seconds, but toasts wait for the socket.
 */
export const alertToastId = (alertId: string) => `alert-${alertId}`;

/** What the badge on the bell shows. Exported for the test. */
export function bellBadge(summary: Pick<AlertsSummary, "open" | "urgent" | "claimed"> | undefined) {
  if (!summary || summary.open <= 0) return null;
  return { label: summary.open > 99 ? "99+" : String(summary.open), urgent: summary.urgent > 0 };
}

export function AlertBell() {
  const { roles, ready } = useCan();
  const allowed = ready && (roles.length === 0 || canAccessSection("/alerts", roles as AdminRole[]));
  if (!allowed) return null;
  return <AlertBellButton />;
}

function AlertBellButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const summary = useAlertsSummary();
  const list = useAlerts({ status: "OPEN,CLAIMED", limit: 6 }, open);
  const claim = useClaimAlert((alert) => toast.dismiss(alertToastId(alert.id)));

  const onEvent = useCallback(
    (event: AlertEvent) => {
      if (event.kind === "raised") {
        showAlertToast(event.alert, { onClaim: (id) => claim.mutate(id), onOpen: () => router.push(alertHref(event.alert.id)) });
        return;
      }
      if (event.kind === "updated") {
        if (event.alert.status !== "OPEN") toast.dismiss(alertToastId(event.alert.id));
        return;
      }
      const { type, count: total } = event.digest;
      const urgent = URGENT_ALERT_TYPES.has(type);
      if (urgent) playUrgentChime();
      toast[urgent ? "error" : "warning"](digestTitle(type, total), {
        id: `alert-digest-${type}`,
        description: "Too many to show one by one. Open the list to work through them.",
        duration: urgent ? Infinity : 15_000,
        action: { label: "Open", onClick: () => router.push(`/alerts?type=${encodeURIComponent(type)}`) },
      });
    },
    // claim.mutate is stable; router is stable in the app router.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router],
  );
  const live = useAdminAlertEvents(onEvent);

  const badge = bellBadge(summary.data);
  const data = summary.data;
  const items = list.data?.items ?? [];

  return (
    <UI.Popover open={open} onOpenChange={setOpen}>
      <UI.PopoverTrigger asChild>
        <button
          type="button"
          aria-label={badge ? `Alerts, ${badge.label} open${badge.urgent ? ", urgent" : ""}` : "Alerts"}
          title={data ? `${count(data.open)} open · ${count(data.claimed)} being handled${data.urgent ? ` · ${count(data.urgent)} urgent` : ""}` : "Alerts"}
          className={cx(
            "relative grid h-9 w-9 place-items-center rounded-xl border bg-card transition-colors hover:text-ink",
            badge?.urgent ? "border-danger/40 text-danger" : "border-line text-ink-muted hover:border-brand/40",
          )}
        >
          {badge?.urgent ? <BellRing size={17} className="admin-bell-ring" /> : <Bell size={17} />}
          {badge ? (
            <span
              className={cx(
                "absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-black leading-none text-white ring-2 ring-card tabular-nums",
                badge.urgent ? "bg-danger" : "bg-warning",
              )}
            >
              {badge.label}
            </span>
          ) : null}
        </button>
      </UI.PopoverTrigger>
      <UI.PopoverContent align="end" sideOffset={10} collisionPadding={12} className="w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border-line bg-card p-0">
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-black tracking-tight text-ink">Alerts</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              {data ? (
                <>
                  <span className={cx("font-semibold", data.open ? "text-warning" : "text-ink-muted")}>{count(data.open)} open</span> · {count(data.claimed)} being handled
                  {data.urgent ? <span className="font-semibold text-danger">{` · ${count(data.urgent)} urgent`}</span> : null}
                </>
              ) : (
                "Loading"
              )}
            </p>
          </div>
          <span
            title={live.connected ? "Alerts arrive instantly" : "Live feed offline, checking every 20 seconds"}
            className={cx("mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold", live.connected ? "bg-success-soft text-success" : "bg-surface text-ink-muted")}
          >
            <span className={cx("h-1.5 w-1.5 rounded-full", live.connected ? "bg-success" : "bg-ink-faint")} />
            {live.connected ? "Live" : "Every 20s"}
          </span>
        </div>
        <div className="admin-scroll max-h-[min(24rem,60vh)] overflow-y-auto">
          {list.isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !items.length ? (
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <span className="mb-2 grid h-10 w-10 place-items-center rounded-2xl bg-success-soft text-success">
                <CheckCircle2 size={18} />
              </span>
              <p className="text-sm font-bold text-ink">Nothing needs you</p>
              <p className="mt-0.5 text-xs text-ink-muted">Alerts show up here the moment a rider needs help.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((alert) => (
                <li key={alert.id} className="flex gap-3 px-4 py-3">
                  <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", alert.severity === "URGENT" ? "bg-danger" : "bg-warning")} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-[13px] font-bold text-ink">{alert.title}</p>
                      <LiveAgo value={alert.lastOccurredAt ?? alert.createdAt} className="shrink-0 text-[11px] text-ink-faint" />
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{alert.message}</p>
                    <AlertEmailMeta alert={alert} className="mt-1" />
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {alert.status === "OPEN" ? (
                        <Button size="sm" className="h-7 px-2.5" loading={claim.isPending && claim.variables === alert.id} onClick={() => claim.mutate(alert.id)}>
                          Claim
                        </Button>
                      ) : (
                        <ClaimedBy alert={alert} />
                      )}
                      {alert.orderId ? (
                        <Link href={`/orders/${alert.orderId}`} onClick={() => setOpen(false)} className="text-[11px] font-semibold text-brand-dark hover:underline">
                          {alert.orderNumber ? `Order #${alert.orderNumber}` : "Open order"}
                        </Link>
                      ) : null}
                      <RiderUnpauseLink alert={alert} onClick={() => setOpen(false)} className="text-[11px]" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {data?.byType.length ? (
          <div className="flex flex-wrap gap-1.5 border-t border-line px-4 py-2.5">
            {data.byType
              .filter((row) => row.open + row.claimed > 0)
              .map((row) => (
                <Link
                  key={row.type}
                  href={`/alerts?type=${encodeURIComponent(row.type)}`}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-ink-muted hover:border-line-strong hover:text-ink"
                >
                  {alertTypeLabel(row.type)}
                  <span className={cx("tabular-nums", row.severity === "URGENT" ? "text-danger" : "text-warning")}>{row.open + row.claimed}</span>
                </Link>
              ))}
          </div>
        ) : null}
        <Link
          href="/alerts"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-1.5 border-t border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink hover:text-brand-dark"
        >
          Open all alerts <ArrowRight size={13} />
        </Link>
      </UI.PopoverContent>
    </UI.Popover>
  );
}

/** One toast per new alert. URGENT ones chime and stay until claimed or closed. */
export function showAlertToast(alert: AdminAlert, handlers: { onClaim: (alertId: string) => void; onOpen: () => void }) {
  const urgent = alert.severity === "URGENT";
  if (urgent) playUrgentChime();
  const show = urgent ? toast.error : toast.warning;
  show(alert.title, {
    id: alertToastId(alert.id),
    description: [alert.message, alert.orderNumber && !alert.message.includes(alert.orderNumber) ? `Order #${alert.orderNumber}` : ""].filter(Boolean).join(" · "),
    duration: urgent ? Infinity : 12_000,
    action: { label: "Claim", onClick: () => handlers.onClaim(alert.id) },
    cancel: { label: "View", onClick: handlers.onOpen },
  });
}
