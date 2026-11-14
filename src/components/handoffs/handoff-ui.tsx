"use client";

import { ArrowRight, Hand, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";

import { Avatar, Badge, cx, type Tone } from "@/components/kit";
import { displayPhone, phoneHref } from "@/app/(dashboard)/orders/lib";
import type { Handoff, HandoffRider } from "@/lib/admin/api";
import { ago, count, fullName, minutes, naira, time, when } from "@/lib/admin/format";

/**
 * Labels, chips and cells for rider handoffs, shared by the Handoffs page, the order's Handoff
 * panel and the courier's Handoffs tab, so a handoff reads the same wherever it shows up.
 */
const stop = (event: MouseEvent) => event.stopPropagation();

export const HANDOFF_STATUS_LABEL: Record<string, string> = {
  AWAITING_SUPPORT: "Awaiting support",
  SEARCHING: "Searching",
  ACCEPTED: "Rider on the way",
  COMPLETED: "Swapped",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export const HANDOFF_STATUS_TONE: Record<string, Tone> = {
  AWAITING_SUPPORT: "danger",
  SEARCHING: "warning",
  ACCEPTED: "brand",
  COMPLETED: "success",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
};

export const HANDOFF_REASON_LABEL: Record<string, string> = {
  BIKE_PROBLEM: "Bike problem",
  STOPPED_BY_OFFICIALS: "Stopped by officials",
  ACCIDENT: "Accident",
  EMERGENCY: "Emergency",
  OTHER: "Other",
};

/** Plain-language meaning of each review flag, for the chip tooltip. */
export const HANDOFF_FLAG: Record<string, { label: string; hint: string }> = {
  REPEAT_7D: { label: "Repeat", hint: "3+ handoffs in 7 days" },
  SAME_PAIR: { label: "Same pair", hint: "Same two riders again" },
  GPS_FAR: { label: "GPS far", hint: "Riders far apart at the swap" },
  CODE_ATTEMPTS: { label: "Code tries", hint: "Many wrong codes" },
};

export const BONUS_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "Paid on delivery", tone: "neutral" },
  HELD: { label: "Held for review", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
  FORFEITED: { label: "Forfeited", tone: "danger" },
  VOID: { label: "Not due", tone: "neutral" },
};

export const COUNT_DECISION: Record<string, { label: string; tone: Tone; hint: string }> = {
  PENDING_REVIEW: { label: "Needs review", tone: "warning", hint: "Flagged. Decide whether it counts against the handing-over rider." },
  RULE_WAIVED: { label: "Not counted", tone: "success", hint: "The rules waived it (reason, or the rider's first in 30 days)." },
  RULE_COUNTED: { label: "Counted", tone: "danger", hint: "The rules counted it as the rider's cancellation." },
  COUNTED: { label: "Counted by staff", tone: "danger", hint: "Staff counted it as the rider's cancellation." },
  WAIVED: { label: "Waived by staff", tone: "success", hint: "Staff decided it does not count." },
};

export const LIVE_STATUSES = ["AWAITING_SUPPORT", "SEARCHING", "ACCEPTED"] as const;

export function isLive(handoff: Pick<Handoff, "status">) {
  return (LIVE_STATUSES as readonly string[]).includes(handoff.status);
}

/** Completed and waiting on staff: a count decision or a held bonus. */
export function needsReview(handoff: Pick<Handoff, "status" | "countDecision" | "bonusStatus">) {
  return handoff.status === "COMPLETED" && (handoff.countDecision === "PENDING_REVIEW" || handoff.bonusStatus === "HELD");
}

/** Re-renders on an interval so "4m ago" and "searching 3 min" stay true without a refetch. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** "4m ago", kept live, with the exact time on hover. */
export function LiveAgo({ value, className }: { value: string | null | undefined; className?: string }) {
  useNow(30_000);
  if (!value) return null;
  return (
    <time dateTime={value} title={when(value)} className={cx("whitespace-nowrap tabular-nums", className)}>
      {ago(value)}
    </time>
  );
}

export function HandoffStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={HANDOFF_STATUS_TONE[status] ?? "neutral"} dot>
      {HANDOFF_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

export function FlagChips({ flags, className }: { flags: string[] | undefined; className?: string }) {
  if (!flags?.length) return null;
  return (
    <span className={cx("flex flex-wrap gap-1", className)}>
      {flags.map((flag) => {
        const info = HANDOFF_FLAG[flag];
        return (
          <span key={flag} title={info?.hint ?? flag} className="inline-flex cursor-help">
            <Badge tone="danger">{info?.label ?? flag}</Badge>
            <span className="sr-only">{info?.hint}</span>
          </span>
        );
      })}
    </span>
  );
}

export function BonusBadge({ status }: { status: string }) {
  const info = BONUS_STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={info.tone}>{info.label}</Badge>;
}

export function CountBadge({ handoff }: { handoff: Pick<Handoff, "countDecision" | "status"> }) {
  if (handoff.status !== "COMPLETED" || !handoff.countDecision) return <span className="text-xs text-ink-faint">Not decided</span>;
  const info = COUNT_DECISION[handoff.countDecision];
  return (
    <span title={info?.hint} className="inline-flex cursor-help">
      <Badge tone={info?.tone ?? "neutral"}>{info?.label ?? handoff.countDecision}</Badge>
    </span>
  );
}

/** One rider with a profile link and a tap-to-call number. */
export function HandoffRiderCell({ rider, fallback, size = 28 }: { rider: HandoffRider | null | undefined; fallback: string; size?: number }) {
  if (!rider) return <span className="text-xs text-ink-faint">{fallback}</span>;
  const name = fullName(rider) || "Unnamed rider";
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar src={rider.photo} name={name} size={size} />
      <span className="min-w-0 leading-tight">
        <Link href={`/couriers/${rider.id}/details`} onClick={stop} className="block truncate text-[13px] font-semibold text-ink hover:text-brand-dark hover:underline">
          {name}
        </Link>
        {rider.phone ? (
          <a href={phoneHref(rider.phone)} onClick={stop} className="mt-0.5 inline-flex items-center gap-1 text-[11px] tabular-nums text-ink-muted hover:text-ink">
            <Phone size={10} aria-hidden />
            {displayPhone(rider.phone)}
          </a>
        ) : null}
      </span>
    </span>
  );
}

/** "A → B" on one line; B reads "Finding a rider" while nobody has taken it. */
export function RiderSwap({ handoff, stacked }: { handoff: Handoff; stacked?: boolean }) {
  const waiting = handoff.status === "SEARCHING" ? "Finding a rider" : handoff.status === "AWAITING_SUPPORT" ? "Search not started" : "Nobody took it";
  return (
    <span className={cx("flex min-w-0 gap-2", stacked ? "flex-col items-start" : "items-center")}>
      <span className="min-w-0 sm:max-w-[13rem]">
        <HandoffRiderCell rider={handoff.fromRider} fallback="Unknown rider" />
      </span>
      <ArrowRight size={13} aria-hidden className={cx("shrink-0 text-ink-faint", stacked && "ml-2 rotate-90")} />
      <span className="min-w-0 sm:max-w-[13rem]">
        <HandoffRiderCell rider={handoff.toRider} fallback={waiting} />
      </span>
    </span>
  );
}

export function ReasonCell({ handoff }: { handoff: Pick<Handoff, "reason" | "note" | "initiatedBy" | "sequence"> }) {
  return (
    <span className="block max-w-[16rem] leading-tight">
      <span className="flex flex-wrap items-center gap-1.5">
        <span className={cx("text-[13px] font-semibold", handoff.reason === "ACCIDENT" ? "text-danger" : "text-ink")}>
          {HANDOFF_REASON_LABEL[handoff.reason] ?? handoff.reason}
        </span>
        {handoff.initiatedBy === "ADMIN" ? <Badge tone="info">By staff</Badge> : null}
        {handoff.sequence > 1 ? <Badge tone="neutral">{`Handoff ${handoff.sequence}`}</Badge> : null}
      </span>
      {handoff.note ? <span className="mt-0.5 block break-words text-[11px] text-ink-muted">&ldquo;{handoff.note}&rdquo;</span> : null}
    </span>
  );
}

/** The live clock for a handoff, or how long the swap took once it is over. */
export function TimingCell({ handoff }: { handoff: Handoff }) {
  const now = useNow(30_000);
  const since = (value?: string) => (value ? Math.max(0, (now - new Date(value).getTime()) / 60_000) : 0);
  let headline = "";
  let tone = "text-ink";
  if (handoff.status === "AWAITING_SUPPORT") {
    headline = `Waiting ${minutes(since(handoff.createdAt))}`;
    tone = "text-danger";
  } else if (handoff.status === "SEARCHING") {
    headline = `Searching ${minutes(since(handoff.searchingSince ?? handoff.createdAt))}`;
    tone = "text-warning";
  } else if (handoff.status === "ACCEPTED") {
    headline = `Accepted ${minutes(since(handoff.acceptedAt))} ago`;
  } else if (handoff.status === "COMPLETED" && handoff.completedAt) {
    const took = (new Date(handoff.completedAt).getTime() - new Date(handoff.createdAt).getTime()) / 60_000;
    headline = `Swapped in ${minutes(Math.max(0, took))}`;
  } else if (handoff.endedAt) {
    headline = `Ended ${time(handoff.endedAt)}`;
    tone = "text-ink-muted";
  }
  return (
    <span className="block leading-tight">
      <span className={cx("block whitespace-nowrap text-[13px] font-semibold tabular-nums", tone)}>{headline}</span>
      <span className="mt-0.5 block whitespace-nowrap text-[11px] tabular-nums text-ink-faint" title={when(handoff.createdAt)}>
        Asked {time(handoff.createdAt)}
        {handoff.status === "SEARCHING" && handoff.expiresAt ? ` · expires ${time(handoff.expiresAt)}` : ""}
      </span>
      {handoff.status === "SEARCHING" || handoff.status === "AWAITING_SUPPORT" ? (
        <span className="mt-0.5 block whitespace-nowrap text-[11px] tabular-nums text-ink-faint">
          {count(handoff.rungCount)} rung · {handoff.searchRadiusKm} km{handoff.declinedCount ? ` · ${count(handoff.declinedCount)} declined` : ""}
        </span>
      ) : null}
    </span>
  );
}

/** What each rider earns from the trip (gross, before commission), locked at the swap. */
export function SplitCell({ handoff }: { handoff: Handoff }) {
  if (handoff.fromShare == null || handoff.toShare == null) {
    return <span className="text-xs text-ink-faint">{handoff.status === "COMPLETED" ? "No split recorded" : "Set at the swap"}</span>;
  }
  return (
    <span className="block leading-tight">
      <span className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold tabular-nums text-ink">
        <span title="Handing-over rider">{naira(handoff.fromShare)}</span>
        <span className="text-ink-faint">/</span>
        <span title="Taking rider">{naira(handoff.toShare)}</span>
      </span>
      <span className="mt-0.5 block whitespace-nowrap text-[11px] tabular-nums text-ink-muted">
        {handoff.sharePct != null ? `${Math.round(handoff.sharePct)}% to A` : ""}
        {handoff.splitBase ? ` of ${naira(handoff.splitBase)}` : ""}
      </span>
      {handoff.distanceCoveredKm != null && handoff.totalRouteKm ? (
        <span className="mt-0.5 block whitespace-nowrap text-[11px] tabular-nums text-ink-faint">
          {handoff.distanceCoveredKm.toFixed(1)} of {handoff.totalRouteKm.toFixed(1)} km done
        </span>
      ) : null}
    </span>
  );
}

export function BonusCell({ handoff }: { handoff: Handoff }) {
  return (
    <span className="flex flex-col items-start gap-1 leading-tight">
      <span className="text-[13px] font-semibold tabular-nums text-ink">{naira(handoff.bonusAmount)}</span>
      <BonusBadge status={handoff.bonusStatus} />
      {handoff.compensationAmount ? (
        <span className="text-[11px] text-ink-muted" title="Paid to the taking rider when the handoff was called off after they accepted">
          {naira(handoff.compensationAmount)} compensation
        </span>
      ) : null}
    </span>
  );
}

export function OrderLink({ handoff }: { handoff: Pick<Handoff, "orderId" | "orderNumber"> }) {
  return (
    <Link href={`/orders/${handoff.orderId}#handoffs`} onClick={stop} className="whitespace-nowrap text-[13px] font-bold tabular-nums text-ink hover:text-brand-dark hover:underline">
      {handoff.orderNumber ? `#${handoff.orderNumber}` : "View order"}
    </Link>
  );
}

/** The empty-state icon for anything handoff shaped. */
export const HandoffIcon = Hand;
