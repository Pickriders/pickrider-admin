"use client";

import Link from "next/link";
import { Bike, CheckCircle2, PackageX, Truck, UserX, Wifi, type LucideIcon } from "lucide-react";

import type { Overview } from "@/lib/admin/api";
import { count } from "@/lib/admin/format";
import { Panel, Skeleton, cx } from "@/components/kit/primitives";

/**
 * What is happening this second: live orders by stage, riders online, and
 * today's completed and cancelled counts. Six tiles, one calm row.
 */
type Tile = { key: string; label: string; value: number; sub?: string; href: string; icon: LucideIcon; accent: "brand" | "warning" | "danger" | "info" | "success"; urgent?: boolean };

const ACCENT: Record<Tile["accent"], string> = {
  brand: "bg-brand-soft text-brand-dark",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
};

export function LiveRow({ live, loading }: { live?: Overview["live"]; loading: boolean }) {
  const stale = live?.awaitingRiderStale ?? 0;
  const tiles: Tile[] = [
    { key: "awaiting", label: "Awaiting a rider", value: live?.awaitingRider ?? 0, sub: stale ? `${count(stale)} waiting too long` : undefined, href: "/orders?status=INITIATED", icon: UserX, accent: stale ? "danger" : "warning", urgent: stale > 0 },
    { key: "accepted", label: "Rider assigned", value: live?.accepted ?? 0, href: "/orders?status=ACCEPTED", icon: Bike, accent: "brand" },
    { key: "ongoing", label: "In transit", value: live?.ongoing ?? 0, href: "/orders?status=ON_GOING", icon: Truck, accent: "info" },
    { key: "online", label: "Riders online", value: live?.ridersOnline ?? 0, href: "/couriers?isOnline=true", icon: Wifi, accent: "success" },
    { key: "completed", label: "Completed today", value: live?.completedToday ?? 0, sub: `${count(live?.placedToday)} placed today`, href: "/orders?status=COMPLETED", icon: CheckCircle2, accent: "success" },
    { key: "cancelled", label: "Cancelled today", value: live?.cancelledToday ?? 0, href: "/orders?status=CANCELLED", icon: PackageX, accent: "danger" },
  ];

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-ink">Live now</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Right now on the platform, updated as orders move</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-6 pt-4 sm:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.key}
              href={tile.href}
              className={cx(
                "group flex min-w-0 items-center gap-3 rounded-2xl border p-3.5 transition-colors hover:bg-surface",
                tile.urgent ? "border-danger/40 bg-danger-soft/30" : "border-line",
              )}
            >
              <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", ACCENT[tile.accent])}>
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className={cx("block text-2xl font-black leading-none tracking-tight tabular-nums", tile.urgent ? "text-danger" : "text-ink")}>
                  {loading ? <Skeleton className="h-6 w-10" /> : count(tile.value)}
                </span>
                <span className="mt-1 block truncate text-xs font-semibold text-ink-muted">{tile.label}</span>
                {tile.sub ? <span className={cx("block truncate text-[11px]", tile.urgent ? "font-semibold text-danger" : "text-ink-faint")}>{tile.sub}</span> : null}
              </span>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}
