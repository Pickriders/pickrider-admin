"use client";

import { ArrowLeftRight, ArrowRight, CalendarClock, Gavel, Globe, Info, Smartphone, Store, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

import { Avatar, Badge, cx, statusTone, type Tone } from "@/components/kit";
import type { OrderParty, OrderRow } from "@/lib/admin/api";
import { ORDER_SOURCE_LABEL, count, fullName, orderPaymentDisplay, orderSource, statusLabel, when, type OrderSource } from "@/lib/admin/format";

import { displayPhone, orderNumber, paymentLabel, statusAt, typeLabel } from "../lib";

/**
 * Cells shared by the table, the board cards and the mobile cards, so a
 * customer or a courier looks the same wherever an order is listed.
 */
const stop = (event: MouseEvent) => event.stopPropagation();

export function PartyCell({
  party,
  href,
  fallback,
  size = 28,
  className,
}: {
  party: OrderParty | null | undefined;
  href?: string;
  fallback: string;
  size?: number;
  className?: string;
}) {
  if (!party) return <span className={cx("block truncate text-xs text-ink-faint", className)}>{fallback}</span>;
  const name = fullName(party) || "Unnamed";
  const body = (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar src={party.photo} name={name} size={size} />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[13px] font-semibold text-ink group-hover/party:text-brand-dark">{name}</span>
        {party.phone ? <span className="mt-0.5 block truncate text-[11px] tabular-nums text-ink-muted">{displayPhone(party.phone)}</span> : null}
      </span>
    </span>
  );
  if (!href) return <span className={cx("block min-w-0", className)}>{body}</span>;
  return (
    <Link href={href} onClick={stop} className={cx("group/party block min-w-0 rounded-lg", className)}>
      {body}
    </Link>
  );
}

/** Order number with where it came from, its type and a scheduled marker underneath. */
export function OrderCell({
  order,
}: {
  order: Pick<OrderRow, "_id" | "orderNumber" | "type" | "isScheduled" | "scheduledFor" | "channel">;
}) {
  return (
    <span className="flex min-w-0 flex-col leading-tight">
      <span className="truncate text-[13px] font-bold tabular-nums tracking-tight text-ink">{orderNumber(order)}</span>
      <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-ink-muted">
        <SourcePill channel={order.channel} />
        <span className="truncate">{typeLabel(order.type)}</span>
        {order.isScheduled ? (
          <span
            className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-brand-dark"
            title={order.scheduledFor ? `Scheduled for ${when(order.scheduledFor)}` : "Scheduled"}
          >
            <CalendarClock size={11} aria-hidden />
            Scheduled
          </span>
        ) : null}
      </span>
    </span>
  );
}

const PAYMENT_TEXT: Record<ReturnType<typeof orderPaymentDisplay>["tone"], string> = {
  neutral: "text-ink-muted",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

/** The payment state as one muted line, for places with no room for a badge. */
export function PaymentLine({ order, className }: { order: Pick<OrderRow, "channel" | "status" | "paymentStatus">; className?: string }) {
  if (!order.paymentStatus) return null;
  const payment = orderPaymentDisplay(order);
  return (
    <span className={cx("block truncate text-[11px] font-semibold", PAYMENT_TEXT[payment.tone], className)} title={payment.hint}>
      {payment.label}
    </span>
  );
}

/** "Customer → courier" on one line, for cards. */
export function PartiesLine({ order }: { order: OrderRow }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <PartyCell party={order.user} fallback="Unknown customer" size={24} className="min-w-0 flex-1" />
      <ArrowRight size={13} aria-hidden className="shrink-0 text-ink-faint" />
      <span className="min-w-0 flex-1">
        <CourierCell order={order} size={24} />
      </span>
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string | undefined }) {
  return (
    <Badge tone={statusTone(status)} dot>
      {statusLabel(status)}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: string | undefined }) {
  return <Badge tone={statusTone(status)}>{paymentLabel(status)}</Badge>;
}

/**
 * Payment for a whole order, so storefront orders read "Storefront prepaid" / "Refunded on
 * storefront" (with the explainer on hover) instead of a bare core payment status.
 */
export function OrderPaymentBadge({ order }: { order: Pick<OrderRow, "channel" | "status" | "paymentStatus"> }) {
  if (!order.paymentStatus) return null;
  const payment = orderPaymentDisplay(order);
  if (!payment.hint) return <Badge tone={payment.tone}>{payment.label}</Badge>;
  return (
    <span title={payment.hint} className="inline-flex cursor-help">
      <Badge tone={payment.tone}>
        {payment.label}
        <Info size={10} aria-hidden />
      </Badge>
      <span className="sr-only">{payment.hint}</span>
    </span>
  );
}

const SOURCE_TONE: Record<OrderSource, Tone> = { APP: "neutral", STORE: "brand", WEB: "info" };
const SOURCE_ICON = { APP: Smartphone, STORE: Store, WEB: Globe } as const;
const SOURCE_HINT: Record<OrderSource, string> = {
  APP: "Placed in the customer app",
  STORE: "From a vendor storefront",
  WEB: "Placed on pickriders.com",
};

/** Quiet tints, one per source, built on the theme tokens so they follow dark mode. */
const SOURCE_PILL: Record<OrderSource, string> = {
  APP: "border-line bg-surface text-ink-muted",
  STORE: "border-transparent bg-brand-soft text-brand-dark",
  WEB: "border-transparent bg-info-soft text-info",
};

/**
 * The source as a small pill that sits on the 11px line under an order number (the same 14px
 * height as the type and Scheduled marker beside it), for the list, board and scheduled views.
 */
export function SourcePill({
  channel,
  size = "line",
  className,
}: {
  channel: string | undefined;
  /** "line" sits on an 11px text line; "badge" matches a Badge beside it (22px). */
  size?: "line" | "badge";
  className?: string;
}) {
  const source = orderSource(channel);
  const Icon = SOURCE_ICON[source];
  return (
    <span
      title={SOURCE_HINT[source]}
      className={cx(
        "inline-flex shrink-0 items-center border font-semibold leading-none",
        size === "badge" ? "h-[22px] gap-1 rounded-full px-2 text-[11px]" : "h-3.5 gap-0.5 rounded px-1 text-[10px]",
        SOURCE_PILL[source],
        className,
      )}
    >
      <Icon size={size === "badge" ? 10 : 9} aria-hidden strokeWidth={2.5} />
      {ORDER_SOURCE_LABEL[source]}
    </span>
  );
}

/** Where an order came from: the customer app, a vendor storefront, or the public web flow. */
export function SourceBadge({ channel }: { channel: string | undefined }) {
  const source = orderSource(channel);
  const Icon = SOURCE_ICON[source];
  return (
    <span title={SOURCE_HINT[source]} className="inline-flex">
      <Badge tone={SOURCE_TONE[source]}>
        <Icon size={10} aria-hidden />
        {ORDER_SOURCE_LABEL[source]}
      </Badge>
    </span>
  );
}

/** Bids on an order: the list's offersCount, or the offers array where a view still carries it. */
export function bidsOf(order: Pick<OrderRow, "offersCount" | "offers">) {
  return order.offersCount ?? order.offers?.length ?? 0;
}

const plural = (n: number, word: string) => `${count(n)} ${word}${n === 1 ? "" : "s"}`;

/**
 * "7 bids" that opens the order's bids panel. A span with link semantics rather than an <a>, so it
 * can sit inside a board card that is itself a link.
 */
export function BidsChip({ order, prefix }: { order: Pick<OrderRow, "_id" | "offersCount" | "offers">; prefix?: string }) {
  const router = useRouter();
  const bids = bidsOf(order);
  const go = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/orders/${order._id}#bids`);
  };
  return (
    <span
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") go(event);
      }}
      title="See every bid on this order"
      className={cx(
        "inline-flex w-fit cursor-pointer items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-muted transition-colors",
        "hover:border-line-strong hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
      )}
    >
      <Gavel size={10} aria-hidden />
      {prefix ? `${prefix} ${plural(bids, "bid")}` : plural(bids, "bid")}
    </span>
  );
}

/**
 * "Released 2x" (or "Rider released" while the order waits for its next rider) that opens the
 * order's rider history. A span with link semantics, like BidsChip, so it can sit inside a link.
 */
export function ReleasedChip({ order }: { order: Pick<OrderRow, "_id" | "rider" | "riderReleaseCount"> }) {
  const router = useRouter();
  const releases = order.riderReleaseCount ?? 0;
  if (releases <= 0) return null;
  const go = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/orders/${order._id}#rider-history`);
  };
  return (
    <span
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") go(event);
      }}
      title="A rider released this order. Open it to see the rider history."
      className={cx(
        "inline-flex w-fit cursor-pointer items-center gap-1 rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning transition-colors",
        "hover:border-warning focus:outline-none focus-visible:ring-2 focus-visible:ring-warning/40",
      )}
    >
      <Undo2 size={10} aria-hidden />
      {releases === 1 && !order.rider ? "Rider released" : `Released ${count(releases)}x`}
    </span>
  );
}

/**
 * "Handed off" (or "Handed off 2x") when another rider finished the order after pickup. Opens the
 * order's Handoff panel; a span with link semantics, like ReleasedChip, so it can sit inside a link.
 */
export function HandedOffChip({ order }: { order: Pick<OrderRow, "_id" | "handoffCount"> }) {
  const router = useRouter();
  const handoffs = order.handoffCount ?? 0;
  if (handoffs <= 0) return null;
  const go = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/orders/${order._id}#handoffs`);
  };
  return (
    <span
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") go(event);
      }}
      title="Another rider took over this order after pickup. Open it to see the handoff."
      className={cx(
        "inline-flex w-fit cursor-pointer items-center gap-1 rounded-full border border-info/30 bg-info-soft px-2 py-0.5 text-[11px] font-semibold text-info transition-colors",
        "hover:border-info focus:outline-none focus-visible:ring-2 focus-visible:ring-info/40",
      )}
    >
      <ArrowLeftRight size={10} aria-hidden />
      {handoffs === 1 ? "Handed off" : `Handed off ${count(handoffs)}x`}
    </span>
  );
}

/**
 * The courier column. Customer-app orders are bid on, so they also say how many riders offered:
 * under the courier once one won, or on their own while the order still waits. An order a rider
 * was released from carries the amber "Released" chip underneath; one handed to another rider after
 * pickup carries the blue "Handed off" chip.
 */
export function CourierCell({
  order,
  href,
  size = 28,
}: {
  order: Pick<OrderRow, "_id" | "rider" | "status" | "channel" | "offersCount" | "offers" | "riderReleaseCount" | "handoffCount">;
  href?: string;
  size?: number;
}) {
  const courier = <CourierBody order={order} href={href} size={size} />;
  if (!((order.riderReleaseCount ?? 0) > 0) && !((order.handoffCount ?? 0) > 0)) return courier;
  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      {courier}
      <span className="flex flex-wrap gap-1">
        <ReleasedChip order={order} />
        <HandedOffChip order={order} />
      </span>
    </span>
  );
}

function CourierBody({
  order,
  href,
  size,
}: {
  order: Pick<OrderRow, "_id" | "rider" | "status" | "channel" | "offersCount" | "offers">;
  href?: string;
  size: number;
}) {
  const app = orderSource(order.channel) === "APP";
  const bids = bidsOf(order);
  if (order.rider) {
    return (
      <span className="flex min-w-0 flex-col gap-1">
        <PartyCell party={order.rider} href={href} fallback="No rider" size={size} />
        {app && bids > 0 ? <BidsChip order={order} prefix="won from" /> : null}
      </span>
    );
  }
  if (!app) return <span className="text-xs text-ink-faint">{order.status === "INITIATED" ? "Finding a rider" : "No rider"}</span>;
  if (bids > 0) {
    return (
      <span className="flex flex-col items-start gap-1">
        <BidsChip order={order} />
        {order.status !== "INITIATED" ? <span className="text-[11px] text-ink-faint">No rider</span> : null}
      </span>
    );
  }
  return <span className="text-xs text-ink-faint">{order.status === "INITIATED" ? "No bids" : "No rider"}</span>;
}

export function TypeBadge({ type }: { type: string | undefined }) {
  return <Badge tone="neutral">{typeLabel(type)}</Badge>;
}

/** Status plus the moment it happened, for a table or card. */
export function StatusWithTime({ order }: { order: OrderRow }) {
  const at = statusAt(order);
  return (
    <span className="flex flex-col items-start gap-1 leading-tight">
      <OrderStatusBadge status={order.status} />
      {at ? <span className="whitespace-nowrap text-[11px] tabular-nums text-ink-faint">{when(at)}</span> : null}
    </span>
  );
}
