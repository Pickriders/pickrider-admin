"use client";

import { useAdminRealtime } from "@/lib/admin/realtime";
import { cn } from "@/lib/utils";

/** Socket status for the console: green when the live feed is connected, polling otherwise. */
export const LiveIndicator = () => {
  const live = useAdminRealtime();
  return (
    <span
      title={live.connected ? "Live updates connected" : "Live feed offline, refreshing every 20 seconds"}
      className={cn(
        "hidden items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold sm:inline-flex",
        live.connected ? "border-success/30 bg-success-soft text-success" : "border-line bg-surface text-ink-muted",
      )}
    >
      <span className={cn("relative h-2 w-2 rounded-full", live.connected ? "bg-success admin-live-dot" : "bg-ink-faint")} />
      {live.connected ? "Live" : "Polling"}
    </span>
  );
};
