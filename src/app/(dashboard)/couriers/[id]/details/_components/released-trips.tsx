"use client";

import { Undo2 } from "lucide-react";
import Link from "next/link";

import { Badge, EmptyState, ErrorState, Panel, PanelHeader, Skeleton, StatCard, StatGrid } from "@/components/kit";
import type { RiderReleaseItem } from "@/lib/admin/api";
import { count, when } from "@/lib/admin/format";
import { useRiderReleases } from "@/lib/admin/hooks";

/** Rider reasons ("Can't make it") and the store's own reasons ("Find another rider"). */
const REASON_LABEL: Record<string, string> = {
  BIKE_PROBLEM: "Bike problem",
  EMERGENCY: "Emergency",
  TOO_FAR: "Too far",
  STORE_ISSUE: "Store issue",
  RIDER_CANT_GO: "Rider can't go",
  RIDER_NOT_RESPONDING: "Rider not responding",
  RIDER_TOO_FAR: "Rider too far",
  OTHER: "Other",
};

const BY_LABEL: Record<string, string> = {
  RIDER: "Rider released it",
  OWNER: "Store replaced the rider",
  ADMIN: "Pickriders replaced the rider",
};

function ReleaseRow({ release }: { release: RiderReleaseItem }) {
  const byRider = release.initiatedBy === "RIDER";
  return (
    <li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/orders/${release.orderId}`} className="text-sm font-bold text-brand-dark hover:underline">
            {release.orderNumber ? `#${release.orderNumber}` : "View order"}
          </Link>
          <span className="text-sm font-semibold text-ink">{REASON_LABEL[release.reason] ?? release.reason}</span>
          {byRider ? (
            <Badge tone={release.counted ? "danger" : "success"}>{release.counted ? "Counted" : "Free"}</Badge>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-ink-muted">{BY_LABEL[release.initiatedBy] ?? release.initiatedBy}</p>
        {release.note ? <p className="mt-1 break-words text-xs text-ink">&ldquo;{release.note}&rdquo;</p> : null}
      </div>
      <p className="shrink-0 text-xs tabular-nums text-ink-faint">{when(release.createdAt)}</p>
    </li>
  );
}

/**
 * Trips this rider was taken off before pickup. "Counted" is the rider's own release after the
 * free two minutes: it counts as a cancellation, and only three are allowed per Lagos day.
 */
export function ReleasedTrips({ riderId }: { riderId: string }) {
  const query = useRiderReleases(riderId);
  const data = query.data;
  const counts = data?.counts;
  const loading = query.isLoading;

  if (query.error && !data) return <ErrorState message="Could not load released trips." onRetry={() => query.refetch()} />;

  return (
    <div className="space-y-4">
      <StatGrid columns={3}>
        <StatCard
          label="Released today"
          value={count(counts?.today)}
          icon={Undo2}
          loading={loading}
          hint={counts ? `${count(counts.countedToday)} counted · ${count(data?.releasesLeftToday)} left today` : undefined}
        />
        <StatCard label="Last 7 days" value={count(counts?.last7Days)} loading={loading} hint={counts ? `${count(counts.countedLast7Days)} counted` : undefined} />
        <StatCard label="Last 30 days" value={count(counts?.last30Days)} loading={loading} hint={counts ? `${count(counts.countedLast30Days)} counted` : undefined} />
      </StatGrid>

      <Panel>
        <PanelHeader title="Released trips" subtitle="Free within 2 minutes of accepting. After that it counts as a cancellation." />
        <div className="px-5 pb-3 pt-1">
          {loading ? (
            <Skeleton className="my-3 h-24 w-full" />
          ) : !data?.releases.length ? (
            <EmptyState compact icon={Undo2} title="No released trips" description="Trips the rider gives back before pickup, or the store takes off them, show up here." />
          ) : (
            <ul className="divide-y divide-line">
              {data.releases.map((release) => (
                <ReleaseRow key={release._id} release={release} />
              ))}
            </ul>
          )}
        </div>
      </Panel>
    </div>
  );
}
