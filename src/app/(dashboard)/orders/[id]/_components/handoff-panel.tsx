"use client";

import { ArrowLeftRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { HandoffActions, StartHandoffDialog } from "@/components/handoffs/handoff-actions";
import {
  BonusBadge,
  CountBadge,
  FlagChips,
  HANDOFF_REASON_LABEL,
  HandoffStatusBadge,
  RiderSwap,
  isLive,
  useNow,
} from "@/components/handoffs/handoff-ui";
import { Badge, Button, ErrorState, KeyValue, Panel, PanelHeader, Skeleton, cx } from "@/components/kit";
import type { Handoff, OrderRow } from "@/lib/admin/api";
import { count, fullName, minutes, naira, time, when } from "@/lib/admin/format";
import { useOrderHandoffs } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { useCan } from "@/lib/admin/use-can";

/**
 * Every handoff on the order, oldest first: who handed it to whom and why, each step's time, the
 * split of the rider fee, the bonus and whether it counts. Live ones carry the same actions as the
 * Handoffs page. Staff can start one for an order on the way that has been picked up.
 */
export function canStartHandoff(order: Pick<OrderRow, "status" | "rider" | "locations">, rows: Pick<Handoff, "status">[] = []) {
  const pickedUp = (order.locations ?? []).some((stop) => stop.type === "PICKUP" && stop.status === "COMPLETED");
  return order.status === "ON_GOING" && Boolean(order.rider) && pickedUp && !rows.some(isLive);
}

const ENDED_BY: Record<string, string> = { RIDER: "by the rider", ADMIN: "by staff", SYSTEM: "automatically" };

type Step = { label: string; at?: string; tone: "done" | "live" | "bad"; detail?: string };

function steps(handoff: Handoff, now: number): Step[] {
  const out: Step[] = [{ label: handoff.initiatedBy === "ADMIN" ? "Staff opened it" : "Rider asked", at: handoff.createdAt, tone: "done" }];
  if (handoff.status === "AWAITING_SUPPORT") out.push({ label: "Waiting for support to start the search", tone: "bad", detail: minutes((now - new Date(handoff.createdAt).getTime()) / 60_000) });
  if (handoff.searchingSince) {
    const searching = handoff.status === "SEARCHING";
    out.push({
      label: searching ? "Searching" : "Search started",
      at: handoff.searchingSince,
      tone: searching ? "live" : "done",
      detail: `${count(handoff.rungCount)} rung within ${handoff.searchRadiusKm} km${handoff.declinedCount ? `, ${count(handoff.declinedCount)} declined` : ""}${handoff.droppedRiderIds.length ? `, ${count(handoff.droppedRiderIds.length)} dropped` : ""}`,
    });
  }
  if (handoff.acceptedAt) out.push({ label: `${fullName(handoff.toRider) || "A rider"} accepted`, at: handoff.acceptedAt, tone: handoff.status === "ACCEPTED" ? "live" : "done" });
  if (handoff.lockedUntil && new Date(handoff.lockedUntil).getTime() > now) out.push({ label: "Swap locked after wrong codes", tone: "bad", detail: `until ${time(handoff.lockedUntil)}` });
  if (handoff.completedAt) {
    out.push({
      label: "Swapped",
      at: handoff.completedAt,
      tone: "done",
      detail: handoff.confirmDistanceM != null ? `${Math.round(handoff.confirmDistanceM)} m apart` : undefined,
    });
  } else if (handoff.endedAt) {
    out.push({
      label: handoff.status === "EXPIRED" ? "Expired, nobody took it" : `Cancelled ${ENDED_BY[handoff.endedBy ?? ""] ?? ""}`.trim(),
      at: handoff.endedAt,
      tone: "bad",
      detail: handoff.endNote,
    });
  }
  return out;
}

function Timeline({ handoff }: { handoff: Handoff }) {
  const now = useNow(30_000);
  const list = steps(handoff, now);
  return (
    <ol className="space-y-2.5">
      {list.map((step, index) => (
        <li key={`${step.label}-${index}`} className="relative flex gap-3">
          {index < list.length - 1 ? <span aria-hidden className="absolute left-[4.5px] top-4 h-[calc(100%+2px)] w-px bg-line" /> : null}
          <span
            aria-hidden
            className={cx(
              "relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
              step.tone === "done" ? "bg-success" : step.tone === "live" ? "bg-warning admin-live-dot text-warning" : "bg-danger",
            )}
          />
          <div className="min-w-0 text-xs leading-snug">
            <p className="font-semibold text-ink">
              {step.label}
              {step.at ? (
                <time dateTime={step.at} title={when(step.at)} className="ml-1.5 font-normal tabular-nums text-ink-muted">
                  {time(step.at)}
                </time>
              ) : null}
            </p>
            {step.detail ? <p className="mt-0.5 break-words text-ink-muted">{step.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function HandoffItem({ handoff }: { handoff: Handoff }) {
  const live = isLive(handoff);
  const split =
    handoff.fromShare != null && handoff.toShare != null
      ? `${naira(handoff.fromShare)} / ${naira(handoff.toShare)}`
      : handoff.status === "COMPLETED"
        ? "Not recorded"
        : "Set at the swap";
  return (
    <li className={cx("rounded-2xl border p-4", live ? "border-warning/40 bg-warning-soft/40" : "border-line bg-surface/60")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-black tracking-tight text-ink">{`Handoff ${handoff.sequence}`}</span>
        <HandoffStatusBadge status={handoff.status} />
        <Badge tone={handoff.reason === "ACCIDENT" ? "danger" : "neutral"}>{HANDOFF_REASON_LABEL[handoff.reason] ?? handoff.reason}</Badge>
        {handoff.initiatedBy === "ADMIN" ? <Badge tone="info">By staff</Badge> : null}
        <FlagChips flags={handoff.flags} />
      </div>
      {handoff.note ? <p className="mt-2 break-words text-xs text-ink">&ldquo;{handoff.note}&rdquo;</p> : null}

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-[1fr_15rem]">
        <div className="min-w-0 space-y-3">
          <RiderSwap handoff={handoff} />
          <KeyValue
            columns={2}
            items={[
              { label: "Split (A / B)", value: split },
              {
                label: "A's share",
                value:
                  handoff.sharePct != null
                    ? `${Math.round(handoff.sharePct)}%${handoff.distanceCoveredKm != null && handoff.totalRouteKm ? `, ${handoff.distanceCoveredKm.toFixed(1)} of ${handoff.totalRouteKm.toFixed(1)} km` : ""}`
                    : undefined,
              },
              {
                label: "Bonus",
                value: (
                  <span className="inline-flex items-center gap-1.5">
                    {naira(handoff.bonusAmount)} <BonusBadge status={handoff.bonusStatus} />
                  </span>
                ),
              },
              { label: "Counts against A", value: <CountBadge handoff={handoff} /> },
              ...(handoff.compensationAmount ? [{ label: "Cancel compensation", value: naira(handoff.compensationAmount) }] : []),
              ...(handoff.failedAttempts ? [{ label: "Wrong codes", value: count(handoff.failedAttempts) }] : []),
              ...(handoff.reviewNote ? [{ label: "Review note", value: handoff.reviewNote }] : []),
            ]}
          />
        </div>
        <Timeline handoff={handoff} />
      </div>

      <div className="mt-4 empty:hidden">
        <HandoffActions handoff={handoff} variant="buttons" />
      </div>
    </li>
  );
}

export function HandoffPanel({ order }: { order: OrderRow }) {
  const { can } = useCan();
  const relevant = order.status === "ON_GOING" || (order.handoffCount ?? 0) > 0;
  const query = useOrderHandoffs(order._id, relevant);
  const [starting, setStarting] = useState(false);
  const rows = [...(query.data ?? [])].sort((a, b) => a.sequence - b.sequence || a.createdAt.localeCompare(b.createdAt));
  const startable = canStartHandoff(order, rows) && can("handoff.manage");

  // The "Handed off" chip on the order lists links here with #handoffs.
  useEffect(() => {
    if (relevant && query.data && window.location.hash === "#handoffs") {
      document.getElementById("handoffs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [relevant, query.data]);

  if (!relevant) return null;
  if (query.isSuccess && !rows.length && !startable) return null;

  const live = rows.some(isLive);
  return (
    <Panel id="handoffs" className="scroll-mt-24">
      <PanelHeader
        title="Handoffs"
        subtitle={rows.length ? "Riders who handed this order on after pickup, oldest first" : "If the rider cannot finish, another rider can take it from them"}
        action={
          startable ? (
            <Button size="sm" variant="outline" icon={Plus} onClick={() => setStarting(true)}>
              Start handoff
            </Button>
          ) : live ? (
            <Badge tone="warning" dot>
              Live
            </Badge>
          ) : rows.length ? (
            <Badge tone="neutral">
              <ArrowLeftRight size={10} aria-hidden />
              {`${count(rows.length)}`}
            </Badge>
          ) : null
        }
      />
      <div className="px-5 pb-5 pt-4">
        {query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : query.isError ? (
          <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
        ) : rows.length ? (
          <ol className="space-y-3">
            {rows.map((handoff) => (
              <HandoffItem key={handoff.id} handoff={handoff} />
            ))}
          </ol>
        ) : (
          <p className="text-sm text-ink-muted">
            No handoffs on this order. Start one when {fullName(order.rider) || "the rider"} calls in and cannot finish the delivery; their app has the same option.
          </p>
        )}
      </div>
      {startable ? <StartHandoffDialog orderId={order._id} riderName={fullName(order.rider) || "the rider"} open={starting} onClose={() => setStarting(false)} /> : null}
    </Panel>
  );
}
