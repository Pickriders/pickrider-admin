"use client";

import React from "react";
import { useGetOrderBidsQuery, type OrderBid } from "@/api/queries/orders";
import { UI } from "@/components/ui";
import { formatMoney, subUnitToBaseUnit } from "@/utils";

const money = (amount?: number | null) =>
  amount == null ? "—" : formatMoney(subUnitToBaseUnit(amount));

const STATUS: Record<string, { label: string; cls: string }> = {
  ACCEPTED: { label: "Won", cls: "bg-emerald-500/10 text-emerald-600" },
  PENDING: { label: "Bidding", cls: "bg-amber-500/10 text-amber-600" },
  REJECTED: { label: "Passed", cls: "bg-muted text-muted-foreground" },
};

const initials = (f?: string, l?: string) =>
  `${(f?.[0] ?? "").toUpperCase()}${(l?.[0] ?? "").toUpperCase()}` || "R";

const Chip = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-card p-3">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
  </div>
);

const BidRow = ({ bid }: { bid: OrderBid }) => {
  const s = STATUS[bid.status] ?? STATUS.PENDING;
  const name = `${bid.rider?.firstname ?? ""} ${bid.rider?.lastname ?? ""}`.trim() || "Courier";
  const won = bid.status === "ACCEPTED";
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        won ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-border bg-card"
      }`}
    >
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-bold text-muted-foreground">
        {bid.rider?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bid.rider.photo} alt={name} className="size-full object-cover" />
        ) : (
          initials(bid.rider?.firstname, bid.rider?.lastname)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {bid.rider?.phone ?? "—"}
          {bid.riderStats
            ? ` · ${bid.riderStats.totalBids} bids, ${bid.riderStats.wonBids} won`
            : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-foreground">{money(bid.amount)}</p>
        <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>
          {s.label}
        </span>
      </div>
    </div>
  );
};

export const RiderBids: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { data, isLoading } = useGetOrderBidsQuery(orderId);

  return (
    <section className="mt-6 rounded-lg bg-background p-4 sm:p-6 *:font-montserrat">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Rider Bids</h3>
          <p className="text-xs text-muted-foreground">Every offer riders made on this order, cheapest first.</p>
        </div>
        {data && data.totalBids > 0 ? (
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {data.totalBids} bid{data.totalBids === 1 ? "" : "s"} · {data.uniqueRiders} rider
            {data.uniqueRiders === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <UI.Skeleton className="h-16 w-full" />
          <UI.Skeleton className="h-16 w-full" />
          <UI.Skeleton className="h-16 w-full" />
        </div>
      ) : !data || data.offers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No rider has bid on this order yet.
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Chip label="Lowest bid" value={money(data.lowestBid)} />
            <Chip label="Highest bid" value={money(data.highestBid)} />
            <Chip label="Accepted" value={money(data.acceptedAmount)} />
            <Chip label="Unique riders" value={String(data.uniqueRiders)} />
          </div>
          <div className="space-y-2">
            {data.offers.map((bid) => (
              <BidRow key={bid._id} bid={bid} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
