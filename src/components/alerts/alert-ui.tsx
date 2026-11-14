"use client";

import { AlertOctagon, AlertTriangle, PlayCircle } from "lucide-react";
import Link from "next/link";

import { Badge, cx } from "@/components/kit";
import type { AdminAlert } from "@/lib/admin/api";
import { fullName } from "@/lib/admin/format";
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
