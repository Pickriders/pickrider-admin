"use client";

import { Store, Undo2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Avatar, Badge, ErrorState, Panel, PanelHeader, Skeleton, cx, type Tone } from "@/components/kit";
import type { OrderRiderHistory, OrderRiderStint } from "@/lib/admin/api";
import { count, fullName, minutes, time, when } from "@/lib/admin/format";
import { useOrderRiderHistory } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { displayPhone } from "../../lib";

/** Who took the rider off: the rider ("Can't make it"), the store ("Find another rider") or staff. */
export const RELEASED_BY: Record<string, string> = {
  RIDER: "Rider released the trip",
  OWNER: "Store replaced the rider",
  ADMIN: "Pickriders replaced the rider",
};

/** Rider reasons and the store's own reasons, lower case to sit inside a sentence. */
export const RELEASE_REASON: Record<string, string> = {
  BIKE_PROBLEM: "bike problem",
  EMERGENCY: "emergency",
  TOO_FAR: "too far",
  STORE_ISSUE: "store issue",
  RIDER_CANT_GO: "rider can't go",
  RIDER_NOT_RESPONDING: "rider not responding",
  RIDER_TOO_FAR: "rider too far",
  OTHER: "other",
};

const capitalise = (value: string) => (value ? value[0].toUpperCase() + value.slice(1) : value);

const OUTCOME: Record<Exclude<OrderRiderStint["outcome"], "RELEASED">, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "brand" },
  PICKED_UP: { label: "Picked up", tone: "info" },
  DELIVERED: { label: "Delivered", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
};

/** "2:04 PM", with the full date on hover. */
function Stamp({ value }: { value: string | null | undefined }) {
  if (!value) return <span>at an unknown time</span>;
  return (
    <time dateTime={value} title={when(value)} className="tabular-nums">
      {time(value)}
    </time>
  );
}

const heldFor = (from: string | null | undefined, to: string | null | undefined) => {
  if (!from) return "";
  const end = to ? new Date(to).getTime() : Date.now();
  const span = (end - new Date(from).getTime()) / 60_000;
  return span >= 0 ? minutes(span) : "";
};

function releaseTail(release: NonNullable<OrderRiderStint["release"]>) {
  if (release.initiatedBy === "OWNER") return "Released by the store";
  if (release.initiatedBy === "ADMIN") return "Released by admin";
  if (release.arrivedAtPickup) return "Counted: already at the store";
  return release.counted ? "Counted as a cancellation" : "Free (within 2 minutes)";
}

function StintRow({ stint, last }: { stint: OrderRiderStint; last: boolean }) {
  const name = fullName(stint.rider) || "Rider no longer on Pickriders";
  const released = stint.outcome === "RELEASED" && stint.release;
  const counted = released && stint.release?.initiatedBy === "RIDER" && (stint.release.counted || stint.release.arrivedAtPickup);
  const held = heldFor(stint.acceptedAt, stint.endedAt);
  const outcome = stint.outcome === "RELEASED" ? null : OUTCOME[stint.outcome];

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {/* The rail between riders. */}
      {!last ? <span aria-hidden className="absolute left-[17px] top-10 h-[calc(100%-2.75rem)] w-px bg-line" /> : null}
      <Avatar src={stint.rider?.photo} name={name} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {stint.rider ? (
            <Link href={`/couriers/${stint.rider._id}/details`} className="truncate text-sm font-semibold text-ink hover:underline">
              {name}
            </Link>
          ) : (
            <span className="truncate text-sm font-semibold text-ink-muted">{name}</span>
          )}
          {outcome ? (
            <Badge tone={outcome.tone} dot>
              {outcome.label}
            </Badge>
          ) : null}
        </div>
        {stint.rider?.phone ? <p className="truncate text-xs text-ink-muted">{displayPhone(stint.rider.phone)}</p> : null}
        <p className="mt-1 text-xs text-ink-muted">
          Accepted <Stamp value={stint.acceptedAt} />
          {stint.outcome === "PICKED_UP" || (stint.outcome === "DELIVERED" && stint.pickedUpAt) ? (
            <>
              {" "}
              · Picked up <Stamp value={stint.pickedUpAt} />
            </>
          ) : null}
          {stint.outcome === "DELIVERED" ? (
            <>
              {" "}
              · Delivered <Stamp value={stint.endedAt} />
            </>
          ) : null}
          {stint.outcome === "CANCELLED" ? (
            <>
              {" "}
              · Cancelled <Stamp value={stint.endedAt} />
            </>
          ) : null}
          {held ? <span className="text-ink-faint">{` · ${stint.endedAt ? "held" : "holding"} ${held}`}</span> : null}
        </p>
        {released && stint.release ? (
          <div
            title={RELEASED_BY[stint.release.initiatedBy]}
            className={cx(
              "mt-1.5 rounded-xl border px-3 py-2 text-xs",
              counted ? "border-danger/30 bg-danger-soft text-danger" : "border-warning/40 bg-warning-soft text-warning",
            )}
          >
            {stint.release.arrivedAtPickup ? (
              <Badge tone="danger" className="mb-1.5 font-bold">
                <Store size={10} aria-hidden />
                At the store
              </Badge>
            ) : null}
            <p className="font-semibold">
              Released <Stamp value={stint.endedAt} /> · {capitalise(RELEASE_REASON[stint.release.reason] ?? stint.release.reason)} ·{" "}
              {releaseTail(stint.release)}
            </p>
            {stint.release.note ? <p className="mt-0.5 break-words text-ink">&ldquo;{stint.release.note}&rdquo;</p> : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}

/** The last rider let go and nobody has taken the order since. */
function FindingRow() {
  return (
    <li className="relative flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-warning" />
        </span>
      </span>
      <p className="text-sm font-semibold text-ink">Finding another rider</p>
    </li>
  );
}

/**
 * Every rider who held the order, oldest first: when each accepted, who let go, why and whether it
 * counted, then where the current rider is. Shown once a rider has been released from the order.
 */
export function RiderHistory({ orderId, enabled }: { orderId: string; enabled: boolean }) {
  const query = useOrderRiderHistory(orderId, enabled);
  const data = query.data as OrderRiderHistory | undefined;

  // The "Released" chips on the order lists link here with #rider-history; the panel renders
  // after the order loads, so the browser's own jump to the anchor has already missed.
  useEffect(() => {
    if (enabled && window.location.hash === "#rider-history") {
      document.getElementById("rider-history")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [enabled]);

  if (!enabled) return null;

  const stints = data?.stints ?? [];
  const lastReleased = stints.length > 0 && stints[stints.length - 1].outcome === "RELEASED";
  const finding = lastReleased && data?.status !== "CANCELLED" && data?.status !== "COMPLETED";
  const releases = data?.releaseCount ?? 0;

  return (
    <Panel id="rider-history" className="scroll-mt-24">
      <PanelHeader
        title="Rider history"
        subtitle="Every rider who held this order, oldest first"
        action={
          releases ? (
            <Badge tone="warning">
              <Undo2 size={10} aria-hidden />
              Released {count(releases)}x
            </Badge>
          ) : null
        }
      />
      <div className="px-5 pb-5 pt-4">
        {query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : query.isError ? (
          <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : stints.length ? (
          <ol>
            {stints.map((stint, index) => (
              <StintRow key={`${stint.rider?._id ?? "gone"}-${stint.endedAt ?? stint.acceptedAt ?? index}`} stint={stint} last={index === stints.length - 1 && !finding} />
            ))}
            {finding ? <FindingRow /> : null}
            {lastReleased && data?.status === "CANCELLED" ? (
              <li className="pl-12 text-xs text-ink-faint">The order was cancelled before another rider took it.</li>
            ) : null}
          </ol>
        ) : (
          <p className="text-sm text-ink-faint">No rider has held this order yet.</p>
        )}
      </div>
    </Panel>
  );
}
