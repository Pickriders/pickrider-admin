"use client";

import { Gavel } from "lucide-react";
import Link from "next/link";

import { Avatar, Badge, EmptyState, ErrorState, Panel, PanelHeader, Skeleton, cx, statusTone } from "@/components/kit";
import type { OrderBid, OrderOffers } from "@/lib/admin/api";
import { count, fullName, naira, when } from "@/lib/admin/format";
import { useOrderOffers } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { BID_STATUS_LABEL, displayPhone } from "../../lib";

/**
 * Every offer riders made on the order, cheapest first, with each rider's
 * lifetime bidding record so ops can tell a chancer from a regular.
 */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function BidRow({ bid }: { bid: OrderBid }) {
  const name = fullName(bid.rider) || "Courier";
  const won = bid.status === "ACCEPTED";
  return (
    <div className={cx("flex items-center gap-3 rounded-xl border p-3", won ? "border-success/40 bg-success-soft/50" : "border-line bg-card")}>
      <Avatar src={bid.rider?.photo} name={name} size={36} />
      <div className="min-w-0 flex-1">
        {bid.rider ? (
          <Link href={`/couriers/${bid.rider._id}`} className="block truncate text-sm font-semibold text-ink hover:underline">
            {name}
          </Link>
        ) : (
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
        )}
        <p className="truncate text-xs text-ink-muted">
          {bid.rider?.phone ? displayPhone(bid.rider.phone) : "No phone"}
          {bid.riderStats ? ` · ${count(bid.riderStats.totalBids)} bids, ${count(bid.riderStats.wonBids)} won, avg ${naira(bid.riderStats.avgBid)}` : ""}
        </p>
        <p className="text-[11px] text-ink-faint">Bid {when(bid.createdAt)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-ink">{naira(bid.amount)}</p>
        <Badge tone={statusTone(bid.status) === "neutral" ? "neutral" : statusTone(bid.status)} className="mt-1">
          {BID_STATUS_LABEL[bid.status] ?? bid.status}
        </Badge>
      </div>
    </div>
  );
}

export function RiderBids({ orderId, askingPrice }: { orderId: string; askingPrice?: number }) {
  const offers = useOrderOffers(orderId);
  const data = offers.data as OrderOffers | undefined;
  const total = data?.totalBids ?? 0;

  return (
    <Panel>
      <PanelHeader
        title="Rider bids"
        subtitle={askingPrice ? `Every offer on this order, cheapest first. Customer asked ${naira(askingPrice)}.` : "Every offer on this order, cheapest first."}
        action={
          total ? (
            <Badge tone="neutral">
              {count(total)} bid{total === 1 ? "" : "s"} · {count(data?.uniqueRiders)} rider{data?.uniqueRiders === 1 ? "" : "s"}
            </Badge>
          ) : null
        }
      />
      <div className="px-5 pb-5 pt-4">
        {offers.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : offers.isError ? (
          <ErrorState message={errorMessage(offers.error)} onRetry={() => void offers.refetch()} />
        ) : !data || !data.offers.length ? (
          <EmptyState compact icon={Gavel} title="No bids yet" description="Riders who offer on this order will show here with their price." />
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Lowest bid" value={naira(data.lowestBid)} />
              <Stat label="Highest bid" value={naira(data.highestBid)} />
              <Stat label="Accepted" value={data.acceptedAmount == null ? "Not yet" : naira(data.acceptedAmount)} />
              <Stat label="Unique riders" value={count(data.uniqueRiders)} />
            </div>
            <div className="space-y-2">
              {data.offers.map((bid) => (
                <BidRow key={bid._id} bid={bid} />
              ))}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
