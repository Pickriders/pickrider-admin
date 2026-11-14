"use client";

import { AlertOctagon, AlertTriangle, Mail, PlayCircle } from "lucide-react";
import Link from "next/link";

import { Badge, cx } from "@/components/kit";
import type { AdminAlert } from "@/lib/admin/api";
import { fullName, time, when } from "@/lib/admin/format";
import { useMe, useStaffName } from "@/lib/admin/hooks";

/**
 * Labels and small pieces for staff alerts, shared by the bell, its toasts and the Alerts page.
 * The type list is open on the API; unknown types fall back to a readable version of the key.
 */
export const ALERT_TYPE_LABEL: Record<string, string> = {
  HANDOFF_ACCIDENT: "Accident",
  HANDOFF_NO_RIDER: "No rider for handoff",
  HANDOFF_CODE_LOCKOUT: "Handoff code lockout",
  RIDER_FREQUENT_RELEASES: "Frequent releases",
  RIDER_AUTO_PAUSED: "Rider paused",
};

/** Types whose alerts are URGENT, for digests (which carry the type only). */
export const URGENT_ALERT_TYPES = new Set(["HANDOFF_ACCIDENT"]);

export function alertTypeLabel(type: string) {
  return ALERT_TYPE_LABEL[type] ?? type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

/** "15 handoffs waiting for a rider": one toast for a burst instead of fifteen. */
export function digestTitle(type: string, count: number) {
  const n = count.toLocaleString("en-NG");
  switch (type) {
    case "HANDOFF_NO_RIDER":
      return `${n} handoff${count === 1 ? "" : "s"} waiting for a rider`;
    case "HANDOFF_ACCIDENT":
      return `${n} accident${count === 1 ? "" : "s"} reported by riders`;
    case "HANDOFF_CODE_LOCKOUT":
      return `${n} handoff swap${count === 1 ? "" : "s"} locked on wrong codes`;
    case "RIDER_FREQUENT_RELEASES":
      return `${n} rider${count === 1 ? "" : "s"} releasing orders often`;
    case "RIDER_AUTO_PAUSED":
      return `${n} rider${count === 1 ? "" : "s"} paused for too many releases`;
    default:
      return `${n} new ${alertTypeLabel(type).toLowerCase()} alert${count === 1 ? "" : "s"}`;
  }
}

/**
 * Where staff unpause a rider: the rider page, which opens its Resume dispatch dialog when the
 * rider is still paused. Only RIDER_AUTO_PAUSED alerts offer it.
 */
export function riderUnpauseHref(alert: Pick<AdminAlert, "type" | "riderId">) {
  if (alert.type !== "RIDER_AUTO_PAUSED" || !alert.riderId) return null;
  return `/couriers/${alert.riderId}/details?resume=dispatch`;
}

/** "Review and unpause" link for a rider the release rules paused; nothing for other alerts. */
export function RiderUnpauseLink({ alert, onClick, className }: { alert: Pick<AdminAlert, "type" | "riderId">; onClick?: () => void; className?: string }) {
  const href = riderUnpauseHref(alert);
  if (!href) return null;
  return (
    <Link href={href} onClick={onClick} className={cx("inline-flex items-center gap-1 font-semibold text-brand-dark hover:underline", className)}>
      <PlayCircle size={12} aria-hidden />
      Review and unpause
    </Link>
  );
}

export const ALERT_TYPE_OPTIONS = Object.keys(ALERT_TYPE_LABEL).map((value) => ({ value, label: ALERT_TYPE_LABEL[value] }));

export function SeverityBadge({ severity }: { severity: string }) {
  const urgent = severity === "URGENT";
  return (
    <Badge tone={urgent ? "danger" : "warning"} className={cx(urgent && "font-bold")}>
      {urgent ? <AlertOctagon size={10} aria-hidden /> : <AlertTriangle size={10} aria-hidden />}
      {urgent ? "Urgent" : "High"}
    </Badge>
  );
}

/** "Ada is handling this", "You are handling this", or nothing while unclaimed. */
export function ClaimedBy({ alert, className }: { alert: Pick<AdminAlert, "status" | "claimedBy">; className?: string }) {
  const me = useMe();
  const staff = useStaffName(alert.status === "CLAIMED" && alert.claimedBy !== me.data?._id ? alert.claimedBy : null);
  if (alert.status !== "CLAIMED" || !alert.claimedBy) return null;
  const mine = alert.claimedBy === me.data?._id;
  const name = mine ? "You are" : `${fullName(staff.data) || "A teammate"} is`;
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-[11px] font-semibold text-info", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-info" aria-hidden />
      {name} handling this
    </span>
  );
}

/** Who closed it: the system once the problem went away, or a named admin with their note. */
export function ResolvedBy({ alert }: { alert: Pick<AdminAlert, "resolution" | "resolvedBy" | "resolutionNote"> }) {
  const me = useMe();
  const staff = useStaffName(alert.resolution === "ADMIN" && alert.resolvedBy !== me.data?._id ? alert.resolvedBy : null);
  const who =
    alert.resolution === "AUTO" ? "Resolved itself" : alert.resolvedBy === me.data?._id ? "Resolved by you" : `Resolved by ${fullName(staff.data) || "a teammate"}`;
  return (
    <span className="block max-w-[16rem] leading-tight">
      <span className="block text-[12px] font-semibold text-success">{who}</span>
      {alert.resolutionNote ? <span className="mt-0.5 block break-words text-[11px] text-ink-muted">&ldquo;{alert.resolutionNote}&rdquo;</span> : null}
    </span>
  );
}

type EmailFields = Pick<AdminAlert, "emailedAt" | "emailReminderAt" | "emailDigestAt" | "emailResolvedAt" | "emailRecipientsCount">;

/**
 * What core emailed support about an alert, oldest first: the escalation ("Emailed support at
 * 10:42"), the one reminder, a storm digest listing it instead, and the resolved follow-up.
 */
export function alertEmailMeta(alert: EmailFields): { key: string; label: string; title: string }[] {
  const out: { key: string; label: string; title: string }[] = [];
  if (alert.emailedAt) {
    const n = alert.emailRecipientsCount;
    out.push({
      key: "emailed",
      label: `Emailed support at ${time(alert.emailedAt)}`,
      title: `Emailed ${n ? `${n} support inbox${n === 1 ? "" : "es"}` : "support"} at ${when(alert.emailedAt)}`,
    });
  }
  if (alert.emailDigestAt) out.push({ key: "digest", label: "In digest", title: `Listed in an alert storm digest email at ${when(alert.emailDigestAt)}` });
  if (alert.emailReminderAt) out.push({ key: "reminder", label: "Reminder sent", title: `Still unclaimed, reminder emailed at ${when(alert.emailReminderAt)}` });
  if (alert.emailResolvedAt) out.push({ key: "resolved", label: "Resolved email sent", title: `Resolved follow-up emailed at ${when(alert.emailResolvedAt)}` });
  return out;
}

/** The email trail as small muted meta; nothing when no email went out. */
export function AlertEmailMeta({ alert, className }: { alert: EmailFields; className?: string }) {
  const items = alertEmailMeta(alert);
  if (!items.length) return null;
  return (
    <span className={cx("flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-faint", className)}>
      <Mail size={11} aria-hidden className="shrink-0" />
      {items.map((item, i) => (
        <span key={item.key} title={item.title} className="whitespace-nowrap">
          {i ? <span aria-hidden className="mr-2">·</span> : null}
          {item.label}
        </span>
      ))}
    </span>
  );
}

/** The Alerts page opened on one alert, the link the support emails carry too. */
export function alertHref(alertId: string) {
  return `/alerts?alert=${encodeURIComponent(alertId)}`;
}

/** The alert a `?alert=<id>` link points at, from whichever loaded list has it. */
export function findAlert<T extends { id: string }>(alertId: string | undefined, ...lists: (T[] | undefined)[]): T | undefined {
  if (!alertId) return undefined;
  for (const list of lists) {
    const hit = list?.find((alert) => alert.id === alertId);
    if (hit) return hit;
  }
  return undefined;
}
