"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

import { Avatar, Badge, statusTone } from "@/components/kit";
import type { OrderParty, OrderRow } from "@/lib/admin/api";
import { fullName, statusLabel, when } from "@/lib/admin/format";

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
