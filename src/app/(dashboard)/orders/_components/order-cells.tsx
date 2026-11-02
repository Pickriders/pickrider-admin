"use client";

import { Gavel, Globe, Info, Smartphone, Store, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

import { Avatar, Badge, cx, statusTone, type Tone } from "@/components/kit";
import type { OrderParty, OrderRow } from "@/lib/admin/api";
import { ORDER_SOURCE_LABEL, count, fullName, orderPaymentDisplay, orderSource, statusLabel, when, type OrderSource } from "@/lib/admin/format";

import { displayPhone, paymentLabel, statusAt, typeLabel } from "../lib";

/**
 * Cells shared by the table, the board cards and the mobile cards, so a
 * customer or a courier looks the same wherever an order is listed.
 */
const stop = (event: MouseEvent) => event.stopPropagation();

export function PartyCell({
  party,
  href,
  fallback,
  size = 30,
}: {
  party: OrderParty | null | undefined;
  href?: string;
  fallback: string;
  size?: number;
}) {
  if (!party) return <span className="text-xs text-ink-faint">{fallback}</span>;
  const name = fullName(party) || "Unnamed";
  const body = (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar src={party.photo} name={name} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">{name}</span>
        {party.phone ? <span className="block truncate text-xs text-ink-muted">{displayPhone(party.phone)}</span> : null}
      </span>
    </span>
  );
  if (!href) return body;
  return (
    <Link href={href} onClick={stop} className="block min-w-0 rounded-lg hover:underline">
      {body}
    </Link>
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
  STORE: "Placed on a vendor storefront",
  WEB: "Placed on the pickriders.com web flow",
};

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
 * The courier column. Customer-app orders are bid on, so they also say how many riders offered:
 * under the courier once one won, or on their own while the order still waits. An order a rider
 * was released from carries the amber "Released" chip underneath.
 */
export function CourierCell({
  order,
  href,
  size = 30,
}: {
  order: Pick<OrderRow, "_id" | "rider" | "status" | "channel" | "offersCount" | "offers" | "riderReleaseCount">;
  href?: string;
  size?: number;
}) {
  const courier = <CourierBody order={order} href={href} size={size} />;
  if (!((order.riderReleaseCount ?? 0) > 0)) return courier;
  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      {courier}
      <ReleasedChip order={order} />
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
    <span className="flex flex-col items-start gap-1">
      <OrderStatusBadge status={order.status} />
      {at ? <span className="text-[11px] text-ink-faint">{when(at)}</span> : null}
    </span>
  );
}
