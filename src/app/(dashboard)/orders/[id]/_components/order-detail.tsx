"use client";

import { ExternalLink, Phone, Star } from "lucide-react";
import Link from "next/link";

import { Avatar, Badge, ErrorState, KeyValue, LinkButton, PageHeader, Panel, PanelHeader, Skeleton, statusTone } from "@/components/kit";
import type { OrderParty, OrderRow } from "@/lib/admin/api";
import { ago, count, fullName, naira, percent, when } from "@/lib/admin/format";
import { useOrder } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";

import { displayPhone, isStale, orderNumber, paymentLabel, phoneHref, totalDistanceKm, typeLabel } from "../../lib";
import { OrderStatusBadge, PaymentBadge, TypeBadge } from "../../_components/order-cells";
import { OrderActions } from "./order-actions";
import { RiderBids } from "./rider-bids";
import { RouteMap } from "./route-map";
import { StopsTimeline } from "./stops-timeline";

/**
 * One order end to end: where it is on the map, each stop's state, who is
 * involved, what was paid, and the levers ops have.
 */
function PartyCard({
  title,
  party,
  href,
  empty,
  extra,
}: {
  title: string;
  party: OrderParty | null | undefined;
  href?: string;
  empty: string;
  extra?: React.ReactNode;
}) {
  const name = fullName(party);
  return (
    <Panel>
      <PanelHeader
        title={title}
        action={
          party && href ? (
            <LinkButton href={href} size="sm" variant="ghost" icon={ExternalLink}>
              Profile
            </LinkButton>
          ) : null
        }
      />
      <div className="px-5 pb-5 pt-3">
        {party ? (
          <div className="flex items-center gap-3">
            <Avatar src={party.photo} name={name} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{name || "Unnamed"}</p>
              {party.phone ? <p className="truncate text-xs text-ink-muted">{displayPhone(party.phone)}</p> : null}
              {party.email ? <p className="truncate text-xs text-ink-faint">{party.email}</p> : null}
              {extra}
            </div>
            {party.phone ? (
              <a
                href={phoneHref(party.phone)}
                aria-label={`Call ${name || title.toLowerCase()}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-dark hover:bg-brand/20"
              >
                <Phone size={16} />
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-ink-faint">{empty}</p>
        )}
      </div>
    </Panel>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_24rem]">
        <Skeleton className="h-[28rem] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const query = useOrder(orderId);
  const order = query.data as OrderRow | undefined;

  if (query.isLoading) return <DetailSkeleton />;
  if (query.isError || !order) {
    return (
      <div>
        <PageHeader title="Order" breadcrumb={<Link href="/orders">Orders</Link>} />
        <ErrorState message={query.isError ? errorMessage(query.error) : "Order not found."} onRetry={() => void query.refetch()} />
      </div>
    );
  }

  const stops = order.locations ?? [];
  const stale = isStale(order);
  const rider = order.rider;
  const bids = (order.offers ?? []).length;
  const distance = totalDistanceKm(order);

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumb={
          <span>
            <Link href="/orders" className="hover:text-ink">
              Orders
            </Link>{" "}
            / {orderNumber(order)}
          </span>
        }
        title={orderNumber(order)}
        description={
          <span className="flex flex-wrap items-center gap-1.5">
            <OrderStatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
            <TypeBadge type={order.type} />
            {order.isScheduled ? <Badge tone="brand">Scheduled {order.scheduledFor ? when(order.scheduledFor) : ""}</Badge> : null}
            {order.channel ? <Badge tone="neutral">{order.channel.replace(/_/g, " ").toLowerCase()}</Badge> : null}
            <span className="text-ink-muted">Placed {when(order.createdAt)}, {ago(order.createdAt)}</span>
          </span>
        }
        actions={<OrderActions order={order} />}
      />

      {stale ? (
        <div className="rounded-2xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning">
          Still waiting for a rider after {Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60_000)} minutes.{" "}
          {bids ? `${count(bids)} bid${bids === 1 ? "" : "s"} so far.` : "No bids yet."}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <PanelHeader
              title="Route"
              subtitle={`${count(stops.length)} stop${stops.length === 1 ? "" : "s"}${distance ? `, ${distance.toFixed(1)} km` : ""}`}
            />
            <div className="mt-3 h-[22rem] border-y border-line bg-surface sm:h-[26rem]">
              <RouteMap stops={stops} />
            </div>
            <div className="pt-4">
              <StopsTimeline stops={stops} />
            </div>
          </Panel>
          <RiderBids orderId={order._id} askingPrice={order.totalAmount} />
        </div>

        <div className="space-y-4">
          <PartyCard
            title="Customer"
            party={order.user}
            href={order.user ? `/customers/${order.user._id}` : undefined}
            empty="No customer is attached to this order."
          />
          <PartyCard
            title="Courier"
            party={rider}
            href={rider ? `/couriers/${rider._id}` : undefined}
            empty={order.status === "INITIATED" ? `No rider yet. ${bids ? `${count(bids)} bid${bids === 1 ? "" : "s"} waiting below.` : "No bids so far."}` : "No rider was attached."}
            extra={
              rider?.reviews && rider.reviews.count > 0 ? (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                  <Star size={11} className="text-warning" /> {rider.reviews.average.toFixed(1)} from {count(rider.reviews.count)} review{rider.reviews.count === 1 ? "" : "s"}
                </p>
              ) : null
            }
          />

          <Panel>
            <PanelHeader title="Money" subtitle="What the customer pays and where it goes" />
            <div className="px-5 pb-5 pt-3">
              <p className="text-2xl font-black tracking-tight text-ink">{naira(order.totalAmountPayable)}</p>
              <p className="text-xs text-ink-muted">Total payable</p>
              <div className="mt-4">
                <KeyValue
                  columns={2}
                  items={[
                    { label: "Rider fee", value: naira(order.negotiatedAmount) },
                    { label: "Service charge", value: naira(order.serviceCharge) },
                    { label: "Asking price", value: order.totalAmount ? naira(order.totalAmount) : undefined },
                    {
                      label: "Discount",
                      value: order.discountAmount ? `${naira(order.discountAmount)}${order.discount && order.discountType === "PERCENTAGE" ? ` (${percent(order.discount, 0)})` : ""}` : "None",
                    },
                    { label: "Payment", value: <Badge tone={statusTone(order.paymentStatus)}>{paymentLabel(order.paymentStatus)}</Badge> },
                    { label: "Paid on", value: order.paidDate ? when(order.paidDate) : undefined },
                    { label: "Method", value: typeof order.paymentMethod === "string" ? order.paymentMethod : order.channel ? order.channel.replace(/_/g, " ").toLowerCase() : "Wallet" },
                    { label: "Coupon", value: order.coupon?.code ?? undefined },
                  ]}
                />
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Timeline" />
            <div className="px-5 pb-5 pt-3">
              <KeyValue
                columns={2}
                items={[
                  { label: "Placed", value: when(order.createdAt) },
                  { label: "Scheduled for", value: order.isScheduled && order.scheduledFor ? when(order.scheduledFor) : undefined },
                  { label: "Rider accepted", value: order.acceptedAt ? when(order.acceptedAt) : undefined },
                  { label: "Started", value: order.startedAt ? when(order.startedAt) : undefined },
                  { label: "Completed", value: order.completedAt ? when(order.completedAt) : undefined },
                  { label: "Cancelled", value: order.cancelledAt ? `${when(order.cancelledAt)}${order.cancelledBy ? ` by ${order.cancelledBy.toLowerCase()}` : ""}` : undefined },
                  { label: "Type", value: typeLabel(order.type) },
                  {
                    label: "Stops",
                    value: `${count(order.confirmedLocations)} of ${count(order.totalLocations ?? stops.length)} done${order.cancelledLocations ? `, ${count(order.cancelledLocations)} cancelled` : ""}`,
                  },
                ]}
              />
              {order.cancellationReason ? (
                <p className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
                  <span className="font-semibold">Cancellation reason:</span> {order.cancellationReason}
                </p>
              ) : null}
              {order.review?.rating ? (
                <div className="mt-4 rounded-xl border border-line bg-surface px-3 py-2 text-xs">
                  <p className="flex items-center gap-1 font-semibold text-ink">
                    <Star size={12} className="text-warning" /> Customer rated {order.review.rating}/5
                  </p>
                  {order.review.comment ? <p className="mt-1 text-ink-muted">{order.review.comment}</p> : null}
                </div>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
