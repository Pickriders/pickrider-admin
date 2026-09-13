"use client";

import Link from "next/link";
import { ArrowRight, Bike, Download, Star } from "lucide-react";

import { downloadCsv, toCsv, type RangeQuery } from "@/lib/admin/api";
import { useTopRiders } from "@/lib/admin/hooks";
import { count, fullName, naira, nairaCompact } from "@/lib/admin/format";
import { Avatar, Badge, Button, EmptyState, Panel, PanelHeader, Skeleton } from "@/components/kit/primitives";

/**
 * Riders ranked by completed deliveries in the window. The bar under each name
 * is relative to the top rider so the spread reads at a glance.
 */
export function TopRiders({ query, limit = 6, exportable, subtitle }: { query: RangeQuery; limit?: number; exportable?: boolean; subtitle?: string }) {
  const top = useTopRiders({ ...query, limit });
  const rows = top.data ?? [];
  const loading = top.isLoading && !top.data;
  const max = rows[0]?.deliveries || 1;

  const exportCsv = () => {
    if (!rows.length) return;
    const shaped = rows.map((row, index) => ({
      rank: index + 1,
      name: fullName(row.rider) || row.riderId,
      phone: row.rider?.phone ?? "",
      deliveries: row.deliveries,
      cancelled: row.cancelled,
      rating: row.rating != null ? row.rating.toFixed(2) : "",
      reviews: row.reviews,
      riderFees: naira(row.riderFees, 2),
      volume: naira(row.volume, 2),
    }));
    downloadCsv(
      "top-riders.csv",
      toCsv(shaped, [
        { key: "rank", label: "Rank" },
        { key: "name", label: "Rider" },
        { key: "phone", label: "Phone" },
        { key: "deliveries", label: "Deliveries" },
        { key: "cancelled", label: "Cancelled" },
        { key: "rating", label: "Rating" },
        { key: "reviews", label: "Reviews" },
        { key: "riderFees", label: "Rider fees" },
        { key: "volume", label: "Order volume" },
      ]),
    );
  };

  return (
    <Panel>
      <PanelHeader
        title="Top riders"
        subtitle={subtitle ?? "By completed deliveries in this window"}
        action={
          <div className="flex items-center gap-2">
            {exportable ? (
              <Button variant="outline" size="sm" icon={Download} onClick={exportCsv} disabled={!rows.length}>
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            ) : null}
            <Link href="/couriers" className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark hover:underline">
              All riders <ArrowRight size={13} />
            </Link>
          </div>
        }
      />
      <div className="px-2 pb-2 pt-1">
        {loading ? (
          <div className="space-y-2 px-3 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !rows.length ? (
          <EmptyState compact icon={Bike} title="No completed deliveries in this window" description="Riders appear here once they complete an order in the selected dates." />
        ) : (
          <ol className="divide-y divide-line">
            {rows.map((row, index) => {
              const name = fullName(row.rider) || "Unknown rider";
              return (
                <li key={row.riderId}>
                  <Link href={`/couriers/${row.riderId}/details`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface">
                    <span className="w-5 text-center text-xs font-black text-ink-faint">{index + 1}</span>
                    <Avatar src={row.rider?.photo} name={name} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-ink">{name}</p>
                        {row.rider?.isOnline ? (
                          <Badge tone="success" dot>
                            Online
                          </Badge>
                        ) : null}
                        {row.rider?.status === "SUSPENDED" || row.rider?.status === "BANNED" ? <Badge tone="danger">{row.rider.status === "BANNED" ? "Banned" : "Suspended"}</Badge> : null}
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(4, (row.deliveries / max) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="hidden shrink-0 text-right text-xs text-ink-muted sm:block">
                      <p>
                        <span className="font-semibold text-ink">{count(row.deliveries)}</span> delivered
                        {row.cancelled ? <span className="text-danger"> · {count(row.cancelled)} cancelled</span> : null}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1">
                        <Star size={11} className={row.rating != null ? "text-warning" : "text-ink-faint"} />
                        {row.rating != null ? `${row.rating.toFixed(1)} (${count(row.reviews)})` : "No ratings"}
                      </p>
                    </div>
                    <div className="w-20 shrink-0 text-right sm:w-24">
                      <p className="text-sm font-black text-ink" title={naira(row.riderFees)}>
                        {nairaCompact(row.riderFees)}
                      </p>
                      <p className="text-[11px] text-ink-faint sm:hidden">{count(row.deliveries)} delivered</p>
                      <p className="hidden text-[11px] text-ink-faint sm:block">rider fees</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Panel>
  );
}
