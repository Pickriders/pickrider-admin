"use client";

import { HandoffsTable } from "@/components/handoffs/handoffs-table";

/**
 * Orders this rider handed to someone else after pickup ("Handed over") or took over from another
 * rider ("Took over"). Counted handoffs also show in the insights as cancellations. There is no
 * per-rider handoff summary endpoint yet, so this tab is the list only (CLAUDE.md §6: no client
 * rollups from list calls).
 */
export function RiderHandoffs({ riderId }: { riderId: string }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-muted">
        Handed over: this rider asked another rider to finish the order. Took over: they finished someone else&apos;s. Counted handoffs also show in the insights as cancellations.
      </p>
      <HandoffsTable mode="all" riderId={riderId} csvName={`rider-${riderId}-handoffs`} />
    </div>
  );
}
