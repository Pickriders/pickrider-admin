"use client";

import { ArrowRight, ExternalLink, MessageSquareQuote, Package, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Review, ReviewCustomer, ReviewOrder } from "@/lib/admin/api";
import { ago, count, fullName, naira, statusLabel, when } from "@/lib/admin/format";
import { REVIEWS_FETCH_LIMIT, useOrderSummary, useRiderReviews, useUser } from "@/lib/admin/hooks";
import { errorMessage } from "@/lib/admin/http";
import { Avatar, Badge, Button, EmptyState, ErrorState, Panel, PanelHeader, Select, Skeleton, cx, statusTone } from "@/components/kit/primitives";

/**
 * Every review a rider has received: who left it, the stars, what they said
 * and the order it was for. The list comes expanded with the customer and the
 * order; a row that still carries bare ids (older data) is looked up and cached.
 */
export type ReviewSummary = { average: number | null; count: number; distribution: number[] };

const PER_PAGE = 8;
const SORTS = {
  newest: { label: "Newest first", fn: (a: Review, b: Review) => +new Date(b.createdAt) - +new Date(a.createdAt) },
  oldest: { label: "Oldest first", fn: (a: Review, b: Review) => +new Date(a.createdAt) - +new Date(b.createdAt) },
  highest: { label: "Highest rated", fn: (a: Review, b: Review) => b.rating - a.rating || +new Date(b.createdAt) - +new Date(a.createdAt) },
  lowest: { label: "Lowest rated", fn: (a: Review, b: Review) => a.rating - b.rating || +new Date(b.createdAt) - +new Date(a.createdAt) },
} as const;
type SortId = keyof typeof SORTS;

const TYPE_LABEL: Record<string, string> = { SINGLE: "Single", BATCH: "Batch", BULK: "Bulk" };

/** Tone follows the same scale everywhere: 4 to 5 good, 3 middling, below poor. */
export function ratingTone(rating: number): "success" | "warning" | "danger" {
  return rating >= 4 ? "success" : rating >= 3 ? "warning" : "danger";
}

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} className={star <= Math.round(value) ? "fill-warning text-warning" : "fill-line text-line"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function CustomerCell({ customer }: { customer: string | ReviewCustomer }) {
  if (typeof customer === "string") return <CustomerLookup userId={customer} />;
  return <CustomerView customer={customer} />;
}

function CustomerLookup({ userId }: { userId: string }) {
  const user = useUser(userId);
  if (user.isLoading) {
    return (
      <span className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <span className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </span>
      </span>
    );
  }
  if (!user.data) {
    return (
      <span className="flex items-center gap-3">
        <Avatar name="?" size={40} />
        <span className="min-w-0">
          <span className="block text-sm font-bold text-ink">Customer</span>
          <span className="block font-mono text-[11px] text-ink-faint">…{userId.slice(-6)}</span>
        </span>
      </span>
    );
  }
  return <CustomerView customer={user.data} />;
}

function CustomerView({ customer }: { customer: ReviewCustomer }) {
  const name = fullName(customer) || "Customer";
  return (
    <Link href={`/customers/${customer._id}`} className="group flex min-w-0 items-center gap-3">
      <Avatar src={customer.photo} name={name} size={40} />
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-bold text-ink group-hover:text-brand-dark">
          <span className="truncate">{name}</span>
          <ExternalLink size={11} className="shrink-0 text-ink-faint" />
        </span>
        <span className="block truncate text-[11px] text-ink-muted">{customer.phone || "Customer"}</span>
      </span>
    </Link>
  );
}

function OrderChip({ order }: { order: string | ReviewOrder }) {
  if (typeof order === "string") return <OrderLookup orderId={order} />;
  return <OrderView order={order} />;
}

function OrderLookup({ orderId }: { orderId: string }) {
  const order = useOrderSummary(orderId);
  if (order.isLoading) return <Skeleton className="h-9 w-56 rounded-xl" />;
  if (!order.data) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
        <Package size={13} /> Order …{orderId.slice(-6)}
      </span>
    );
  }
  return <OrderView order={order.data} />;
}

function OrderView({ order: o }: { order: ReviewOrder }) {
  return (
    <Link
      href={`/orders/${o._id}`}
      className="group inline-flex max-w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs transition-colors hover:border-line-strong hover:bg-card"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-dark">
        <Package size={13} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 font-bold text-ink">
          <span className="truncate">#{o.orderNumber ?? o._id.slice(-6)}</span>
          <Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge>
        </span>
        <span className="block truncate text-ink-muted">
          {TYPE_LABEL[o.type] ?? o.type} · {naira(o.totalAmountPayable)}
          {o.completedAt ? ` · ${when(o.completedAt)}` : ""}
        </span>
      </span>
      <ArrowRight size={13} className="ml-auto shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const comment = review.comment?.trim();
  return (
    <li className="py-5 first:pt-2 last:pb-2">
      <article className="grid grid-cols-1 gap-4 md:grid-cols-[15rem_1fr] md:gap-6">
        <div className="flex items-start justify-between gap-3 md:flex-col md:justify-start">
          <CustomerCell customer={review.userId} />
          <div className="shrink-0 text-right md:text-left">
            <Stars value={review.rating} />
            <p className="mt-1 text-[11px] text-ink-faint" title={when(review.createdAt)}>
              {ago(review.createdAt)}
            </p>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={ratingTone(review.rating)} className="gap-1">
              <Star size={11} className="fill-current" /> {review.rating}.0
            </Badge>
            <span className="text-xs text-ink-muted">{when(review.createdAt)}</span>
          </div>
          {comment ? (
            <blockquote className="relative mt-3 rounded-2xl bg-surface px-4 py-3 text-sm leading-relaxed text-ink">
              <MessageSquareQuote size={16} className="absolute -left-1.5 -top-1.5 text-ink-faint/60" aria-hidden />
              <p className="whitespace-pre-line">{comment}</p>
            </blockquote>
          ) : (
            <p className="mt-3 text-sm italic text-ink-faint">Rated without a comment.</p>
          )}
          <div className="mt-3">
            <OrderChip order={review.orderId} />
          </div>
        </div>
      </article>
    </li>
  );
}

export function RiderReviews({
  riderId,
  summary,
  rating,
  onRatingChange,
}: {
  riderId: string;
  summary?: ReviewSummary;
  /** Active star filter, kept by the parent (usually in the URL). */
  rating?: number;
  onRatingChange: (rating?: number) => void;
}) {
  const reviews = useRiderReviews(riderId);
  const [sort, setSort] = useState<SortId>("newest");
  const [page, setPage] = useState(1);

  const all = useMemo(() => reviews.data?.items ?? [], [reviews.data]);
  const total = reviews.data?.total ?? summary?.count ?? 0;
  const truncated = total > all.length && all.length >= REVIEWS_FETCH_LIMIT;

  const filtered = useMemo(() => {
    const rows = rating ? all.filter((r) => r.rating === rating) : all;
    return [...rows].sort(SORTS[sort].fn);
  }, [all, rating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  useEffect(() => setPage(1), [rating, sort, riderId]);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Counts per star come from the loaded rows so the chips always match the list.
  const perStar = useMemo(() => {
    const out = [0, 0, 0, 0, 0];
    for (const r of all) if (r.rating >= 1 && r.rating <= 5) out[r.rating - 1] += 1;
    return out;
  }, [all]);

  const average = summary?.average ?? (all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : null);
  const loading = reviews.isLoading && !reviews.data;

  return (
    <Panel>
      <PanelHeader
        title="Customer reviews"
        subtitle={
          loading
            ? "Loading reviews…"
            : total
              ? `${count(total)} review${total === 1 ? "" : "s"}${average != null ? ` · ${average.toFixed(1)} average` : ""}${truncated ? ` · showing the latest ${count(all.length)}` : ""}`
              : "Customers rate the rider after each delivery"
        }
        action={
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortId)} className="h-9 w-auto min-w-[9.5rem] text-xs" aria-label="Sort reviews">
            {(Object.keys(SORTS) as SortId[]).map((id) => (
              <option key={id} value={id}>
                {SORTS[id].label}
              </option>
            ))}
          </Select>
        }
      />

      <div className="admin-scroll -mx-1 mt-4 flex gap-1.5 overflow-x-auto px-6 pb-1">
        <button
          type="button"
          onClick={() => onRatingChange(undefined)}
          className={cx(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
            !rating ? "border-transparent bg-ink text-card" : "border-line bg-card text-ink-muted hover:text-ink",
          )}
        >
          All <span className={cx("ml-1 tabular-nums", !rating ? "text-card/70" : "text-ink-faint")}>{count(all.length)}</span>
        </button>
        {[5, 4, 3, 2, 1].map((star) => {
          const active = rating === star;
          const n = perStar[star - 1];
          return (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(active ? undefined : star)}
              disabled={!n && !active}
              className={cx(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                active ? "border-transparent bg-ink text-card" : "border-line bg-card text-ink-muted hover:text-ink",
              )}
            >
              {star} <Star size={11} className={active ? "fill-card text-card" : "fill-warning text-warning"} />
              <span className={cx("ml-0.5 tabular-nums", active ? "text-card/70" : "text-ink-faint")}>{count(n)}</span>
            </button>
          );
        })}
      </div>

      <div className="px-6 pb-5 pt-3">
        {reviews.isError ? (
          <ErrorState message={errorMessage(reviews.error, "Could not load this rider's reviews.")} onRetry={() => void reviews.refetch()} />
        ) : loading ? (
          <ul className="divide-y divide-line">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="py-5 first:pt-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[15rem_1fr] md:gap-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-9 w-56" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : !all.length ? (
          <EmptyState compact icon={Star} title="No reviews yet" description="Once a customer rates this rider after a delivery, the review shows up here with the order it was for." />
        ) : !filtered.length ? (
          <EmptyState
            compact
            icon={Star}
            title={`No ${rating}-star reviews`}
            description="Pick another rating or clear the filter to see every review."
            action={
              <Button size="sm" variant="outline" onClick={() => onRatingChange(undefined)}>
                Show all reviews
              </Button>
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-line">
              {visible.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </ul>
            {totalPages > 1 ? (
              <div className="mt-2 flex flex-col-reverse items-center justify-between gap-3 border-t border-line pt-4 sm:flex-row">
                <p className="text-xs text-ink-muted">
                  Showing <span className="font-semibold text-ink">{(page - 1) * PER_PAGE + 1}</span> to{" "}
                  <span className="font-semibold text-ink">{Math.min(page * PER_PAGE, filtered.length)}</span> of <span className="font-semibold text-ink">{count(filtered.length)}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="text-xs tabular-nums text-ink-muted">
                    {page} / {totalPages}
                  </span>
                  <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Panel>
  );
}
